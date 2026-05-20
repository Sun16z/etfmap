'use client'

import { useState } from 'react'
import { mockAIScores } from '@/lib/mock-data'
import { cn, sentimentLabel, sentimentColor } from '@/lib/utils'
import { Bot, Trophy, TrendingUp, TrendingDown, Minus, RefreshCw } from 'lucide-react'

const ANALYSIS_TABS = ['深度研究', '短線動能 (Beta)', '波段趨勢 (Beta)']
const LEADERBOARD_TABS = ['看多 Top 10', '看空 Top 10', '我的分析']

function ScoreBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="score-bar flex-1">
      <div
        className="score-bar-fill"
        style={{ width: `${value}%`, background: color }}
      />
    </div>
  )
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <span className="text-base">🥇</span>
  if (rank === 2) return <span className="text-base">🥈</span>
  if (rank === 3) return <span className="text-base">🥉</span>
  return (
    <span
      className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
      style={{ background: 'rgba(255,255,255,0.06)', color: '#64748b' }}
    >
      {rank}
    </span>
  )
}

export default function AIAnalysis() {
  const [analysisTab, setAnalysisTab] = useState(0)
  const [leaderboardTab, setLeaderboardTab] = useState(0)

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div
        className="glass p-5 text-center"
        style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.08), rgba(59,130,246,0.08))' }}
      >
        <div className="flex items-center justify-center gap-2 mb-1">
          <Trophy size={18} className="text-yellow-400" />
          <h2 className="text-lg font-bold text-white">AI 評分排行榜</h2>
          <Trophy size={18} className="text-yellow-400" />
        </div>
        <p className="text-xs text-slate-400">綜合所有用戶的 AI 分析結果 · 即時更新 · Top 10</p>
      </div>

      {/* Leaderboard tab + Analysis type */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Leaderboard tabs */}
        <div
          className="flex rounded-xl p-1 gap-1"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          {LEADERBOARD_TABS.map((tab, i) => (
            <button
              key={tab}
              onClick={() => setLeaderboardTab(i)}
              className="flex-1 text-xs px-3 py-2 rounded-lg transition-all font-medium whitespace-nowrap"
              style={
                leaderboardTab === i
                  ? i === 0
                    ? { background: 'linear-gradient(135deg, rgba(16,185,129,0.3), rgba(5,150,105,0.3))', color: '#6ee7b7', border: '1px solid rgba(16,185,129,0.3)' }
                    : i === 1
                    ? { background: 'linear-gradient(135deg, rgba(244,63,94,0.3), rgba(220,38,38,0.3))', color: '#fda4af', border: '1px solid rgba(244,63,94,0.3)' }
                    : { background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)', color: '#fff' }
                  : { color: '#64748b' }
              }
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Analysis type tabs */}
        <div
          className="flex rounded-xl p-1 gap-1"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          {ANALYSIS_TABS.map((tab, i) => (
            <button
              key={tab}
              onClick={() => setAnalysisTab(i)}
              className="flex-1 text-xs px-3 py-2 rounded-lg transition-all font-medium whitespace-nowrap"
              style={
                analysisTab === i
                  ? { background: 'rgba(255,255,255,0.08)', color: '#f1f5f9', border: '1px solid rgba(255,255,255,0.12)' }
                  : { color: '#64748b' }
              }
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Last updated */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>最後更新：{new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })}</span>
        <button className="flex items-center gap-1 hover:text-slate-300 transition-colors">
          <RefreshCw size={11} />
          重新整理
        </button>
      </div>

      {/* Score cards */}
      <div className="space-y-3">
        {mockAIScores.map((item, i) => {
          const { score } = item
          const isUp = score.sentiment === 'bullish'
          const isDown = score.sentiment === 'bearish'

          return (
            <div
              key={item.code}
              className="glass glass-hover p-4 transition-all duration-200 cursor-pointer"
            >
              <div className="flex items-start gap-3">
                <RankBadge rank={i + 1} />

                <div className="flex-1 min-w-0">
                  {/* Name + sentiment */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-bold text-white">{item.code}</span>
                    <span className="text-xs text-slate-300">{item.name}</span>
                    <span
                      className="flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                      style={
                        isUp
                          ? { background: 'rgba(16,185,129,0.15)', color: '#34d399' }
                          : isDown
                          ? { background: 'rgba(244,63,94,0.15)', color: '#fb7185' }
                          : { background: 'rgba(245,158,11,0.15)', color: '#fbbf24' }
                      }
                    >
                      {isUp ? <TrendingUp size={10} /> : isDown ? <TrendingDown size={10} /> : <Minus size={10} />}
                      &nbsp;{sentimentLabel(score.sentiment)}
                    </span>
                  </div>

                  {/* Score bars */}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                    {[
                      { label: '題材面', val: score.themeScore ?? 0, color: '#a78bfa' },
                      { label: '基本面', val: score.baseScore ?? 0, color: '#60a5fa' },
                      { label: '技術面', val: score.techScore ?? 0, color: '#34d399' },
                      { label: '籌碼面', val: score.fundScore ?? 0, color: '#fb923c' },
                    ].map(({ label, val, color }) => (
                      <div key={label} className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-500 w-12 shrink-0">{label}</span>
                        <ScoreBar value={val} color={color} />
                        <span className="text-[10px] text-slate-400 tabular-nums w-6 text-right">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total score */}
                <div className="shrink-0 text-right">
                  <div
                    className="text-2xl font-bold tabular-nums"
                    style={{
                      background: score.total >= 85
                        ? 'linear-gradient(135deg, #a78bfa, #60a5fa)'
                        : score.total >= 70
                        ? 'linear-gradient(135deg, #60a5fa, #34d399)'
                        : 'linear-gradient(135deg, #94a3b8, #64748b)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    {score.total.toFixed(1)}
                  </div>
                  <div className="text-[10px] text-slate-500">/ 100</div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
