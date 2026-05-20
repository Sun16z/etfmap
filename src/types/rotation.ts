// ─── Knowledge Base Types ───────────────────────────────────────────────────

export interface CommodityIndicator {
  id: string
  name: string
  symbol: string
  affects_sectors: string[]
  lag_days_min: number
  lag_days_max: number
  trigger: {
    type: 'price_change'
    period: 'day' | 'week' | 'month'
    threshold_pct: number
  }
  historical_hit_rate: number
  note?: string
}

export interface OverseasCompanyIndicator {
  id: string
  name: string
  symbol: string
  sector: string
  event_type: string
  news_keywords: string[]
  affects_tw_codes: string[]
  secondary_affects_tw_codes?: string[]
  secondary_lag_min?: number
  secondary_lag_max?: number
  lag_days_min: number
  lag_days_max: number
  historical_hit_rate: number
  note?: string
  sample_events?: Array<{ date: string; description: string }>
}

export interface LeadingIndicators {
  version: string
  commodities: CommodityIndicator[]
  overseas_companies: OverseasCompanyIndicator[]
}

// ─── Rotation Chain Types ────────────────────────────────────────────────────

export type StageConditionType =
  | 'commodity_change'
  | 'overseas_price_change'
  | 'stock_gain'
  | 'exit_signal'
  | 'manual'

export interface StageEntryCondition {
  type: StageConditionType
  symbols?: string[]
  stock_codes?: string[]
  period?: 'day' | 'week' | 'month'
  period_days?: number
  threshold_pct?: number
  description?: string
}

export interface StageStock {
  code: string
  name: string
  typical_gain_pct_min?: number
  typical_gain_pct_max?: number
}

export interface ExitSignal {
  label: string
  type: string
  days?: number
  stocks?: string[]
  symbols?: string[]
  period?: string
  threshold_pct?: number
}

export interface RotationStage {
  stage: number
  name: string
  description?: string
  entry_condition: StageEntryCondition
  lag_from_prev_stage_days_min?: number
  lag_from_prev_stage_days_max?: number
  stocks: StageStock[]
  typical_duration_days?: number
  exit_signals?: ExitSignal[]
  sample_events?: string[]
}

export interface HistoricalCycle {
  period: string
  description: string
  duration_days: number
  note?: string
  result: 'hit' | 'miss'
}

export interface RotationChain {
  id: string
  name: string
  description: string
  stages: RotationStage[]
  historical_cycles?: HistoricalCycle[]
}

export interface RotationChains {
  version: string
  chains: RotationChain[]
}

// ─── Live Market Data Types ──────────────────────────────────────────────────

export interface PriceData {
  symbol: string
  name: string
  price: number
  change1d_pct: number
  change5d_pct: number
  change1m_pct: number
  updatedAt: string
  error?: string
}

export interface SectorReturn {
  sector: string
  parent: string
  change1d_pct: number
  stockCount: number
}

// ─── Engine Output Types ─────────────────────────────────────────────────────

export type ConfidenceLevel = 'high' | 'medium' | 'low'

export interface StageStatus {
  stage: number
  name: string
  triggered: boolean
  priceData?: { symbol: string; name: string; changePct: number; period: string }[]
}

export interface ActiveRotation {
  chain: RotationChain
  currentStage: number       // highest triggered stage
  totalContentStages: number // excluding exit stage
  stageStatuses: StageStatus[]
  confidence: ConfidenceLevel
  nextStage: RotationStage | null
  exitStage: RotationStage | null
  historicalHitRate: number  // from chain's historical_cycles hit rate
  sampleSize: number
}

export interface RotationSignals {
  active: ActiveRotation[]
  watch: Array<{ chain: RotationChain; closestStage: StageStatus }>
  priceMap: Record<string, PriceData>
  updatedAt: string
}
