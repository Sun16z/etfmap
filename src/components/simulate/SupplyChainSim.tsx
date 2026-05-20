'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { Zap, AlertTriangle, Activity, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AI_SUPPLY_CHAIN, type SupplyNode, type SupplyEdge } from '@/lib/etf-holdings'

type ImpactMap = Record<string, number>  // node id → impact 0-1

function propagateImpact(
  sourceId: string,
  shockLevel: number,
  nodes: SupplyNode[],
  edges: SupplyEdge[],
): ImpactMap {
  const impact: ImpactMap = {}
  impact[sourceId] = shockLevel

  // BFS through downstream edges
  const queue = [sourceId]
  const visited = new Set<string>()

  while (queue.length > 0) {
    const current = queue.shift()!
    if (visited.has(current)) continue
    visited.add(current)

    // Find all edges where current is source
    edges.filter(e => e.source === current).forEach(e => {
      const prevImpact = impact[current] ?? 0
      const propagated = prevImpact * e.strength * 0.8  // attenuation
      const existing = impact[e.target] ?? 0
      if (propagated > existing) {
        impact[e.target] = propagated
        queue.push(e.target)
      }
    })

    // Also propagate backwards (upstream suppliers are indirectly affected by demand)
    edges.filter(e => e.target === current).forEach(e => {
      const prevImpact = impact[current] ?? 0
      const propagated = prevImpact * e.strength * 0.4  // weaker upstream
      const existing = impact[e.source] ?? 0
      if (propagated > existing) {
        impact[e.source] = propagated
        queue.push(e.source)
      }
    })
  }

  return impact
}

const IMPACT_COLOR = (impact: number): string => {
  if (impact === 0) return 'rgba(148,163,184,0.3)'
  if (impact > 0.6) return '#f43f5e'
  if (impact > 0.3) return '#f59e0b'
  if (impact > 0.1) return '#fbbf24'
  return '#06b6d4'
}

const ROLE_COLOR: Record<string, string> = {
  '上游': '#8b5cf6',
  '中游': '#3b82f6',
  '下游': '#06b6d4',
  '終端': '#10b981',
}

export default function SupplyChainSim() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [selectedSource, setSelectedSource] = useState<string | null>('2330')
  const [shockLevel, setShockLevel] = useState(0.5)
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)

  const nodes = AI_SUPPLY_CHAIN.nodes
  const edges = AI_SUPPLY_CHAIN.edges

  const impact = useMemo(() => {
    if (!selectedSource) return {}
    return propagateImpact(selectedSource, shockLevel, nodes, edges)
  }, [selectedSource, shockLevel, nodes, edges])

  // Layout: position nodes by role column
  const nodePositions = useMemo(() => {
    const roleOrder: Record<string, number> = { '上游': 0, '中游': 1, '下游': 2, '終端': 3 }
    const cols: Record<number, SupplyNode[]> = { 0: [], 1: [], 2: [], 3: [] }
    nodes.forEach(n => cols[roleOrder[n.role] ?? 3].push(n))

    const pos: Record<string, { x: number; y: number }> = {}
    Object.entries(cols).forEach(([col, colNodes]) => {
      colNodes.forEach((n, i) => {
        pos[n.id] = {
          x: (parseInt(col) + 0.5) / 4,
          y: (i + 1) / (colNodes.length + 1),
        }
      })
    })
    return pos
  }, [nodes])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const W = canvas.clientWidth
    const H = canvas.clientHeight
    canvas.width = W * dpr
    canvas.height = H * dpr
    ctx.scale(dpr, dpr)
    ctx.clearRect(0, 0, W, H)

    const px = (node: SupplyNode) => (nodePositions[node.id]?.x ?? 0.5) * W
    const py = (node: SupplyNode) => (nodePositions[node.id]?.y ?? 0.5) * H

    // Draw edges
    edges.forEach(edge => {
      const src = nodes.find(n => n.id === edge.source)
      const tgt = nodes.find(n => n.id === edge.target)
      if (!src || !tgt) return

      const srcImpact = impact[src.id] ?? 0
      const alpha = selectedSource ? Math.max(0.1, srcImpact) : 0.25

      ctx.strokeStyle = srcImpact > 0.3
        ? `rgba(244,63,94,${alpha * 0.8})`
        : `rgba(148,163,184,${alpha * 0.4})`
      ctx.lineWidth = edge.strength * 2
      ctx.setLineDash(srcImpact > 0.1 ? [] : [4, 4])
      ctx.beginPath()
      ctx.moveTo(px(src), py(src))

      // Bezier curve
      const cpX = (px(src) + px(tgt)) / 2
      ctx.bezierCurveTo(cpX, py(src), cpX, py(tgt), px(tgt), py(tgt))
      ctx.stroke()
      ctx.setLineDash([])

      // Arrow at target
      const angle = Math.atan2(py(tgt) - py(src), px(tgt) - px(src))
      const r = 14
      const ax = px(tgt) - Math.cos(angle) * r
      const ay = py(tgt) - Math.sin(angle) * r
      ctx.fillStyle = srcImpact > 0.3 ? 'rgba(244,63,94,0.7)' : 'rgba(148,163,184,0.3)'
      ctx.beginPath()
      ctx.moveTo(ax, ay)
      ctx.lineTo(ax - 6 * Math.cos(angle - 0.4), ay - 6 * Math.sin(angle - 0.4))
      ctx.lineTo(ax - 6 * Math.cos(angle + 0.4), ay - 6 * Math.sin(angle + 0.4))
      ctx.closePath()
      ctx.fill()
    })

    // Draw nodes
    nodes.forEach(node => {
      const x = px(node)
      const y = py(node)
      const nodeImpact = impact[node.id] ?? 0
      const isSelected = selectedSource === node.id
      const isHovered = hoveredNode === node.id
      const r = isSelected ? 16 : 12

      // Glow for high impact
      if (nodeImpact > 0.2) {
        ctx.shadowColor = IMPACT_COLOR(nodeImpact)
        ctx.shadowBlur = nodeImpact * 20
      }

      // Circle
      ctx.beginPath()
      ctx.arc(x, y, r, 0, Math.PI * 2)
      ctx.fillStyle = isSelected ? '#8b5cf6' : IMPACT_COLOR(nodeImpact)
      ctx.fill()
      ctx.shadowBlur = 0

      if (isSelected || isHovered) {
        ctx.strokeStyle = '#ffffff'
        ctx.lineWidth = 1.5
        ctx.stroke()
      }

      // Market cap size indicator
      if (node.marketCap) {
        const capR = Math.min(r + 4, r + (node.marketCap / 28500) * 8)
        ctx.beginPath()
        ctx.arc(x, y, capR, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(255,255,255,0.08)`
        ctx.lineWidth = 1
        ctx.stroke()
      }

      // Label
      ctx.fillStyle = nodeImpact > 0.3 ? '#fca5a5' : isSelected ? '#c4b5fd' : '#94a3b8'
      ctx.font = `${isSelected ? 'bold ' : ''}10px sans-serif`
      ctx.textAlign = 'center'
      ctx.fillText(node.name, x, y + r + 12)

      // Impact badge
      if (nodeImpact > 0.05) {
        ctx.fillStyle = IMPACT_COLOR(nodeImpact)
        ctx.font = '9px monospace'
        ctx.fillText(`-${Math.round(nodeImpact * 100)}%`, x, y + r + 22)
      }
    })
  }, [nodes, edges, nodePositions, impact, selectedSource, hoveredNode])

  // Mouse click handler
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const mx = e.clientX - rect.left
    const my = e.clientY - rect.top
    const W = rect.width
    const H = rect.height

    for (const node of nodes) {
      const x = (nodePositions[node.id]?.x ?? 0.5) * W
      const y = (nodePositions[node.id]?.y ?? 0.5) * H
      const dist = Math.sqrt((mx - x) ** 2 + (my - y) ** 2)
      if (dist < 18) {
        setSelectedSource(prev => prev === node.id ? null : node.id)
        return
      }
    }
    setSelectedSource(null)
  }

  const handleCanvasMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const mx = e.clientX - rect.left
    const my = e.clientY - rect.top
    const W = rect.width
    const H = rect.height

    let found: string | null = null
    for (const node of nodes) {
      const x = (nodePositions[node.id]?.x ?? 0.5) * W
      const y = (nodePositions[node.id]?.y ?? 0.5) * H
      if (Math.sqrt((mx - x) ** 2 + (my - y) ** 2) < 18) {
        found = node.id
        break
      }
    }
    setHoveredNode(found)
  }

  const affectedNodes = nodes
    .filter(n => (impact[n.id] ?? 0) > 0.05)
    .sort((a, b) => (impact[b.id] ?? 0) - (impact[a.id] ?? 0))

  const sourceNode = nodes.find(n => n.id === selectedSource)

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: 'linear-gradient(135deg, #f59e0b, #f43f5e)' }}>
          <Zap size={16} className="text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-white">供應鏈衝擊模擬器</h1>
          <p className="text-xs text-slate-400">點選節點設定衝擊源，模擬台灣 AI 供應鏈的波及效應</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Controls */}
        <div className="space-y-4">
          {/* Shock source */}
          <div className="glass p-4 space-y-3">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">衝擊來源</p>
            <div className="grid grid-cols-2 gap-1.5">
              {nodes.map(n => (
                <button key={n.id}
                  onClick={() => setSelectedSource(prev => prev === n.id ? null : n.id)}
                  className={cn('text-[10px] px-2 py-1.5 rounded-md text-left transition-all', selectedSource === n.id ? 'text-white' : 'text-slate-400 hover:text-slate-200')}
                  style={selectedSource === n.id
                    ? { background: ROLE_COLOR[n.role] + '33', border: `1px solid ${ROLE_COLOR[n.role]}66` }
                    : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="font-semibold">{n.name}</div>
                  <div style={{ color: ROLE_COLOR[n.role] }}>{n.role}</div>
                </button>
              ))}
            </div>

            {selectedSource && (
              <button onClick={() => setSelectedSource(null)}
                className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors">
                <RotateCcw size={11} /> 清除選擇
              </button>
            )}
          </div>

          {/* Shock level */}
          <div className="glass p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">衝擊強度</p>
              <span className="text-sm font-bold font-mono"
                style={{ color: shockLevel > 0.6 ? '#f43f5e' : shockLevel > 0.3 ? '#f59e0b' : '#06b6d4' }}>
                {Math.round(shockLevel * 100)}%
              </span>
            </div>
            <input type="range" min={0} max={100} value={Math.round(shockLevel * 100)}
              onChange={e => setShockLevel(parseInt(e.target.value) / 100)}
              className="w-full accent-violet-500" />
            <div className="flex justify-between text-[9px] text-slate-600">
              <span>輕微</span><span>嚴重</span>
            </div>
          </div>

          {/* Role legend */}
          <div className="glass p-3 space-y-1.5">
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">供應鏈層級</p>
            {Object.entries(ROLE_COLOR).map(([role, color]) => (
              <div key={role} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                <span className="text-[10px] text-slate-400">{role}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Graph */}
        <div className="lg:col-span-3 space-y-3">
          <div className="glass p-2 relative">
            <canvas
              ref={canvasRef}
              className="w-full rounded-lg cursor-crosshair"
              style={{ height: '380px' }}
              onClick={handleCanvasClick}
              onMouseMove={handleCanvasMove}
              onMouseLeave={() => setHoveredNode(null)}
            />
            {/* Role column headers */}
            <div className="absolute top-3 left-0 w-full flex px-4 pointer-events-none">
              {['上游（IC設計）', '中游（製造）', '下游（組裝）', '終端'].map((label, i) => (
                <div key={i} className="flex-1 text-center">
                  <span className="text-[9px] text-slate-600 uppercase tracking-wider">{label}</span>
                </div>
              ))}
            </div>
            {!selectedSource && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <p className="text-xs text-slate-500 bg-black/40 px-3 py-1.5 rounded-lg">← 點選節點或左側選擇衝擊來源</p>
              </div>
            )}
          </div>

          {/* Affected companies */}
          {affectedNodes.length > 0 && (
            <div className="glass p-4 space-y-3">
              <div className="flex items-center gap-2">
                <AlertTriangle size={13} className="text-amber-400" />
                <p className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  波及企業（{sourceNode?.name} 衝擊 {Math.round(shockLevel * 100)}%）
                </p>
              </div>
              <div className="space-y-2">
                {affectedNodes.map(n => {
                  const imp = impact[n.id] ?? 0
                  return (
                    <div key={n.id} className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                        style={{ background: ROLE_COLOR[n.role] + '33' }}>
                        <Activity size={8} style={{ color: ROLE_COLOR[n.role] }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-xs text-white font-medium">{n.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] text-slate-500">{n.sector}</span>
                            <span className="text-xs font-mono font-bold tabular-nums"
                              style={{ color: IMPACT_COLOR(imp) }}>
                              -{Math.round(imp * 100)}%
                            </span>
                          </div>
                        </div>
                        <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                          <div className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${imp * 100}%`, background: IMPACT_COLOR(imp) }} />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {affectedNodes.filter(n => (impact[n.id] ?? 0) > 0.5).length > 0 && (
                <div className="flex items-start gap-2 p-2 rounded-lg" style={{ background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.15)' }}>
                  <AlertTriangle size={12} className="text-red-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-red-300">
                    {affectedNodes.filter(n => (impact[n.id] ?? 0) > 0.5).map(n => n.name).join('、')} 受衝擊超過 50%，
                    持有相關 ETF 可能有顯著下行風險。
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
