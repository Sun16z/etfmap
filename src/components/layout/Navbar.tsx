'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Search, Bell, Star, TrendingUp, X } from 'lucide-react'

const tabs = [
  { id: 'daily',         label: '每日焦點',   href: '/?tab=daily',          icon: '⚡' },
  { id: 'themes',        label: '題材總覽',   href: '/?tab=themes',         icon: '🗺️' },
  { id: 'overview',      label: '產業總覽',   href: '/?tab=overview',       icon: '📊' },
  { id: 'map',           label: '產業地圖',   href: '/?tab=map',            icon: '🔗' },
  { id: 'companies',     label: '公司資料庫', href: '/?tab=companies',      icon: '🏢' },
  { id: 'heatmap',       label: '市場熱力圖', href: '/?tab=heatmap',        icon: '🌡️' },
  { id: 'ai',            label: 'AI 分析',    href: '/?tab=ai',             icon: '🤖' },
  { id: 'overlap',       label: 'ETF 重疊度', href: '/?tab=overlap',        icon: '⊙' },
  { id: 'dividend',      label: '配息月曆',   href: '/?tab=dividend',       icon: '💰' },
  { id: 'institutional', label: '法人動向',   href: '/?tab=institutional',  icon: '🏦' },
  { id: 'simulate',      label: '供應鏈模擬', href: '/?tab=simulate',       icon: '⚡' },
  { id: 'portfolio',     label: '組合健診',   href: '/?tab=portfolio',      icon: '❤️' },
  { id: 'rotation',      label: '輪動雷達',   href: '/?tab=rotation',       icon: '🔄' },
  { id: 'etf-command',   label: 'ETF 工作台', href: '/etf-command/',        icon: '📋' },
]

interface SearchResult {
  code: string
  name: string
  type: 'etf' | 'stock'
  price: number
  changePct: number
}

export default function Navbar({ activeTab }: { activeTab: string }) {
  const router = useRouter()
  const [open, setOpen]       = useState(false)
  const [query, setQuery]     = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [focused, setFocused] = useState(-1)
  const [fetching, setFetching] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        close()
      }
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [])

  // ⌘K / Ctrl+K global shortcut
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(true)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      setFetching(false)
      return
    }
    setFetching(true)
    const t = setTimeout(async () => {
      try {
        const res  = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
        const json = await res.json()
        setResults(json.results ?? [])
        setFocused(-1)
      } catch {
        setResults([])
      } finally {
        setFetching(false)
      }
    }, 300)
    return () => clearTimeout(t)
  }, [query])

  function close() {
    setOpen(false)
    setQuery('')
    setResults([])
    setFocused(-1)
  }

  const handleSelect = useCallback((r: SearchResult) => {
    router.push(`/?tab=companies&q=${encodeURIComponent(r.name)}`)
    close()
  }, [router])

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    switch (e.key) {
      case 'Escape':
        close()
        break
      case 'ArrowDown':
        e.preventDefault()
        setFocused(f => Math.min(f + 1, results.length - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setFocused(f => Math.max(f - 1, -1))
        break
      case 'Enter':
        if (focused >= 0) handleSelect(results[focused])
        break
    }
  }

  const showDropdown = open && (results.length > 0 || fetching)

  return (
    <header className="sticky top-0 z-50 w-full">
      <div
        className="border-b"
        style={{
          background: 'rgba(7, 8, 15, 0.85)',
          backdropFilter: 'blur(20px)',
          borderColor: 'rgba(255,255,255,0.06)',
        }}
      >
        {/* Top bar */}
        <div className="max-w-[1440px] mx-auto px-4 h-14 flex items-center justify-between">

          {/* Logo */}
          <Link href="/?tab=daily" className="flex items-center gap-2.5 shrink-0">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)' }}
            >
              <TrendingUp size={16} className="text-white" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-sm font-bold text-white tracking-wide">ETF 地圖</span>
              <span className="text-[10px] text-slate-500 tracking-widest">MARKET INTELLIGENCE</span>
            </div>
          </Link>

          {/* Search */}
          <div className="flex-1 max-w-sm mx-6 relative" ref={containerRef}>
            {open ? (
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  autoFocus
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="搜尋 ETF、股票、產業..."
                  className="w-full pl-9 pr-8 py-1.5 text-sm rounded-lg outline-none"
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(139,92,246,0.4)',
                    color: '#f1f5f9',
                  }}
                />
                {query && (
                  <button
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                    onMouseDown={e => { e.preventDefault(); setQuery(''); setResults([]) }}
                  >
                    <X size={13} />
                  </button>
                )}
              </div>
            ) : (
              <button
                onClick={() => setOpen(true)}
                className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition-colors w-full"
                style={{
                  padding: '6px 12px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: '8px',
                }}
              >
                <Search size={13} />
                <span>搜尋 ETF、股票、產業...</span>
                <span className="ml-auto text-xs text-slate-600 font-mono">⌘K</span>
              </button>
            )}

            {/* Results dropdown */}
            {showDropdown && (
              <div
                className="absolute top-full mt-1.5 w-full rounded-xl overflow-hidden shadow-2xl z-50"
                style={{
                  background: 'rgba(15, 16, 28, 0.98)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(20px)',
                }}
              >
                {fetching && results.length === 0 ? (
                  <div className="flex items-center justify-center py-6">
                    <div className="w-5 h-5 rounded-full border-2 border-violet-500/20 border-t-violet-500 animate-spin" />
                  </div>
                ) : (
                  results.map((r, i) => (
                    <button
                      key={r.code}
                      onMouseDown={() => handleSelect(r)}
                      onMouseEnter={() => setFocused(i)}
                      className={cn(
                        'w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors',
                        focused === i ? 'bg-violet-500/10' : 'hover:bg-white/5'
                      )}
                    >
                      <span
                        className="text-[10px] font-mono px-1.5 py-0.5 rounded shrink-0"
                        style={{
                          background: r.type === 'etf' ? 'rgba(139,92,246,0.15)' : 'rgba(59,130,246,0.15)',
                          color:      r.type === 'etf' ? '#a78bfa'               : '#60a5fa',
                          border: `1px solid ${r.type === 'etf' ? 'rgba(139,92,246,0.3)' : 'rgba(59,130,246,0.3)'}`,
                        }}
                      >
                        {r.type === 'etf' ? 'ETF' : '股票'}
                      </span>
                      <span className="text-xs font-mono text-slate-400 w-10 shrink-0">{r.code}</span>
                      <span className="text-sm text-white flex-1 truncate">{r.name}</span>
                      <span
                        className="text-xs font-medium shrink-0"
                        style={{ color: r.changePct >= 0 ? '#4ade80' : '#f87171' }}
                      >
                        {r.changePct >= 0 ? '+' : ''}{r.changePct.toFixed(2)}%
                      </span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
<button className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all">
              <Bell size={16} />
            </button>
            <button className="p-2 rounded-lg text-slate-400 hover:text-yellow-400 hover:bg-white/5 transition-all">
              <Star size={16} />
            </button>
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold text-white"
              style={{ background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)' }}
            >
              U
            </div>
          </div>
        </div>

        {/* Tab bar */}
        <div className="max-w-[1440px] mx-auto px-4">
          <nav className="flex gap-1 overflow-x-auto no-scrollbar">
            {tabs.map(tab => {
              const isActive = activeTab === tab.id
              return (
                <Link
                  key={tab.id}
                  href={tab.href}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium whitespace-nowrap transition-all relative',
                    isActive ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                  )}
                >
                  <span className="text-xs">{tab.icon}</span>
                  {tab.label}
                  {isActive && (
                    <span
                      className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                      style={{ background: 'linear-gradient(90deg, #8b5cf6, #3b82f6)' }}
                    />
                  )}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>
    </header>
  )
}
