'use client'

import { useState, useEffect, useMemo } from 'react'
import { CalendarDays, DollarSign, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DividendEvent {
  code: string
  name: string
  color: string
  year: number
  month: number
  exDivDate: string
  payDate: string
  cashPerUnit: number
  annualYield: number
}

interface Holdings { [code: string]: number }  // code → shares

const ETF_CODES = ['0050', '0056', '00878', '00929', '00919', '00646']
const MONTH_NAMES = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']

function MonthCard({
  month, events, holdings, year,
}: { month: number; events: DividendEvent[]; holdings: Holdings; year: number }) {
  const today = new Date()
  const isCurrentMonth = today.getMonth() + 1 === month && today.getFullYear() === year

  const monthlyIncome = events.reduce((sum, ev) => {
    const shares = holdings[ev.code] ?? 0
    return sum + shares * ev.cashPerUnit
  }, 0)

  return (
    <div className={cn('glass p-3 space-y-2 relative overflow-hidden',
      isCurrentMonth && 'ring-1 ring-violet-500/40')}>
      {isCurrentMonth && (
        <div className="absolute top-0 right-0 w-2 h-2 rounded-full bg-violet-400 m-1.5" />
      )}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-300">{MONTH_NAMES[month - 1]}</span>
        {monthlyIncome > 0 && (
          <span className="text-[10px] text-emerald-400 font-mono font-semibold">
            +${Math.round(monthlyIncome).toLocaleString()}
          </span>
        )}
      </div>

      <div className="space-y-1 min-h-[40px]">
        {events.length === 0 && (
          <p className="text-[10px] text-slate-600 italic">無配息</p>
        )}
        {events.map(ev => {
          const shares = holdings[ev.code] ?? 0
          const income = shares * ev.cashPerUnit
          return (
            <div key={ev.code} className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: ev.color }} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-300 truncate">{ev.code}</span>
                  <span className="text-[10px] text-slate-500 font-mono">${ev.cashPerUnit}</span>
                </div>
                {income > 0 && (
                  <div className="text-[9px] text-emerald-500">≈ ${Math.round(income).toLocaleString()}</div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function DividendCalendar() {
  const [year, setYear] = useState(new Date().getFullYear())
  const [events, setEvents] = useState<DividendEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [holdings, setHoldings] = useState<Holdings>({
    '0050': 100, '0056': 500, '00878': 1000, '00929': 2000, '00919': 0, '00646': 0,
  })

  useEffect(() => {
    setLoading(true)
    fetch(`/api/dividend?year=${year}`)
      .then(r => r.json())
      .then(d => { setEvents(d.events ?? []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [year])

  const byMonth = useMemo(() => {
    const map: Record<number, DividendEvent[]> = {}
    for (let m = 1; m <= 12; m++) map[m] = []
    events.forEach(ev => { map[ev.month]?.push(ev) })
    return map
  }, [events])

  const annualIncome = useMemo(() => {
    return events.reduce((sum, ev) => {
      return sum + (holdings[ev.code] ?? 0) * ev.cashPerUnit
    }, 0)
  }, [events, holdings])

  const monthlyAvg = annualIncome / 12

  const etfMeta = useMemo(() => {
    const seen = new Map<string, DividendEvent>()
    events.forEach(ev => { if (!seen.has(ev.code)) seen.set(ev.code, ev) })
    return Array.from(seen.values())
  }, [events])

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: 'linear-gradient(135deg, #10b981, #06b6d4)' }}>
          <CalendarDays size={16} className="text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-white">配息現金流月曆</h1>
          <p className="text-xs text-slate-400">輸入持股張數，查看每月預期配息收入</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Left: Holdings input */}
        <div className="space-y-4">
          <div className="glass p-4 space-y-3">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">我的持股（張）</p>
            <div className="space-y-2">
              {etfMeta.map(ev => (
                <div key={ev.code} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ background: ev.color }} />
                  <label className="text-xs text-slate-300 w-16 shrink-0">{ev.code}</label>
                  <input
                    type="number"
                    min={0}
                    value={holdings[ev.code] ?? 0}
                    onChange={e => setHoldings(h => ({ ...h, [ev.code]: Math.max(0, parseInt(e.target.value) || 0) }))}
                    className="flex-1 px-2 py-1 text-xs rounded-md outline-none text-right font-mono"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#f1f5f9' }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Income summary */}
          <div className="glass p-4 space-y-3">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">預期收益</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 flex items-center gap-1"><TrendingUp size={11} />年度合計</span>
                <span className="text-sm font-bold text-emerald-400 font-mono">
                  ${Math.round(annualIncome).toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 flex items-center gap-1"><DollarSign size={11} />月均配息</span>
                <span className="text-sm font-semibold text-cyan-400 font-mono">
                  ${Math.round(monthlyAvg).toLocaleString()}
                </span>
              </div>
            </div>
            {annualIncome > 0 && (
              <div className="pt-2 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  {Array.from({ length: 12 }, (_, i) => {
                    const mIncome = (byMonth[i + 1] ?? []).reduce((s, ev) => s + (holdings[ev.code] ?? 0) * ev.cashPerUnit, 0)
                    return mIncome
                  }).map((inc, i) => (
                    <div key={i} className="inline-block h-full"
                      style={{ width: `${(inc / annualIncome) * 100}%`, background: `hsl(${160 + i * 15},70%,55%)` }} />
                  ))}
                </div>
                <p className="text-[9px] text-slate-600 mt-1">各月配息佔比</p>
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="glass p-3 space-y-1.5">
            {etfMeta.map(ev => (
              <div key={ev.code} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ background: ev.color }} />
                  <span className="text-[10px] text-slate-400">{ev.code}</span>
                </div>
                <span className="text-[10px] text-slate-500">殖利率 {ev.annualYield}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Calendar grid */}
        <div className="lg:col-span-3 space-y-3">
          {/* Year nav */}
          <div className="flex items-center gap-3">
            <button onClick={() => setYear(y => y - 1)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all">
              <ChevronLeft size={16} />
            </button>
            <span className="text-base font-bold text-white">{year} 年</span>
            <button onClick={() => setYear(y => y + 1)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all">
              <ChevronRight size={16} />
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-6 h-6 rounded-full border-2 border-violet-500/20 border-t-violet-500 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
              {Array.from({ length: 12 }, (_, i) => (
                <MonthCard
                  key={i + 1}
                  month={i + 1}
                  year={year}
                  events={byMonth[i + 1] ?? []}
                  holdings={holdings}
                />
              ))}
            </div>
          )}

          {/* Monthly bar chart */}
          {!loading && annualIncome > 0 && (
            <div className="glass p-4 space-y-3">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">月度現金流預覽</p>
              <div className="flex items-end gap-1 h-20">
                {Array.from({ length: 12 }, (_, i) => {
                  const mIncome = (byMonth[i + 1] ?? []).reduce((s, ev) => s + (holdings[ev.code] ?? 0) * ev.cashPerUnit, 0)
                  const maxIncome = Math.max(...Array.from({ length: 12 }, (_, j) =>
                    (byMonth[j + 1] ?? []).reduce((s, ev) => s + (holdings[ev.code] ?? 0) * ev.cashPerUnit, 0)
                  ), 1)
                  const pct = (mIncome / maxIncome) * 100
                  const isThisMonth = i + 1 === new Date().getMonth() + 1 && year === new Date().getFullYear()
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full flex items-end" style={{ height: '60px' }}>
                        <div className="w-full rounded-sm transition-all duration-500"
                          style={{
                            height: `${pct}%`,
                            minHeight: mIncome > 0 ? '4px' : '0',
                            background: isThisMonth
                              ? 'linear-gradient(to top, #8b5cf6, #06b6d4)'
                              : mIncome > 0 ? 'rgba(139,92,246,0.4)' : 'rgba(255,255,255,0.04)',
                          }} />
                      </div>
                      <span className="text-[8px] text-slate-600">{i + 1}月</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
