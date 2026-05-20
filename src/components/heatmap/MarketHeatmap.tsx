'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import * as d3 from 'd3'
import { changeBg } from '@/lib/utils'
import { Thermometer, Loader2, RefreshCw } from 'lucide-react'
import type { HeatmapNode } from '@/types'

const PERIOD_TABS = ['單日', '單週', '單月']
const PERIOD_MAP = ['daily', 'weekly', 'monthly']

function getTextColor(changePct: number): string {
  return Math.abs(changePct) > 2 ? '#fff' : 'rgba(255,255,255,0.85)'
}

export default function MarketHeatmap() {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [period, setPeriod] = useState(0)
  const [tooltip, setTooltip] = useState<{ x: number; y: number; name: string; pct: number } | null>(null)
  const [data, setData] = useState<HeatmapNode | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updatedAt, setUpdatedAt] = useState('')

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/heatmap?period=${PERIOD_MAP[period]}`)
      const json = await res.json()
      if (json.error) throw new Error(json.error)
      setData(json.data)
      setUpdatedAt(json.updatedAt)
    } catch (e: any) {
      setError(e.message ?? '無法載入熱力圖')
    } finally {
      setLoading(false)
    }
  }, [period])

  useEffect(() => { fetchData() }, [period])

  useEffect(() => {
    if (!data || !svgRef.current || !containerRef.current) return

    const container = containerRef.current
    const w = container.clientWidth
    const h = Math.max(420, window.innerHeight * 0.55)

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()
    svg.attr('width', w).attr('height', h)

    const root = d3.hierarchy(data)
      .sum(d => (d.children ? 0 : Math.max((d as any).value, 0.05)))
      .sort((a, b) => (b.value ?? 0) - (a.value ?? 0))

    d3.treemap<any>()
      .size([w, h])
      .paddingOuter(4)
      .paddingInner(2)
      .paddingTop(22)
      .round(true)(root)

    const nodes = svg.selectAll('g')
      .data(root.descendants())
      .join('g')
      .attr('transform', d => `translate(${(d as any).x0},${(d as any).y0})`)

    const leaves = nodes.filter(d => !d.children)

    leaves.append('rect')
      .attr('width', d => Math.max(0, (d as any).x1 - (d as any).x0))
      .attr('height', d => Math.max(0, (d as any).y1 - (d as any).y0))
      .attr('rx', 4)
      .attr('fill', d => changeBg((d.data as any).changePct, 1.4))
      .attr('stroke', 'rgba(7,8,15,0.4)')
      .attr('stroke-width', 1)
      .style('cursor', 'pointer')
      .on('mousemove', function (event, d) {
        const data = d.data as any
        const rect = container.getBoundingClientRect()
        setTooltip({
          x: event.clientX - rect.left,
          y: event.clientY - rect.top - 10,
          name: data.name,
          pct: data.changePct,
        })
      })
      .on('mouseleave', () => setTooltip(null))

    leaves.each(function (d) {
      const node = d3.select(this)
      const cellW = (d as any).x1 - (d as any).x0
      const cellH = (d as any).y1 - (d as any).y0
      const item = d.data as any

      if (cellW < 40 || cellH < 28) return

      const textColor = getTextColor(item.changePct)

      node.append('text')
        .attr('x', cellW / 2).attr('y', cellH / 2 - (cellH > 50 ? 7 : 0))
        .attr('text-anchor', 'middle').attr('dominant-baseline', 'middle')
        .attr('fill', textColor)
        .style('font-size', cellW > 120 ? '12px' : '10px')
        .style('font-weight', '600')
        .style('pointer-events', 'none')
        .text(item.name)

      if (cellH > 46) {
        const sign = item.changePct >= 0 ? '+' : ''
        node.append('text')
          .attr('x', cellW / 2).attr('y', cellH / 2 + 13)
          .attr('text-anchor', 'middle').attr('dominant-baseline', 'middle')
          .attr('fill', textColor)
          .style('font-size', '10px').style('opacity', '0.85')
          .style('pointer-events', 'none')
          .text(`${sign}${item.changePct.toFixed(2)}%`)
      }
    })

    const parents = nodes.filter(d => !!d.children && d.depth > 0)
    parents.append('rect')
      .attr('width', d => Math.max(0, (d as any).x1 - (d as any).x0))
      .attr('height', 20).attr('rx', 4)
      .attr('fill', 'rgba(255,255,255,0.04)')
      .attr('stroke', 'rgba(255,255,255,0.07)').attr('stroke-width', 1)

    parents.append('text')
      .attr('x', 6).attr('y', 14)
      .attr('fill', 'rgba(255,255,255,0.5)')
      .style('font-size', '10px').style('font-weight', '600')
      .text(d => (d.data as any).name)

  }, [data])

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="glass p-5 glow-purple">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-md flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)' }}
            >
              <Thermometer size={13} className="text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">全產業市場熱力圖</h2>
              <p className="text-[10px] text-slate-500">
                依產業成交金額顯示區塊大小，顏色代表漲跌幅
                {updatedAt && ` · 更新於 ${new Date(updatedAt).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={fetchData} className="text-slate-500 hover:text-slate-300 transition-colors">
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            </button>
            <div className="hidden sm:flex items-center gap-3 text-[10px] text-slate-400 mr-2">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded" style={{ background: 'rgba(16,185,129,0.7)' }} />
                <span>上漲</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded" style={{ background: 'rgba(244,63,94,0.7)' }} />
                <span>下跌</span>
              </div>
            </div>
            <div
              className="flex rounded-lg p-0.5 gap-0.5"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              {PERIOD_TABS.map((tab, i) => (
                <button
                  key={tab}
                  onClick={() => setPeriod(i)}
                  className="text-xs px-3 py-1 rounded-md transition-all font-medium"
                  style={
                    period === i
                      ? { background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)', color: '#fff' }
                      : { color: '#64748b' }
                  }
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div ref={containerRef} className="relative" style={{ height: 480 }}>
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center gap-2 text-slate-400 text-sm">
              <Loader2 size={18} className="animate-spin" />
              從 TWSE 載入即時資料...
            </div>
          )}
          {error && (
            <div className="absolute inset-0 flex items-center justify-center text-red-400 text-sm">{error}</div>
          )}
          <svg ref={svgRef} className="w-full" style={{ opacity: loading ? 0.3 : 1 }} />
          {tooltip && (
            <div
              className="absolute pointer-events-none z-20 px-3 py-2 rounded-lg text-xs font-medium text-white shadow-xl"
              style={{
                left: tooltip.x + 12,
                top: tooltip.y,
                background: 'rgba(15,16,26,0.95)',
                border: '1px solid rgba(139,92,246,0.3)',
                backdropFilter: 'blur(8px)',
              }}
            >
              <div className="font-bold mb-0.5">{tooltip.name}</div>
              <div className={tooltip.pct >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                {tooltip.pct >= 0 ? '+' : ''}{tooltip.pct.toFixed(2)}%
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
