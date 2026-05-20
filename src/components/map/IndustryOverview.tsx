'use client'

import { BarChart2 } from 'lucide-react'

export default function IndustryOverview() {
  return (
    <div className="animate-fade-in flex flex-col items-center justify-center py-20 gap-4">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center"
        style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.25)' }}
      >
        <BarChart2 size={28} className="text-blue-400" />
      </div>
      <div className="text-center">
        <h3 className="text-base font-bold text-white mb-1">產業總覽</h3>
        <p className="text-sm text-slate-400">請先至「題材總覽」選擇一個主題，以查看產業總覽</p>
      </div>
      <button
        className="text-sm px-5 py-2 rounded-lg font-medium text-white transition-opacity hover:opacity-90"
        style={{ background: 'linear-gradient(135deg, #3b82f6, #06b6d4)' }}
      >
        前往題材總覽
      </button>
    </div>
  )
}
