'use client'

import { useState } from 'react'
import ThemeCard from './ThemeCard'
import { mockThemes } from '@/lib/mock-data'
import type { Theme, ThemeCategory } from '@/types'
import { Map } from 'lucide-react'

const ALL_CATEGORIES: Array<'全部' | ThemeCategory> = [
  '全部', '半導體鏈', '硬體基建', '元件材料', '能源車用', '消費終端', '智慧應用', '企業IT', '多元產業',
]

const VIEW_TABS = ['產業主題', 'ETF 主題']

export default function ThemesOverview() {
  const [viewTab, setViewTab] = useState(0)
  const [category, setCategory] = useState<string>('全部')

  const filtered = category === '全部'
    ? mockThemes
    : mockThemes.filter(t => t.category === category)

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="text-center py-4">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Map size={20} className="text-violet-400" />
          <h1 className="text-2xl font-bold gradient-text">智慧產業地圖</h1>
        </div>
        <p className="text-sm text-slate-400">探索台股關鍵產業鏈與投資機會</p>
        <p className="text-xs text-slate-500 mt-1">選擇您感興趣的產業主題，深入了解供應鏈結構與相關 ETF</p>
      </div>

      {/* View toggle */}
      <div className="flex items-center gap-4">
        <div
          className="flex rounded-lg p-0.5 gap-0.5"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          {VIEW_TABS.map((tab, i) => (
            <button
              key={tab}
              onClick={() => setViewTab(i)}
              className="text-xs px-4 py-1.5 rounded-md transition-all font-medium"
              style={
                viewTab === i
                  ? { background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)', color: '#fff' }
                  : { color: '#64748b' }
              }
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        {ALL_CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className="text-xs px-3 py-1.5 rounded-full transition-all font-medium"
            style={
              category === cat
                ? { background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)', color: '#fff' }
                : {
                    background: 'rgba(255,255,255,0.04)',
                    color: '#64748b',
                    border: '1px solid rgba(255,255,255,0.07)',
                  }
            }
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: 'linear-gradient(90deg, rgba(139,92,246,0.3), rgba(59,130,246,0.3), transparent)' }} />

      {/* Theme cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {filtered.map(theme => (
          <ThemeCard key={theme.id} theme={theme} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-slate-500">
          <p>此分類目前沒有主題</p>
        </div>
      )}
    </div>
  )
}
