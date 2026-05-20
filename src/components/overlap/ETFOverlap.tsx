'use client'

import { useState, useMemo } from 'react'
import { ETF_PROFILES, calcOverlap } from '@/lib/etf-holdings'
import { cn } from '@/lib/utils'
import { GitMerge, Plus, X, AlertTriangle, CheckCircle } from 'lucide-react'

const ALL_CODES = Object.keys(ETF_PROFILES)

function OverlapBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div className="relative h-2 w-full rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
      <div className="absolute left-0 top-0 h-full rounded-full transition-all duration-700"
        style={{ width: `${pct}%`, background: color }} />
    </div>
  )
}

export default function ETFOverlap() {
  const [selected, setSelected] = useState<string[]>(['0050', '00878'])
  const [input, setInput] = useState('')

  const addETF = (code: string) => {
    if (!ETF_PROFILES[code] || selected.includes(code) || selected.length >= 5) return
    setSelected(prev => [...prev, code])
    setInput('')
  }

  const removeETF = (code: string) => setSelected(prev => prev.filter(c => c !== code))

  // 計算所有 pair 的重疊度
  const pairs = useMemo(() => {
    const result: Array<{ a: string; b: string; overlap: ReturnType<typeof calcOverlap> }> = []
    for (let i = 0; i < selected.length; i++) {
      for (let j = i + 1; j < selected.length; j++) {
        const a = ETF_PROFILES[selected[i]]
        const b = ETF_PROFILES[selected[j]]
        if (a && b) result.push({ a: selected[i], b: selected[j], overlap: calcOverlap(a, b) })
      }
    }
    return result
  }, [selected])

  // 合併持股暴露
  const combinedExposure = useMemo(() => {
    const map: Record<string, { code: string; name: string; totalWeight: number; sector: string }> = {}
    selected.forEach(code => {
      const profile = ETF_PROFILES[code]
      if (!profile) return
      const perEtfFactor = 1 / selected.length
      profile.holdings.forEach(h => {
        if (!map[h.code]) map[h.code] = { code: h.code, name: h.name, totalWeight: 0, sector: h.sector ?? '' }
        map[h.code].totalWeight += h.weight * perEtfFactor
      })
    })
    return Object.values(map).sort((a, b) => b.totalWeight - a.totalWeight).slice(0, 10)
  }, [selected])

  const maxOverlap = Math.max(...pairs.map(p => p.overlap.overlapWeight), 1)

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)' }}>
          <GitMerge size={16} className="text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-white">ETF 重疊度分析</h1>
          <p className="text-xs text-slate-400">選擇最多 5 支 ETF，分析持股重疊與集中度風險</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left: ETF selector */}
        <div className="space-y-4">
          {/* Add ETF */}
          <div className="glass p-4 space-y-3">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">選擇 ETF</p>
            <div className="flex gap-2">
              <input
                value={input}
                onChange={e => setInput(e.target.value.toUpperCase())}
                onKeyDown={e => e.key === 'Enter' && addETF(input)}
                placeholder="輸入代碼 (e.g. 0056)"
                className="flex-1 px-3 py-2 text-sm rounded-lg outline-none"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#f1f5f9' }}
              />
              <button onClick={() => addETF(input)}
                className="px-3 py-2 rounded-lg text-white transition-opacity hover:opacity-80"
                style={{ background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)' }}>
                <Plus size={14} />
              </button>
            </div>

            {/* Quick add */}
            <div className="flex flex-wrap gap-1.5">
              {ALL_CODES.filter(c => !selected.includes(c)).map(code => (
                <button key={code} onClick={() => addETF(code)}
                  className="text-[10px] px-2 py-1 rounded-md transition-all hover:opacity-90"
                  style={{ background: 'rgba(139,92,246,0.12)', color: '#c4b5fd', border: '1px solid rgba(139,92,246,0.2)' }}>
                  + {code}
                </button>
              ))}
            </div>
          </div>

          {/* Selected ETFs */}
          <div className="space-y-2">
            {selected.map((code, i) => {
              const profile = ETF_PROFILES[code]
              const colors = ['#8b5cf6', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b']
              return (
                <div key={code} className="glass p-3 flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: colors[i] }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-white truncate">{profile?.name}</div>
                    <div className="text-[10px] text-slate-500">{code} · TER {profile?.ter}% · 殖利率 {profile?.dividendYield}%</div>
                  </div>
                  <button onClick={() => removeETF(code)} className="text-slate-600 hover:text-red-400 transition-colors">
                    <X size={13} />
                  </button>
                </div>
              )
            })}
          </div>
        </div>

        {/* Right: Analysis */}
        <div className="lg:col-span-2 space-y-4">
          {/* Pair overlaps */}
          {pairs.length > 0 && (
            <div className="glass p-4 space-y-4">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">配對重疊度</p>
              {pairs.map(({ a, b, overlap }) => {
                const pct = overlap.overlapWeight
                const risk = pct > 30 ? 'high' : pct > 15 ? 'medium' : 'low'
                return (
                  <div key={`${a}-${b}`} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-white">
                        {ETF_PROFILES[a]?.name} × {ETF_PROFILES[b]?.name}
                      </span>
                      <div className="flex items-center gap-2">
                        {risk === 'high' && <AlertTriangle size={13} className="text-red-400" />}
                        {risk === 'low' && <CheckCircle size={13} className="text-emerald-400" />}
                        <span className={cn('text-sm font-bold tabular-nums',
                          risk === 'high' ? 'text-red-400' : risk === 'medium' ? 'text-amber-400' : 'text-emerald-400')}>
                          {pct.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <OverlapBar pct={Math.min(pct * 2, 100)}
                      color={risk === 'high' ? 'rgba(244,63,94,0.7)' : risk === 'medium' ? 'rgba(245,158,11,0.7)' : 'rgba(16,185,129,0.7)'} />
                    <div className="text-[10px] text-slate-500">
                      共同持股：{overlap.sharedStocks.slice(0, 3).map(s => s.name).join('、')}
                      {overlap.sharedStocks.length > 3 && ` 等 ${overlap.sharedStocks.length} 檔`}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Combined exposure */}
          {combinedExposure.length > 0 && (
            <div className="glass p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">組合實際暴露 Top 10</p>
                <span className="text-[10px] text-slate-500">平均持倉加權</span>
              </div>
              <div className="space-y-2">
                {combinedExposure.map((stock, i) => (
                  <div key={stock.code} className="flex items-center gap-3">
                    <span className="text-[10px] text-slate-600 w-4 tabular-nums">{i + 1}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-white font-medium">{stock.name}</span>
                        <span className="text-xs text-slate-400 tabular-nums font-mono">{stock.totalWeight.toFixed(1)}%</span>
                      </div>
                      <OverlapBar pct={Math.min(stock.totalWeight * 2, 100)}
                        color={stock.totalWeight > 20 ? 'rgba(244,63,94,0.6)' : stock.totalWeight > 10 ? 'rgba(245,158,11,0.5)' : 'rgba(139,92,246,0.5)'} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Warning if top stock > 30% */}
              {combinedExposure[0]?.totalWeight > 30 && (
                <div className="flex items-start gap-2 p-3 rounded-lg mt-2"
                  style={{ background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)' }}>
                  <AlertTriangle size={13} className="text-red-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-red-300">
                    你的組合有 <strong>{combinedExposure[0].totalWeight.toFixed(1)}%</strong> 暴露在 {combinedExposure[0].name}，
                    集中度偏高（超過 30%）。考慮加入非科技類 ETF 降低單一股票風險。
                  </p>
                </div>
              )}
            </div>
          )}

          {selected.length < 2 && (
            <div className="glass p-8 text-center text-slate-500 text-sm">
              請選擇至少 2 支 ETF 進行重疊度分析
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
