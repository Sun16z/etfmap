'use client'

import { useState } from 'react'
import IndexCard from './IndexCard'
import NewsCard from './NewsCard'
import { mockIndices, mockNews } from '@/lib/mock-data'
import { Zap, ChevronRight } from 'lucide-react'

const DATE_TABS = ['今日', '04/30', '04/29', '04/28', '04/27', '04/26']

export default function DailyFocus() {
  const [selectedDate, setSelectedDate] = useState(0)

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Market indices */}
      <section>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-1">
          {mockIndices.map(idx => (
            <IndexCard key={idx.code} index={idx} />
          ))}
        </div>
        <p className="text-right text-[10px] text-slate-600 mt-1">
          資料更新於 {new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })}
        </p>
      </section>

      {/* News section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-md flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)' }}
            >
              <Zap size={13} className="text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">產業焦點導航</h2>
              <p className="text-[10px] text-slate-500">快速掌握每日核心題材與連動關係</p>
            </div>
            <span
              className="text-[10px] px-2 py-0.5 rounded-full font-medium"
              style={{ background: 'rgba(139,92,246,0.15)', color: '#c4b5fd', border: '1px solid rgba(139,92,246,0.2)' }}
            >
              精選回顧
            </span>
          </div>

          {/* Date tabs */}
          <div className="flex items-center gap-1">
            {DATE_TABS.map((d, i) => (
              <button
                key={d}
                onClick={() => setSelectedDate(i)}
                className="text-xs px-2.5 py-1 rounded-md transition-all"
                style={
                  selectedDate === i
                    ? { background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)', color: '#fff', fontWeight: 600 }
                    : { color: '#64748b', background: 'transparent' }
                }
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {mockNews.map((item, i) => (
            <NewsCard key={item.id} item={item} isPremium={i === 3} />
          ))}
          {/* Placeholder for a 4th card if only 3 news */}
          {mockNews.length === 3 && (
            <NewsCard
              key="premium"
              item={{ ...mockNews[0], id: 'premium' }}
              isPremium
            />
          )}
        </div>

        <div className="flex justify-center mt-4">
          <button className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors">
            查看更多焦點 <ChevronRight size={13} />
          </button>
        </div>
      </section>
    </div>
  )
}
