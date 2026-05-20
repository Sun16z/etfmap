import type {
  RotationChain,
  RotationStage,
  PriceData,
  ActiveRotation,
  StageStatus,
  ConfidenceLevel,
  RotationSignals,
} from '@/types/rotation'

// ─── Stage Evaluation ─────────────────────────────────────────────────────────

function getChangePct(data: PriceData, period?: string, days?: number): number {
  if (period === 'day'  || days === 1) return data.change1d_pct
  if (period === 'month')              return data.change1m_pct
  return data.change5d_pct // default: week / 5 days
}

function evaluateStage(
  stage: RotationStage,
  priceMap: Record<string, PriceData>,
): StageStatus {
  const { entry_condition } = stage
  const base: StageStatus = { stage: stage.stage, name: stage.name, triggered: false }

  if (entry_condition.type === 'manual' || entry_condition.type === 'exit_signal') {
    return base
  }

  const symbols     = entry_condition.symbols ?? []
  const stockCodes  = entry_condition.stock_codes ?? []
  const threshold   = entry_condition.threshold_pct ?? 0
  const { period, period_days } = entry_condition

  const allCodes = [...symbols, ...stockCodes]
  const priceDetails: StageStatus['priceData'] = []

  let triggered = false

  for (const code of allCodes) {
    const data = priceMap[code]
    if (!data) continue

    const changePct = getChangePct(data, period, period_days)
    const periodLabel =
      period === 'day'   ? '1日' :
      period === 'month' ? '1月' :
      period_days === 1  ? '1日' : '5日'

    priceDetails.push({ symbol: code, name: data.name, changePct, period: periodLabel })

    if (changePct >= threshold) triggered = true
  }

  return { ...base, triggered, priceData: priceDetails }
}

// ─── Chain Evaluation ─────────────────────────────────────────────────────────

function computeHistoricalHitRate(chain: RotationChain): { rate: number; n: number } {
  const cycles = chain.historical_cycles ?? []
  if (cycles.length === 0) return { rate: 0, n: 0 }
  const hits = cycles.filter(c => c.result === 'hit').length
  return { rate: Math.round((hits / cycles.length) * 100) / 100, n: cycles.length }
}

export function evaluateChain(
  chain: RotationChain,
  priceMap: Record<string, PriceData>,
): ActiveRotation | null {
  const contentStages = chain.stages.filter(s => s.entry_condition.type !== 'exit_signal')
  const exitStage     = chain.stages.find(s => s.entry_condition.type === 'exit_signal') ?? null

  const stageStatuses: StageStatus[] = contentStages.map(s => evaluateStage(s, priceMap))
  const triggeredStages = stageStatuses.filter(s => s.triggered).map(s => s.stage)

  if (triggeredStages.length === 0) return null

  const currentStage = Math.max(...triggeredStages)
  const nextStageObj = contentStages.find(s => s.stage === currentStage + 1) ?? null

  const confidence: ConfidenceLevel =
    triggeredStages.length >= 3 ? 'high'   :
    triggeredStages.length === 2 ? 'medium' : 'low'

  const { rate, n } = computeHistoricalHitRate(chain)

  return {
    chain,
    currentStage,
    totalContentStages: contentStages.length,
    stageStatuses,
    confidence,
    nextStage:          nextStageObj,
    exitStage,
    historicalHitRate:  rate,
    sampleSize:         n,
  }
}

// ─── Full Engine ──────────────────────────────────────────────────────────────

export function runRotationEngine(
  chains: RotationChain[],
  priceMap: Record<string, PriceData>,
  updatedAt: string,
): RotationSignals {
  const active: ActiveRotation[] = []
  const watch: Array<{ chain: RotationChain; closestStage: StageStatus }> = []

  for (const chain of chains) {
    const result = evaluateChain(chain, priceMap)
    if (result) {
      active.push(result)
    } else {
      // For watch list: find the stage closest to triggering
      const contentStages = chain.stages.filter(s => s.entry_condition.type !== 'exit_signal')
      const statuses       = contentStages.map(s => evaluateStage(s, priceMap))
      const firstNotTriggered = statuses.find(s => !s.triggered) ?? statuses[0]
      watch.push({ chain, closestStage: firstNotTriggered })
    }
  }

  // Sort active: higher currentStage (closer to completion) first
  active.sort((a, b) => b.currentStage - a.currentStage)

  return { active, watch, priceMap, updatedAt }
}

// ─── Threads Draft Generator ──────────────────────────────────────────────────

export function generateThreadsDraft(rotation: ActiveRotation): string {
  const { chain, currentStage, stageStatuses, nextStage, historicalHitRate, sampleSize } = rotation

  const triggeredLines = stageStatuses
    .filter(s => s.triggered)
    .map(s => {
      const priceHint = s.priceData?.map(p => `${p.name} ${p.changePct >= 0 ? '+' : ''}${p.changePct.toFixed(1)}% (${p.period})`).join('、') ?? ''
      return `✅ 第${s.stage}棒：${s.name}${priceHint ? `  ${priceHint}` : ''}`
    })
    .join('\n')

  const nextLines = nextStage?.stocks
    ?.map(s => `- ${s.name} ${s.code}${s.typical_gain_pct_min != null ? `（歷史 +${s.typical_gain_pct_min}~${s.typical_gain_pct_max}%）` : ''}`)
    .join('\n') ?? '（待確認）'

  const lagNote = nextStage?.lag_from_prev_stage_days_min != null
    ? `預估時間窗：第${currentStage}棒啟動後 ${nextStage.lag_from_prev_stage_days_min}-${nextStage.lag_from_prev_stage_days_max} 個交易日`
    : ''

  const hitNote = sampleSize >= 3
    ? `歷史 ${sampleSize} 次週期中 ${Math.round(historicalHitRate * sampleSize)} 次發生（命中率 ${(historicalHitRate * 100).toFixed(0)}%）`
    : sampleSize > 0
    ? `樣本不足（n=${sampleSize}），僅供參考`
    : '尚無歷史樣本'

  const today = new Date().toLocaleDateString('zh-TW', { month: 'long', day: 'numeric' })

  return `🔥 類股輪動觀察筆記｜${today}

${chain.name}已進入第 ${currentStage}/${rotation.totalContentStages} 棒：

${triggeredLines}

🎯 下一棒觀察名單（第${currentStage + 1}棒）：
${nextLines}

${lagNote}
${hitNote}

⚠️ 退場訊號尚未觸發

非投資建議，純屬觀察筆記 🙏
#台股 #類股輪動 #${chain.id === 'passive_components_hike' ? '被動元件' : chain.id === 'dram_cycle' ? '記憶體' : 'AI伺服器'}`
}
