export interface MarketIndex {
  code: string
  name: string
  value: number
  change: number
  changePct: number
  updatedAt?: string
}

export interface ETF {
  id: string
  code: string
  name: string
  nameEn?: string
  category: string
  subCategory?: string
  issuer?: string
  nav?: number
  price?: number
  change?: number
  changePct?: number
  volume?: number
  aum?: number
  ter?: number
  trackIndex?: string
  description?: string
  themes?: Theme[]
  aiScore?: AIScore
}

export interface Stock {
  id: string
  code: string
  name: string
  sector?: string
  industry?: string
  marketCap?: number
  price?: number
  change?: number
  changePct?: number
  volume?: number
  pe?: number
  pb?: number
  ceo?: string
  founded?: number
  website?: string
  address?: string
  description?: string
  themes?: Theme[]
  aiScore?: AIScore
}

export interface Theme {
  id: string
  name: string
  nameEn?: string
  category: ThemeCategory
  icon?: string
  description?: string
  tags: string[]
  isHot?: boolean
  etfCount?: number
  stockCount?: number
  etfs?: ETF[]
  stocks?: Stock[]
}

export type ThemeCategory =
  | '半導體鏈'
  | '硬體基建'
  | '元件材料'
  | '能源車用'
  | '消費終端'
  | '智慧應用'
  | '企業IT'
  | '多元產業'
  | 'ETF'
  | 'AI 伺服器'

export interface AIScore {
  total: number
  themeScore?: number
  techScore?: number
  fundScore?: number
  baseScore?: number
  sentiment?: 'bullish' | 'bearish' | 'neutral'
  summary?: string
  analyzedAt?: string
}

export interface NewsItem {
  id: string
  title: string
  summary?: string
  source: string
  url: string
  publishedAt: string
  tags: string[]
  themeTags: string[]
}

export interface HeatmapNode {
  name: string
  value: number       // absolute change %
  changePct: number   // signed change %
  children?: HeatmapNode[]
}

export interface CompanyFilter {
  search: string
  sector?: string
  type: 'all' | 'etf' | 'stock'
  onlyAnalyzed?: boolean
  onlyFavorites?: boolean
}
