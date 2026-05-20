'use client'

import { useState, useMemo, useEffect } from 'react'
import { Heart, AlertTriangle, CheckCircle, TrendingUp, DollarSign, Layers, Plus, X, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ETF_PROFILES, calcOverlap } from '@/lib/etf-holdings'

interface Holding {
  code: string
  shares: number
  costPerShare: number
}

interface LivePrice {
  code: string
  price: number
  changePct: number
  date: string
}

const INITIAL_HOLDINGS: Holding[] = [
  { code: '0050',  shares: 100,  costPerShare: 90  },
  { code: '00878', shares: 1000, costPerShare: 22  },
]

const SCORE_COLORS = (s: number) =>
  s >= 80 ? '#10b981' : s >= 60 ? '#f59e0b' : '#f43f5e'

function ScoreRing({ score }: { score: number }) {
  const r = 42
  const circ = 2 * Math.PI * r
  const dash = (score / 100) * circ
  return (
    <div className="relative w-28 h-28">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 96 96">
        <circle cx="48" cy="48" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
        <circle cx="48" cy="48" r={r} fill="none"
          stroke={SCORE_COLORS(score)} strokeWidth="8"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.8s cubic-bezier(0.4,0,0.2,1)' }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-white tabular-nums">{score}</span>
        <span className="text-[9px] text-slate-500 uppercase tracking-wider">健康分</span>
      </div>
    </div>
  )
}

function HealthBar({ label, score, detail }: { label: string; score: number; detail: string }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-400">{label}</span>
        <span className="text-xs font-mono font-semibold tabular-nums" style={{ color: SCORE_COLORS(score) }}>
          {score}/100
        </span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <div className="h-full rounded-full transition-all duration-700"
          style={{ width: `${score}%`, background: SCORE_COLORS(score) }} />
      </div>
      <p className="text-[10px] text-slate-600">{detail}</p>
    </div>
  )
}

export default function PortfolioHealth() {
  const [holdings, setHoldings] = useState<Holding[]>(INITIAL_HOLDINGS)
  const [newCode, setNewCode] = useState('')
  const [newShares, setNewShares] = useState('')
  const [newCost, setNewCost] = useState('')
  const [livePrices, setLivePrices] = useState<Record<string, LivePrice>>({})
  const [priceDate, setPriceDate] = useState('')

  const fetchLivePrices = (codes: string[]) => {
    if (codes.length === 0) return
    fetch(`/api/etf?codes=${codes.join(',')}`)
      .then(r => r.json())
      .then(d => {
        const map: Record<string, LivePrice> = {}
        ;(d.data ?? []).forEach((e: { code: string; price: number; changePct: number; date: string }) => {
          map[e.code] = { code: e.code, price: e.price, changePct: e.changePct, date: e.date }
        })
        setLivePrices(map)
        const dates = Object.values(map).map(p => p.date)
        if (dates.length > 0) setPriceDate(dates[0])
      })
      .catch(() => {})
  }

  useEffect(() => {
    fetchLivePrices(holdings.map(h => h.code))
  }, [])  // eslint-disable-line react-hooks/exhaustive-deps

  const addHolding = () => {
    const code = newCode.toUpperCase().trim()
    if (!ETF_PROFILES[code] || holdings.find(h => h.code === code)) return
    const updated = [...holdings, {
      code,
      shares: parseInt(newShares) || 100,
      costPerShare: parseFloat(newCost) || 0,
    }]
    setHoldings(updated)
    setNewCode(''); setNewShares(''); setNewCost('')
    fetchLivePrices(updated.map(h => h.code))
  }

  const removeHolding = (code: string) => setHoldings(prev => prev.filter(h => h.code !== code))

  // Compute metrics
  const analysis = useMemo(() => {
    if (holdings.length === 0) return null

    // Market value: live price preferred, fall back to cost input
    const getPrice = (h: Holding) =>
      livePrices[h.code]?.price || (h.costPerShare > 0 ? h.costPerShare : 20)

    const totalValue = holdings.reduce((s, h) => s + h.shares * getPrice(h), 0)

    // ETF weights
    const weights = holdings.map(h => ({
      code: h.code,
      weight: totalValue > 0 ? (h.shares * getPrice(h)) / totalValue * 100 : 0,
    }))

    // Single-stock concentration (TSMC exposure)
    const tsmcExposure = holdings.reduce((s, h) => {
      const profile = ETF_PROFILES[h.code]
      if (!profile) return s
      const wt = weights.find(w => w.code === h.code)?.weight ?? 0
      const tsmcHolding = profile.holdings.find(hh => hh.code === '2330')
      return s + (tsmcHolding ? (wt / 100) * tsmcHolding.weight : 0)
    }, 0)

    // Overlap penalty
    const codes = holdings.map(h => h.code).filter(c => ETF_PROFILES[c])
    let maxOverlap = 0
    for (let i = 0; i < codes.length; i++) {
      for (let j = i + 1; j < codes.length; j++) {
        const ov = calcOverlap(ETF_PROFILES[codes[i]], ETF_PROFILES[codes[j]])
        if (ov.overlapWeight > maxOverlap) maxOverlap = ov.overlapWeight
      }
    }

    // Weighted TER
    const weightedTER = holdings.reduce((s, h) => {
      const profile = ETF_PROFILES[h.code]
      if (!profile) return s
      const wt = weights.find(w => w.code === h.code)?.weight ?? 0
      return s + (wt / 100) * profile.ter
    }, 0)

    // Annual dividend (use live price for yield-on-market calc)
    const annualDividend = holdings.reduce((s, h) => {
      const profile = ETF_PROFILES[h.code]
      if (!profile) return s
      const price = getPrice(h)
      const divPerShare = price * (profile.dividendYield ?? 0) / 100
      return s + h.shares * divPerShare
    }, 0)

    // Dividend yield on cost
    const yieldOnCost = totalValue > 0 ? (annualDividend / totalValue) * 100 : 0

    // Sector allocation
    const sectorMap: Record<string, number> = {}
    holdings.forEach(h => {
      const profile = ETF_PROFILES[h.code]
      if (!profile) return
      const wt = weights.find(w => w.code === h.code)?.weight ?? 0
      profile.holdings.forEach(hh => {
        const sector = hh.sector ?? '其他'
        sectorMap[sector] = (sectorMap[sector] ?? 0) + (wt / 100) * hh.weight
      })
    })
    const sectors = Object.entries(sectorMap)
      .sort((a, b) => b[1] - a[1])
      .map(([sector, weight]) => ({ sector, weight: Math.round(weight * 10) / 10 }))

    // Scores
    const concentrationScore = Math.max(0, 100 - tsmcExposure * 2)
    const overlapScore = Math.max(0, 100 - maxOverlap * 2.5)
    const costScore = Math.max(0, 100 - weightedTER * 80)
    const divScore = Math.min(100, yieldOnCost * 12)
    const diversificationScore = Math.min(100, codes.length * 20 + (sectors.length * 5))
    const overallScore = Math.round(
      concentrationScore * 0.3 + overlapScore * 0.25 + costScore * 0.15 + divScore * 0.15 + diversificationScore * 0.15
    )

    return {
      totalValue, weights, tsmcExposure, maxOverlap, weightedTER,
      annualDividend, yieldOnCost, sectors,
      scores: { overall: overallScore, concentration: Math.round(concentrationScore), overlap: Math.round(overlapScore), cost: Math.round(costScore), dividend: Math.round(divScore), diversification: Math.round(diversificationScore) },
    }
  }, [holdings])

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: 'linear-gradient(135deg, #10b981, #3b82f6)' }}>
          <Heart size={16} className="text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-white">個人投資組合健診</h1>
          <p className="text-xs text-slate-400">輸入持股，評估集中度、重疊度、成本與配息健康度</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left: Input */}
        <div className="space-y-4">
          {/* Add holding */}
          <div className="glass p-4 space-y-3">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">新增持股</p>
            <div className="space-y-2">
              <input value={newCode} onChange={e => setNewCode(e.target.value.toUpperCase())}
                placeholder="ETF 代碼 (e.g. 0056)"
                className="w-full px-3 py-2 text-sm rounded-lg outline-none"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#f1f5f9' }}
                onKeyDown={e => e.key === 'Enter' && addHolding()} />
              <div className="flex gap-2">
                <input value={newShares} onChange={e => setNewShares(e.target.value)}
                  placeholder="張數"
                  type="number" min={1}
                  className="flex-1 px-3 py-2 text-sm rounded-lg outline-none"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#f1f5f9' }}
                  onKeyDown={e => e.key === 'Enter' && addHolding()} />
                <input value={newCost} onChange={e => setNewCost(e.target.value)}
                  placeholder="成本價"
                  type="number" min={0} step={0.1}
                  className="flex-1 px-3 py-2 text-sm rounded-lg outline-none"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#f1f5f9' }}
                  onKeyDown={e => e.key === 'Enter' && addHolding()} />
              </div>
              <button onClick={addHolding}
                className="w-full py-2 rounded-lg text-sm font-medium text-white flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                style={{ background: 'linear-gradient(135deg, #10b981, #3b82f6)' }}>
                <Plus size={14} /> 加入組合
              </button>
            </div>

            {/* Quick add */}
            <div className="flex flex-wrap gap-1">
              {Object.keys(ETF_PROFILES).filter(c => !holdings.find(h => h.code === c)).map(code => (
                <button key={code} onClick={() => setNewCode(code)}
                  className="text-[10px] px-2 py-1 rounded-md transition-all hover:opacity-90"
                  style={{ background: 'rgba(16,185,129,0.1)', color: '#6ee7b7', border: '1px solid rgba(16,185,129,0.2)' }}>
                  + {code}
                </button>
              ))}
            </div>
          </div>

          {/* Holdings list */}
          <div className="space-y-2">
            {priceDate && (
            <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
              <RefreshCw size={9} />
              <span>現價資料：TWSE {priceDate}</span>
            </div>
          )}
          {holdings.map(h => {
              const profile = ETF_PROFILES[h.code]
              const wt = analysis?.weights.find(w => w.code === h.code)?.weight ?? 0
              const live = livePrices[h.code]
              return (
                <div key={h.code} className="glass p-3 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-white">{h.code}</span>
                      <div className="flex items-center gap-2">
                        {live && (
                          <span className={cn('text-[10px] font-mono', live.changePct >= 0 ? 'text-emerald-400' : 'text-red-400')}>
                            ${live.price} ({live.changePct >= 0 ? '+' : ''}{live.changePct}%)
                          </span>
                        )}
                        <span className="text-xs text-slate-400 font-mono">{wt.toFixed(1)}%</span>
                      </div>
                    </div>
                    <div className="text-[10px] text-slate-500 truncate">
                      {profile?.name} · {h.shares}張{h.costPerShare > 0 ? ` · 成本$${h.costPerShare}` : ''}
                    </div>
                  </div>
                  <button onClick={() => removeHolding(h.code)} className="text-slate-600 hover:text-red-400 transition-colors">
                    <X size={13} />
                  </button>
                </div>
              )
            })}
          </div>
        </div>

        {/* Right: Analysis */}
        <div className="lg:col-span-2 space-y-4">
          {!analysis ? (
            <div className="glass p-8 text-center text-slate-500 text-sm">請新增至少一個持股進行健診</div>
          ) : (
            <>
              {/* Overall score */}
              <div className="glass p-4">
                <div className="flex items-center gap-6">
                  <ScoreRing score={analysis.scores.overall} />
                  <div className="flex-1 space-y-3">
                    <div>
                      <h3 className="text-base font-bold text-white">
                        {analysis.scores.overall >= 80 ? '組合健康 ✓' : analysis.scores.overall >= 60 ? '組合偏弱，需改善' : '高風險，建議調整'}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        總市值 ${Math.round(analysis.totalValue).toLocaleString()} · 年度配息 ${Math.round(analysis.annualDividend).toLocaleString()} · 殖利率 {analysis.yieldOnCost.toFixed(1)}%
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <HealthBar label="集中度風險" score={analysis.scores.concentration} detail={`台積電暴露 ${analysis.tsmcExposure.toFixed(1)}%`} />
                      <HealthBar label="重疊度控制" score={analysis.scores.overlap} detail={`最高配對重疊 ${analysis.maxOverlap.toFixed(1)}%`} />
                      <HealthBar label="成本費率" score={analysis.scores.cost} detail={`加權 TER ${analysis.weightedTER.toFixed(2)}%`} />
                      <HealthBar label="配息品質" score={analysis.scores.dividend} detail={`年化殖利率 ${analysis.yieldOnCost.toFixed(1)}%`} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Sector allocation */}
              <div className="glass p-4 space-y-3">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">持股產業分布</p>
                <div className="space-y-2">
                  {analysis.sectors.slice(0, 8).map((s, i) => {
                    const hue = (i * 35 + 250) % 360
                    return (
                      <div key={s.sector} className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-500 w-14 shrink-0 truncate">{s.sector}</span>
                        <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                          <div className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${Math.min(s.weight * 2, 100)}%`, background: `hsl(${hue},65%,55%)` }} />
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono w-10 text-right">{s.weight}%</span>
                      </div>
                    )
                  })}
                </div>
                {analysis.sectors[0]?.weight > 40 && (
                  <div className="flex items-start gap-2 p-2 rounded-lg" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.15)' }}>
                    <AlertTriangle size={11} className="text-amber-400 mt-0.5 shrink-0" />
                    <p className="text-[10px] text-amber-300">{analysis.sectors[0].sector} 佔比過高（{analysis.sectors[0].weight}%），組合抗跌性較弱</p>
                  </div>
                )}
              </div>

              {/* Recommendations */}
              <div className="glass p-4 space-y-3">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">建議事項</p>
                <div className="space-y-2">
                  {analysis.tsmcExposure > 30 && (
                    <div className="flex items-start gap-2 p-2 rounded-lg" style={{ background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.15)' }}>
                      <AlertTriangle size={11} className="text-red-400 shrink-0 mt-0.5" />
                      <p className="text-xs text-red-300">台積電暴露達 {analysis.tsmcExposure.toFixed(1)}%，建議加入非半導體類 ETF（如 00878、0056）降低集中度。</p>
                    </div>
                  )}
                  {analysis.maxOverlap > 30 && (
                    <div className="flex items-start gap-2 p-2 rounded-lg" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.15)' }}>
                      <AlertTriangle size={11} className="text-amber-400 shrink-0 mt-0.5" />
                      <p className="text-xs text-amber-300">部分 ETF 重疊度過高（{analysis.maxOverlap.toFixed(1)}%），等同重複持股，考慮精簡組合。</p>
                    </div>
                  )}
                  {analysis.weightedTER > 0.7 && (
                    <div className="flex items-start gap-2 p-2 rounded-lg" style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.15)' }}>
                      <AlertTriangle size={11} className="text-violet-400 shrink-0 mt-0.5" />
                      <p className="text-xs text-violet-300">加權費用率 {analysis.weightedTER.toFixed(2)}% 偏高，長期複利下影響顯著。考慮以 0050（0.43%）取代部分高費率 ETF。</p>
                    </div>
                  )}
                  {analysis.scores.overall >= 75 && (
                    <div className="flex items-start gap-2 p-2 rounded-lg" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)' }}>
                      <CheckCircle size={11} className="text-emerald-400 shrink-0 mt-0.5" />
                      <p className="text-xs text-emerald-300">組合結構整體良好！配息穩定、費率適中，可維持現有配置並定期再平衡。</p>
                    </div>
                  )}
                  {holdings.length === 1 && (
                    <div className="flex items-start gap-2 p-2 rounded-lg" style={{ background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.15)' }}>
                      <TrendingUp size={11} className="text-cyan-400 shrink-0 mt-0.5" />
                      <p className="text-xs text-cyan-300">組合只有 1 支 ETF，建議加入 2-3 支不同風格 ETF（成長型 + 配息型 + 海外型）分散風險。</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
