'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { cn, changeColor, formatNumber } from '@/lib/utils'
import { Search, Building2, TrendingUp, Star, ExternalLink, Loader2, RefreshCw } from 'lucide-react'

interface Item {
  id: string
  code: string
  name: string
  price: number
  change: number
  changePct: number
  volume: number
  tradeValue: number
  transactions: number
  date: string
  // ETF fields
  category?: string
  subCategory?: string
  // Stock fields
  sector?: string
  industry?: string
  _type: 'etf' | 'stock'
}

const ETF_SUBCATEGORIES = ['全部', '高股息', 'ESG', '科技', '半導體', '美股', '債券型', '槓桿反向型']

function StatCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg p-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
      <div className="text-[10px] text-slate-500 mb-1">{label}</div>
      <div className="text-sm font-semibold text-white truncate">{value}</div>
    </div>
  )
}

function formatValue(v: number): string {
  if (v >= 1e8) return `${(v / 1e8).toFixed(1)} 億`
  if (v >= 1e4) return `${(v / 1e4).toFixed(0)} 萬`
  return v.toLocaleString()
}

export default function CompanyDatabase() {
  const urlParams = useSearchParams()
  const [search, setSearch] = useState(() => urlParams.get('q') ?? '')
  const [typeFilter, setTypeFilter] = useState<'all' | 'etf' | 'stock'>(
    () => (urlParams.get('q') ? 'all' : 'etf')
  )
  const [selected, setSelected] = useState<Item | null>(null)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [total, setTotal] = useState(0)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams({ limit: '100', page: '1' })
      if (search) params.set('search', search)

      let results: Item[] = []

      if (typeFilter === 'all' || typeFilter === 'etf') {
        const res = await fetch(`/api/etf?${params}`)
        const json = await res.json()
        const etfs: Item[] = (json.data ?? []).map((e: any) => ({ ...e, _type: 'etf' as const }))
        results = [...results, ...etfs]
      }

      if (typeFilter === 'all' || typeFilter === 'stock') {
        const res = await fetch(`/api/stocks?${params}`)
        const json = await res.json()
        const stocks: Item[] = (json.data ?? []).map((s: any) => ({ ...s, _type: 'stock' as const }))
        results = [...results, ...stocks]
      }

      // Sort by tradeValue desc
      results.sort((a, b) => b.tradeValue - a.tradeValue)
      setItems(results)
      setTotal(results.length)
      if (results.length > 0 && !selected) setSelected(results[0])
    } catch (e) {
      setError('無法連線至 TWSE，請稍後再試')
    } finally {
      setLoading(false)
    }
  }, [search, typeFilter])

  useEffect(() => {
    fetchData()
  }, [typeFilter])

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => fetchData(), 400)
    return () => clearTimeout(t)
  }, [search])

  const toggleFav = (id: string) => {
    setFavorites(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
  }

  const pct = selected?.changePct ?? 0
  const isUp = pct > 0
  const isDown = pct < 0

  return (
    <div className="animate-fade-in flex gap-4" style={{ height: 'calc(100vh - 160px)', minHeight: 500 }}>
      {/* Left list */}
      <div className="glass flex flex-col shrink-0" style={{ width: 300, overflow: 'hidden' }}>
        <div className="p-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Building2 size={14} className="text-violet-400" />
              列表
              <span className="text-[10px] text-slate-500 font-normal">{total} 筆</span>
            </h3>
            <button onClick={fetchData} className="text-slate-500 hover:text-slate-300 transition-colors">
              <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
          <div className="relative mb-2">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="搜尋名稱或代碼..."
              className="w-full pl-7 pr-3 py-1.5 text-xs rounded-lg outline-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#f1f5f9' }}
            />
          </div>
          <div className="flex gap-1">
            {(['etf', 'stock', 'all'] as const).map(t => (
              <button
                key={t}
                onClick={() => { setTypeFilter(t); setSelected(null) }}
                className="flex-1 text-[10px] py-1 rounded-md font-medium transition-all"
                style={
                  typeFilter === t
                    ? { background: 'rgba(139,92,246,0.25)', color: '#c4b5fd', border: '1px solid rgba(139,92,246,0.35)' }
                    : { color: '#475569', border: '1px solid transparent' }
                }
              >
                {t === 'all' ? '全部' : t === 'etf' ? 'ETF' : '股票'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading && (
            <div className="flex items-center justify-center py-12 gap-2 text-xs text-slate-500">
              <Loader2 size={14} className="animate-spin" /> 載入 TWSE 即時資料...
            </div>
          )}
          {error && <p className="text-xs text-red-400 p-4">{error}</p>}
          {!loading && items.map(item => {
            const isSelected = selected?.id === item.id
            const isFav = favorites.has(item.id)
            const p = item.changePct
            return (
              <div
                key={item.id}
                role="button"
                tabIndex={0}
                onClick={() => setSelected(item)}
                onKeyDown={e => e.key === 'Enter' && setSelected(item)}
                className="w-full flex items-center gap-2 px-3 py-2.5 transition-all text-left border-b cursor-pointer"
                style={{
                  borderColor: 'rgba(255,255,255,0.04)',
                  background: isSelected ? 'rgba(139,92,246,0.1)' : 'transparent',
                  borderLeft: isSelected ? '2px solid #8b5cf6' : '2px solid transparent',
                }}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-white truncate">{item.name}</span>
                    <span
                      className="text-[9px] px-1 py-0.5 rounded shrink-0"
                      style={
                        item._type === 'etf'
                          ? { background: 'rgba(251,191,36,0.15)', color: '#fde68a' }
                          : { background: 'rgba(99,102,241,0.15)', color: '#a5b4fc' }
                      }
                    >
                      {item._type === 'etf' ? 'ETF' : '股'}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500">{item.code}</span>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xs font-bold text-white tabular-nums">{formatNumber(item.price)}</div>
                  <div className={cn('text-[10px] tabular-nums', changeColor(p))}>
                    {p >= 0 ? '+' : ''}{p.toFixed(2)}%
                  </div>
                </div>
                <button
                  onClick={e => { e.stopPropagation(); toggleFav(item.id) }}
                  className={cn('shrink-0 transition-colors', isFav ? 'text-yellow-400' : 'text-slate-600 hover:text-yellow-400')}
                >
                  <Star size={12} fill={isFav ? 'currentColor' : 'none'} />
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {/* Right detail */}
      <div className="flex-1 glass flex flex-col overflow-auto">
        {!selected ? (
          <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">
            點選左側項目查看詳情
          </div>
        ) : (
          <div className="p-5">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-white">{selected.name}</h2>
                  <span className="text-sm text-slate-400">({selected.code})</span>
                  <span
                    className="text-[10px] px-2 py-0.5 rounded font-semibold"
                    style={
                      selected._type === 'etf'
                        ? { background: 'rgba(251,191,36,0.15)', color: '#fde68a' }
                        : { background: 'rgba(99,102,241,0.15)', color: '#a5b4fc' }
                    }
                  >
                    {selected._type === 'etf' ? 'ETF' : '股票'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {selected._type === 'etf'
                    ? `${selected.category} · ${selected.subCategory}`
                    : `${selected.sector} · ${selected.industry}`}
                  &nbsp;·&nbsp;資料日期：{selected.date}
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-white tabular-nums">{formatNumber(selected.price)}</div>
                <div className={cn('text-sm font-semibold tabular-nums', changeColor(pct))}>
                  {isUp ? '+' : ''}{formatNumber(selected.change, 2)}
                  &nbsp;({isUp ? '+' : ''}{pct.toFixed(2)}%)
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
              <StatCell label="成交量" value={formatValue(selected.volume)} />
              <StatCell label="成交金額" value={formatValue(selected.tradeValue)} />
              <StatCell label="成交筆數" value={selected.transactions.toLocaleString()} />
              <StatCell
                label={selected._type === 'etf' ? '類別' : '產業'}
                value={selected._type === 'etf' ? (selected.subCategory ?? '-') : (selected.industry ?? '-')}
              />
            </div>

            {/* Change visual */}
            <div
              className="rounded-xl p-5 flex items-center justify-between"
              style={{
                background: isUp
                  ? 'rgba(16,185,129,0.06)'
                  : isDown
                  ? 'rgba(244,63,94,0.06)'
                  : 'rgba(255,255,255,0.03)',
                border: `1px solid ${isUp ? 'rgba(16,185,129,0.15)' : isDown ? 'rgba(244,63,94,0.15)' : 'rgba(255,255,255,0.06)'}`,
              }}
            >
              <div>
                <p className="text-xs text-slate-400 mb-1">今日漲跌</p>
                <p className={cn('text-3xl font-bold tabular-nums', changeColor(pct))}>
                  {isUp ? '+' : ''}{pct.toFixed(2)}%
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400 mb-1">絕對變動</p>
                <p className={cn('text-xl font-semibold tabular-nums', changeColor(pct))}>
                  {isUp ? '+' : ''}{formatNumber(selected.change, 2)}
                </p>
              </div>
            </div>

            {/* TWSE link */}
            <div className="mt-4">
              <a
                href={`https://www.twse.com.tw/zh/trading/fund/ETF_TOTAL.html`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 transition-colors"
              >
                <ExternalLink size={12} />
                在 TWSE 查看更多資訊
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
