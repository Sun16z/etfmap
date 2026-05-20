'use client'

import { cn } from '@/lib/utils'
import type { Theme } from '@/types'
import { Flame, TrendingUp, Building2 } from 'lucide-react'

const categoryColor: Record<string, string> = {
  '半導體鏈': 'rgba(139,92,246,0.15)',
  '硬體基建': 'rgba(59,130,246,0.15)',
  '元件材料': 'rgba(6,182,212,0.15)',
  '能源車用': 'rgba(16,185,129,0.15)',
  '消費終端': 'rgba(245,158,11,0.15)',
  '智慧應用': 'rgba(236,72,153,0.15)',
  '企業IT': 'rgba(99,102,241,0.15)',
  '多元產業': 'rgba(100,116,139,0.15)',
  'ETF': 'rgba(251,191,36,0.15)',
}

const categoryBorder: Record<string, string> = {
  '半導體鏈': 'rgba(139,92,246,0.25)',
  '硬體基建': 'rgba(59,130,246,0.25)',
  '元件材料': 'rgba(6,182,212,0.25)',
  '能源車用': 'rgba(16,185,129,0.25)',
  '消費終端': 'rgba(245,158,11,0.25)',
  '智慧應用': 'rgba(236,72,153,0.25)',
  '企業IT': 'rgba(99,102,241,0.25)',
  '多元產業': 'rgba(100,116,139,0.25)',
  'ETF': 'rgba(251,191,36,0.25)',
}

const categoryText: Record<string, string> = {
  '半導體鏈': '#c4b5fd',
  '硬體基建': '#93c5fd',
  '元件材料': '#67e8f9',
  '能源車用': '#6ee7b7',
  '消費終端': '#fcd34d',
  '智慧應用': '#f9a8d4',
  '企業IT': '#a5b4fc',
  '多元產業': '#94a3b8',
  'ETF': '#fde68a',
}

export default function ThemeCard({ theme, onClick }: { theme: Theme; onClick?: () => void }) {
  const bg = categoryColor[theme.category] ?? 'rgba(100,116,139,0.1)'
  const border = categoryBorder[theme.category] ?? 'rgba(100,116,139,0.2)'
  const textColor = categoryText[theme.category] ?? '#94a3b8'

  return (
    <button
      onClick={onClick}
      className="w-full text-left group transition-all duration-200"
    >
      <div
        className="relative p-4 rounded-xl h-full flex flex-col gap-3 transition-all duration-200"
        style={{
          background: bg,
          border: `1px solid ${border}`,
        }}
      >
        {/* Hot badge */}
        {theme.isHot && (
          <div className="absolute top-3 right-3 flex items-center gap-0.5 text-orange-400">
            <Flame size={12} />
            <span className="text-[10px] font-bold">熱門</span>
          </div>
        )}

        {/* Icon + category */}
        <div className="flex items-center gap-2">
          <span className="text-xl">{theme.icon}</span>
          <span
            className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
            style={{ color: textColor, background: `${bg}`, border: `1px solid ${border}` }}
          >
            {theme.category}
          </span>
        </div>

        {/* Name */}
        <div>
          <h3 className="text-sm font-bold text-white leading-tight group-hover:text-violet-300 transition-colors">
            {theme.name}
          </h3>
          {theme.nameEn && (
            <p className="text-[10px] text-slate-500 mt-0.5">{theme.nameEn}</p>
          )}
        </div>

        {/* Description */}
        {theme.description && (
          <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">{theme.description}</p>
        )}

        {/* Stats */}
        <div className="flex items-center gap-3 mt-auto pt-2 border-t" style={{ borderColor: border }}>
          {theme.etfCount !== undefined && (
            <div className="flex items-center gap-1 text-[10px] text-slate-400">
              <TrendingUp size={10} style={{ color: textColor }} />
              <span>{theme.etfCount} 支 ETF</span>
            </div>
          )}
          {theme.stockCount !== undefined && (
            <div className="flex items-center gap-1 text-[10px] text-slate-400">
              <Building2 size={10} style={{ color: textColor }} />
              <span>{theme.stockCount} 家公司</span>
            </div>
          )}
        </div>

        {/* Tags */}
        {theme.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {theme.tags.slice(0, 3).map(tag => (
              <span
                key={tag}
                className="text-[10px] px-1.5 py-0.5 rounded"
                style={{ background: 'rgba(255,255,255,0.05)', color: '#64748b' }}
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </button>
  )
}
