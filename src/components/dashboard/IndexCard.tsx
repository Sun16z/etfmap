'use client'

import { cn, changeColor, formatNumber } from '@/lib/utils'
import type { MarketIndex } from '@/types'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

export default function IndexCard({ index }: { index: MarketIndex }) {
  const isUp = index.changePct > 0
  const isDown = index.changePct < 0
  const sign = isUp ? '+' : ''

  return (
    <div
      className="glass glass-hover p-4 transition-all duration-200 cursor-default group"
      style={{
        borderLeft: `2px solid ${isUp ? 'rgba(16,185,129,0.4)' : isDown ? 'rgba(244,63,94,0.4)' : 'rgba(100,116,139,0.3)'}`,
      }}
    >
      <div className="flex items-start justify-between mb-2">
        <span className="text-xs text-slate-400 font-medium">{index.name}</span>
        <span className={cn('p-0.5 rounded', isUp ? 'text-emerald-400' : isDown ? 'text-red-400' : 'text-slate-400')}>
          {isUp ? <TrendingUp size={13} /> : isDown ? <TrendingDown size={13} /> : <Minus size={13} />}
        </span>
      </div>
      <div className="text-lg font-bold text-white tabular-nums">
        {formatNumber(index.value, index.value > 1000 ? 2 : 2)}
      </div>
      <div className={cn('text-xs font-medium mt-1 tabular-nums', changeColor(index.changePct))}>
        {sign}{formatNumber(index.change, 2)}&nbsp;
        <span className="opacity-80">({sign}{formatNumber(index.changePct, 2)}%)</span>
      </div>
    </div>
  )
}
