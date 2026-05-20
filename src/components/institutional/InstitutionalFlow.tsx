'use client'

import { useState, useEffect, useRef } from 'react'
import { Users, Building2, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FlowPoint {
  date: string
  foreign: number
  trust: number
  dealer: number
  retail: number
}

const STOCKS = [
  { code: '2330', name: '台積電' },
  { code: '2317', name: '鴻海' },
  { code: '2454', name: '聯發科' },
  { code: '2308', name: '台達電' },
  { code: '2882', name: '國泰金' },
  { code: '3711', name: '日月光' },
]

const SERIES_META = [
  { key: 'foreign', label: '外資', color: '#8b5cf6', icon: Building2 },
  { key: 'trust',   label: '投信', color: '#3b82f6', icon: TrendingUp },
  { key: 'dealer',  label: '自營', color: '#06b6d4', icon: BarChart3 },
  { key: 'retail',  label: '散戶(推算)', color: '#f59e0b', icon: Users },
] as const

function MiniBar({ value, max }: { value: number; max: number }) {
  const pct = Math.abs(value) / max * 100
  const isPos = value >= 0
  return (
    <div className="flex items-center gap-1 h-3">
      {isPos ? (
        <>
          <div className="w-16 flex justify-end" />
          <div className="w-px h-3" style={{ background: 'rgba(255,255,255,0.1)' }} />
          <div className="h-2 rounded-sm" style={{ width: `${pct * 0.5}%`, maxWidth: '60px', background: '#10b981' }} />
        </>
      ) : (
        <>
          <div className="flex justify-end" style={{ width: `${pct * 0.5}%`, maxWidth: '60px' }}>
            <div className="h-2 rounded-sm w-full" style={{ background: '#f43f5e' }} />
          </div>
          <div className="w-px h-3" style={{ background: 'rgba(255,255,255,0.1)' }} />
          <div className="w-16" />
        </>
      )}
    </div>
  )
}

function SummaryCard({ label, value, color, Icon }: {
  label: string; value: number; color: string; Icon: React.ComponentType<{ size: number; className?: string }>
}) {
  const isPos = value >= 0
  return (
    <div className="glass p-3 space-y-1">
      <div className="flex items-center gap-1.5 text-slate-400">
        <Icon size={12} className="shrink-0" />
        <span className="text-[10px] font-semibold uppercase tracking-wider">{label}</span>
      </div>
      <div className="flex items-center gap-1">
        {isPos ? <TrendingUp size={13} className="text-emerald-400" /> : <TrendingDown size={13} className="text-red-400" />}
        <span className={cn('text-sm font-bold font-mono tabular-nums', isPos ? 'text-emerald-400' : 'text-red-400')}>
          {isPos ? '+' : ''}{value.toLocaleString()} 億
        </span>
      </div>
      <p className="text-[9px] text-slate-600">30日合計</p>
    </div>
  )
}

export default function InstitutionalFlow() {
  const [selectedCode, setSelectedCode] = useState('2330')
  const [series, setSeries] = useState<FlowPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [stockName, setStockName] = useState('台積電')
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/institutional?code=${selectedCode}`)
      .then(r => r.json())
      .then(d => {
        setSeries(d.series ?? [])
        setStockName(d.name ?? selectedCode)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [selectedCode])

  // Draw chart on canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || series.length === 0) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const W = canvas.clientWidth
    const H = canvas.clientHeight
    canvas.width = W * dpr
    canvas.height = H * dpr
    ctx.scale(dpr, dpr)

    ctx.clearRect(0, 0, W, H)

    const padL = 48, padR = 12, padT = 12, padB = 28
    const chartW = W - padL - padR
    const chartH = H - padT - padB

    const allVals = series.flatMap(p => [p.foreign, p.trust, p.dealer])
    const maxAbs = Math.max(Math.abs(Math.min(...allVals)), Math.max(...allVals), 1)

    // Zero line
    const zeroY = padT + chartH / 2
    ctx.strokeStyle = 'rgba(255,255,255,0.08)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(padL, zeroY)
    ctx.lineTo(padL + chartW, zeroY)
    ctx.stroke()

    // Grid lines
    ctx.strokeStyle = 'rgba(255,255,255,0.04)'
    for (let i = 1; i <= 3; i++) {
      const y1 = padT + (chartH / 2) * (i / 4)
      const y2 = padT + (chartH / 2) + (chartH / 2) * (i / 4)
      ctx.beginPath(); ctx.moveTo(padL, y1); ctx.lineTo(padL + chartW, y1); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(padL, y2); ctx.lineTo(padL + chartW, y2); ctx.stroke()
    }

    // Y axis labels
    ctx.fillStyle = 'rgba(148,163,184,0.6)'
    ctx.font = `${10}px monospace`
    ctx.textAlign = 'right'
    const mag = Math.pow(10, Math.floor(Math.log10(maxAbs || 1)))
    const labelMax = Math.ceil(maxAbs / mag) * mag
    ctx.fillText(`+${labelMax}`, padL - 4, padT + 4)
    ctx.fillText('0', padL - 4, zeroY + 4)
    ctx.fillText(`-${labelMax}`, padL - 4, padT + chartH + 4)

    // Draw lines for foreign, trust, dealer (skip retail - it's derived)
    const keysToPlot: Array<{ key: keyof FlowPoint; color: string }> = [
      { key: 'foreign', color: '#8b5cf6' },
      { key: 'trust',   color: '#3b82f6' },
      { key: 'dealer',  color: '#06b6d4' },
    ]

    keysToPlot.forEach(({ key, color }) => {
      ctx.strokeStyle = color
      ctx.lineWidth = 1.5
      ctx.beginPath()
      series.forEach((p, i) => {
        const x = padL + (i / (series.length - 1)) * chartW
        const val = p[key] as number
        const y = zeroY - (val / maxAbs) * (chartH / 2)
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
      })
      ctx.stroke()
    })

    // X axis dates (every 5 days)
    ctx.fillStyle = 'rgba(100,116,139,0.8)'
    ctx.font = `${9}px sans-serif`
    ctx.textAlign = 'center'
    series.forEach((p, i) => {
      if (i % 5 === 0 || i === series.length - 1) {
        const x = padL + (i / (series.length - 1)) * chartW
        ctx.fillText(p.date.slice(5), x, padT + chartH + 16)
      }
    })
  }, [series])

  const totals = series.reduce(
    (acc, p) => ({
      foreign: acc.foreign + p.foreign,
      trust: acc.trust + p.trust,
      dealer: acc.dealer + p.dealer,
      retail: acc.retail + p.retail,
    }),
    { foreign: 0, trust: 0, dealer: 0, retail: 0 }
  )

  const maxAbs30 = Math.max(Math.abs(totals.foreign), Math.abs(totals.trust), Math.abs(totals.dealer), Math.abs(totals.retail), 1)

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>
          <Users size={16} className="text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-white">法人 vs 散戶行為差異</h1>
          <p className="text-xs text-slate-400">30 個交易日外資、投信、自營買賣超與散戶流向</p>
        </div>
      </div>

      {/* Stock selector */}
      <div className="flex gap-2">
        {STOCKS.map(s => (
          <button key={s.code}
            onClick={() => setSelectedCode(s.code)}
            className={cn('px-4 py-1.5 rounded-lg text-sm font-medium transition-all',
              selectedCode === s.code ? 'text-white' : 'text-slate-400 hover:text-slate-200')}
            style={selectedCode === s.code
              ? { background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)' }
              : { background: 'rgba(255,255,255,0.05)' }}>
            {s.code} {s.name}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 rounded-full border-2 border-violet-500/20 border-t-violet-500 animate-spin" />
        </div>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {SERIES_META.map(m => (
              <SummaryCard key={m.key} label={m.label} value={Math.round(totals[m.key])} color={m.color} Icon={m.icon} />
            ))}
          </div>

          {/* Chart */}
          <div className="glass p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{stockName} 近30日法人動向（億元）</p>
              <div className="flex items-center gap-3">
                {SERIES_META.slice(0, 3).map(m => (
                  <div key={m.key} className="flex items-center gap-1">
                    <div className="w-3 h-0.5 rounded-full" style={{ background: m.color }} />
                    <span className="text-[10px] text-slate-400">{m.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <canvas ref={canvasRef} className="w-full" style={{ height: '200px' }} />
          </div>

          {/* Day-by-day table (last 10 days) */}
          <div className="glass p-4 space-y-3">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">近10日明細（億元，來源：FinMind）</p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-left" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <th className="pb-2 text-slate-500 font-medium pr-3">日期</th>
                    {SERIES_META.map(m => (
                      <th key={m.key} className="pb-2 font-medium text-right px-2"
                        style={{ color: m.color }}>{m.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {series.slice(-10).reverse().map(p => (
                    <tr key={p.date} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                      <td className="py-1.5 text-slate-400 font-mono pr-3">{p.date.slice(5)}</td>
                      {SERIES_META.map(m => (
                        <td key={m.key} className={cn('py-1.5 text-right px-2 font-mono tabular-nums',
                          (p[m.key] as number) >= 0 ? 'text-emerald-400' : 'text-red-400')}>
                          {(p[m.key] as number) >= 0 ? '+' : ''}{(p[m.key] as number).toFixed(0)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Interpretation */}
          <div className="glass p-4 space-y-2">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">市場解讀</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {totals.foreign > 200 && (
                <div className="flex items-start gap-2 p-2 rounded-lg" style={{ background: 'rgba(139,92,246,0.08)' }}>
                  <div className="w-1.5 h-1.5 rounded-full bg-violet-400 mt-1 shrink-0" />
                  <p className="text-xs text-slate-300">外資持續買超 {stockName}，機構信心偏多。</p>
                </div>
              )}
              {totals.foreign < -200 && (
                <div className="flex items-start gap-2 p-2 rounded-lg" style={{ background: 'rgba(244,63,94,0.08)' }}>
                  <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1 shrink-0" />
                  <p className="text-xs text-slate-300">外資近期持續賣超，留意下行風險。</p>
                </div>
              )}
              {totals.retail > 500 && (
                <div className="flex items-start gap-2 p-2 rounded-lg" style={{ background: 'rgba(245,158,11,0.08)' }}>
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1 shrink-0" />
                  <p className="text-xs text-slate-300">散戶估計流入量大，可能出現追高現象，注意短期波動。</p>
                </div>
              )}
              {Math.abs(totals.foreign) < 100 && (
                <div className="flex items-start gap-2 p-2 rounded-lg" style={{ background: 'rgba(6,182,212,0.08)' }}>
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1 shrink-0" />
                  <p className="text-xs text-slate-300">法人動向趨近中性，市場觀望情緒濃厚。</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
