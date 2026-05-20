import type { NewsItem } from '@/types'
import { Calendar, ExternalLink } from 'lucide-react'

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins} 分鐘前`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs} 小時前`
  return `${Math.floor(hrs / 24)} 天前`
}

export default function NewsCard({ item, isPremium = false }: { item: NewsItem; isPremium?: boolean }) {
  return (
    <div
      className="glass glass-hover p-4 flex flex-col gap-3 transition-all duration-200 relative overflow-hidden"
      style={{ minHeight: 160 }}
    >
      {isPremium && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center z-10"
          style={{ backdropFilter: 'blur(6px)', background: 'rgba(7,8,15,0.6)' }}
        >
          <div className="text-2xl mb-1">🔒</div>
          <p className="text-xs text-slate-400 mb-2">Premium 限定內容</p>
          <button
            className="text-xs px-3 py-1.5 rounded-lg font-medium text-white"
            style={{ background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)' }}
          >
            立即升級
          </button>
        </div>
      )}

      {/* Source badge */}
      <div className="flex items-center justify-between">
        <span
          className="text-[10px] font-semibold px-2 py-0.5 rounded"
          style={{ background: 'rgba(139,92,246,0.15)', color: '#c4b5fd', border: '1px solid rgba(139,92,246,0.2)' }}
        >
          {item.source}
        </span>
        <div className="flex items-center gap-1 text-slate-500 text-[10px]">
          <Calendar size={10} />
          {timeAgo(item.publishedAt)}
        </div>
      </div>

      <h3 className="text-sm font-semibold text-slate-100 leading-snug line-clamp-2">{item.title}</h3>

      {item.summary && (
        <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">{item.summary}</p>
      )}

      {/* Theme tags */}
      {item.themeTags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-auto">
          {item.themeTags.slice(0, 3).map(tag => (
            <span key={tag} className="tag">{tag}</span>
          ))}
        </div>
      )}
    </div>
  )
}
