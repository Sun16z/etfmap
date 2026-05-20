'use client'

import { useState, useEffect, useCallback } from 'react'
import { Check, Copy, RefreshCw, TrendingUp, AlertTriangle, Eye, ChevronDown, ChevronUp, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import { generateThreadsDraft } from '@/lib/rotation-engine'
import type { RotationSignals, ActiveRotation, StageStatus } from '@/types/rotation'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function confidenceColor(c: string) {
  if (c === 'high')   return { bg: 'rgba(34,197,94,0.12)',  border: 'rgba(34,197,94,0.3)',  text: '#4ade80' }
  if (c === 'medium') return { bg: 'rgba(234,179,8,0.12)',  border: 'rgba(234,179,8,0.3)',  text: '#facc15' }
  return                     { bg: 'rgba(148,163,184,0.1)', border: 'rgba(148,163,184,0.2)', text: '#94a3b8' }
}
function confidenceLabel(c: string) {
  return c === 'high' ? '高信心' : c === 'medium' ? '中信心' : '觀察中'
}

function PctBadge({ value, period }: { value: number; period: string }) {
  const color = value > 0 ? '#4ade80' : value < 0 ? '#f87171' : '#94a3b8'
  return (
    <span className="text-[10px] font-mono" style={{ color }}>
      {value >= 0 ? '+' : ''}{value.toFixed(2)}% <span className="text-slate-500">({period})</span>
    </span>
  )
}

// ─── Stage Row ────────────────────────────────────────────────────────────────

function StageRow({ status, isCurrent }: { status: StageStatus; isCurrent: boolean }) {
  const triggered = status.triggered
  return (
    <div
      className={cn('flex items-start gap-3 px-4 py-2.5 text-sm transition-all', isCurrent && 'rounded-lg')}
      style={isCurrent ? { background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)' } : undefined}
    >
      <span className="mt-0.5 text-base shrink-0" style={{ width: 20, textAlign: 'center' }}>
        {triggered ? '✅' : isCurrent ? '◐' : '○'}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={cn('font-medium', triggered ? 'text-white' : 'text-slate-400')}>
            Stage {status.stage} · {status.name}
          </span>
          {isCurrent && (
            <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: 'rgba(139,92,246,0.2)', color: '#a78bfa' }}>
              目前位置
            </span>
          )}
        </div>
        {status.priceData && status.priceData.length > 0 && (
          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
            {status.priceData.map(p => (
              <span key={p.symbol} className="text-[11px] text-slate-400">
                {p.name} <PctBadge value={p.changePct} period={p.period} />
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Exit Signals ─────────────────────────────────────────────────────────────

function ExitSignals({ stage }: { stage: NonNullable<ActiveRotation['exitStage']> }) {
  return (
    <div className="mt-3 px-4 py-3 rounded-lg" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}>
      <div className="flex items-center gap-2 mb-2">
        <AlertTriangle size={13} className="text-red-400" />
        <span className="text-xs font-semibold text-red-400">退場訊號（未觸發）</span>
      </div>
      <div className="space-y-1">
        {(stage.exit_signals ?? []).map((sig, i) => (
          <div key={i} className="flex items-center gap-2 text-xs text-slate-400">
            <span className="text-slate-600">□</span>
            {sig.label}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Next Stage Box ───────────────────────────────────────────────────────────

function NextStageBox({ rotation }: { rotation: ActiveRotation }) {
  const { nextStage, currentStage, historicalHitRate, sampleSize } = rotation
  if (!nextStage) return (
    <div className="mt-3 px-4 py-3 rounded-lg text-xs text-slate-400" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
      <span className="text-emerald-400 font-semibold">輪動末段</span> — 留意退場訊號，準備獲利了結
    </div>
  )

  const hitPct = sampleSize >= 3
    ? `命中率 ${(historicalHitRate * 100).toFixed(0)}% (n=${sampleSize})`
    : sampleSize > 0
    ? `樣本不足 (n=${sampleSize})`
    : '無歷史樣本'

  return (
    <div className="mt-3 px-4 py-3 rounded-lg space-y-2" style={{ background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.2)' }}>
      <div className="flex items-center gap-2">
        <Zap size={13} className="text-yellow-400 shrink-0" />
        <span className="text-xs font-semibold text-yellow-400">下一棒預測（Stage {currentStage + 1}）</span>
        <span className="ml-auto text-[10px] text-slate-500">{hitPct}</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {nextStage.stocks.map(s => (
          <div key={s.code} className="flex items-center gap-1.5 px-2 py-1 rounded-md" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <span className="text-xs font-mono text-slate-400">{s.code}</span>
            <span className="text-xs text-white font-medium">{s.name}</span>
            {s.typical_gain_pct_min != null && (
              <span className="text-[10px] text-emerald-400">+{s.typical_gain_pct_min}~{s.typical_gain_pct_max}%</span>
            )}
          </div>
        ))}
      </div>

      {nextStage.lag_from_prev_stage_days_min != null && (
        <div className="text-[11px] text-slate-400">
          預估時間窗：Stage {currentStage} 啟動後 {nextStage.lag_from_prev_stage_days_min}–{nextStage.lag_from_prev_stage_days_max} 個交易日
        </div>
      )}
    </div>
  )
}

// ─── Active Rotation Card ─────────────────────────────────────────────────────

function ActiveCard({ rotation }: { rotation: ActiveRotation }) {
  const [expanded, setExpanded] = useState(true)
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle')
  const colors = confidenceColor(rotation.confidence)
  const progress = Math.round((rotation.currentStage / rotation.totalContentStages) * 100)

  const handleCopyThreads = async () => {
    const draft = generateThreadsDraft(rotation)
    await navigator.clipboard.writeText(draft).catch(() => {})
    setCopyStatus('copied')
    setTimeout(() => setCopyStatus('idle'), 2000)
  }

  return (
    <div className="rounded-xl overflow-hidden" style={{ background: 'rgba(15,16,28,0.8)', border: '1px solid rgba(255,255,255,0.08)' }}>
      {/* Header */}
      <div className="px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-base shrink-0">🔴</span>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-white text-sm">{rotation.chain.name}</h3>
                <span className="text-[10px] px-1.5 py-0.5 rounded font-medium" style={{ background: colors.bg, border: `1px solid ${colors.border}`, color: colors.text }}>
                  {confidenceLabel(rotation.confidence)}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 truncate">{rotation.chain.description}</p>
            </div>
          </div>
          <button onClick={() => setExpanded(e => !e)} className="shrink-0 text-slate-500 hover:text-slate-300 transition-colors p-1">
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>

        {/* Progress bar */}
        <div className="mt-3">
          <div className="flex justify-between text-[10px] text-slate-500 mb-1.5">
            <span>Stage {rotation.currentStage} / {rotation.totalContentStages}</span>
            <span>{progress}%</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #8b5cf6, #3b82f6)' }}
            />
          </div>
        </div>
      </div>

      {expanded && (
        <div className="px-1 pb-4 space-y-0.5">
          {/* Stage list */}
          {rotation.stageStatuses.map(s => (
            <StageRow key={s.stage} status={s} isCurrent={s.stage === rotation.currentStage} />
          ))}

          <div className="px-4 space-y-3 mt-2">
            <NextStageBox rotation={rotation} />
            {rotation.exitStage && <ExitSignals stage={rotation.exitStage} />}

            {/* Historical cycles */}
            {(rotation.chain.historical_cycles ?? []).length > 0 && (
              <div className="text-[11px] text-slate-500 space-y-0.5 pt-1">
                <div className="font-semibold text-slate-400 mb-1">歷史週期</div>
                {rotation.chain.historical_cycles!.map((c, i) => (
                  <div key={i} className="flex gap-2">
                    <span className={cn('shrink-0', c.result === 'hit' ? 'text-emerald-500' : 'text-red-500')}>{c.result === 'hit' ? '✓' : '✗'}</span>
                    <span className="text-slate-500">{c.period}</span>
                    <span className="text-slate-400">{c.description}</span>
                    {c.note && <span className="text-slate-600 italic">{c.note}</span>}
                  </div>
                ))}
              </div>
            )}

            {/* Threads export */}
            <button
              onClick={handleCopyThreads}
              className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg transition-all"
              style={{ background: copyStatus === 'copied' ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: copyStatus === 'copied' ? '#4ade80' : '#94a3b8' }}
            >
              {copyStatus === 'copied' ? <Check size={12} /> : <Copy size={12} />}
              {copyStatus === 'copied' ? '已複製 Threads 草稿' : '生成 Threads 草稿'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Watch Card ───────────────────────────────────────────────────────────────

function WatchCard({ chain, closestStage }: { chain: RotationSignals['watch'][0]['chain']; closestStage: RotationSignals['watch'][0]['closestStage'] }) {
  return (
    <div className="rounded-xl px-4 py-3 flex items-start gap-3" style={{ background: 'rgba(15,16,28,0.5)', border: '1px solid rgba(255,255,255,0.06)' }}>
      <span className="text-base shrink-0 mt-0.5">🟡</span>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm text-white">{chain.name}</div>
        <div className="text-xs text-slate-400 mt-0.5">{chain.description}</div>
        <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-slate-500">
          <Eye size={11} />
          <span>等待觸發 — {closestStage.name}</span>
          {closestStage.priceData?.map(p => (
            <span key={p.symbol}>{p.name} <PctBadge value={p.changePct} period={p.period} /></span>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function RotationRadar() {
  const [signals, setSignals] = useState<RotationSignals | null>(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  const fetchSignals = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res  = await fetch('/api/rotation/signals')
      const json = await res.json()
      if (json.error) throw new Error(json.error)
      setSignals(json)
    } catch (e) {
      setError(String(e))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchSignals() }, [fetchSignals])

  return (
    <div className="animate-fade-in space-y-6 pb-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">類股輪動雷達</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            上游先行指標 → 傳導鏈偵測 → 下一棒預測
            {signals && <span className="ml-2 text-slate-600">· 更新於 {new Date(signals.updatedAt).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })}</span>}
          </p>
        </div>
        <button
          onClick={fetchSignals}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-1.5 text-xs rounded-lg text-slate-400 hover:text-slate-200 transition-all"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          {loading ? '偵測中…' : '重新偵測'}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="px-4 py-3 rounded-xl text-sm text-red-400" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
          <AlertTriangle size={14} className="inline mr-2" />
          資料抓取失敗：{error}
        </div>
      )}

      {/* Loading skeleton */}
      {loading && !signals && (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 rounded-xl animate-pulse" style={{ background: 'rgba(255,255,255,0.04)' }} />
          ))}
        </div>
      )}

      {signals && (
        <>
          {/* Active Rotations */}
          {signals.active.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <TrendingUp size={16} className="text-violet-400" />
                <h3 className="text-sm font-semibold text-white">進行中的輪動</h3>
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(139,92,246,0.2)', color: '#a78bfa' }}>
                  {signals.active.length}
                </span>
              </div>
              {signals.active.map(r => (
                <ActiveCard key={r.chain.id} rotation={r} />
              ))}
            </div>
          ) : (
            <div className="px-5 py-8 rounded-xl text-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="text-slate-500 text-sm mb-1">目前無觸發中的輪動週期</div>
              <div className="text-slate-600 text-xs">所有先行指標均低於門檻，繼續觀察以下 Watch List</div>
            </div>
          )}

          {/* Watch List */}
          {signals.watch.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Eye size={15} className="text-slate-400" />
                <h3 className="text-sm font-semibold text-slate-300">觀察名單</h3>
                <span className="text-xs text-slate-600">(等待觸發)</span>
              </div>
              {signals.watch.map(w => (
                <WatchCard key={w.chain.id} chain={w.chain} closestStage={w.closestStage} />
              ))}
            </div>
          )}

          {/* Data freshness strip */}
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-600 pt-2 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            {Object.entries(signals.priceMap)
              .filter(([k]) => ['SI=F', 'HG=F', 'GC=F', '6981.T', 'NVDA', 'MU'].includes(k))
              .map(([k, v]) => (
                <span key={k}>
                  <span className="text-slate-500">{v.name}</span>
                  {' '}
                  <span style={{ color: v.change1d_pct >= 0 ? '#4ade80' : '#f87171' }}>
                    {v.change1d_pct >= 0 ? '+' : ''}{v.change1d_pct.toFixed(2)}%
                  </span>
                  {v.error && <span className="text-red-600"> (err)</span>}
                </span>
              ))
            }
          </div>
        </>
      )}
    </div>
  )
}
