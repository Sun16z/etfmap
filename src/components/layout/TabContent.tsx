'use client'

import dynamic from 'next/dynamic'

function Spinner() {
  return (
    <div className="flex items-center justify-center py-24">
      <div className="w-8 h-8 rounded-full border-2 border-violet-500/20 border-t-violet-500 animate-spin" />
    </div>
  )
}

const loading = () => <Spinner />

const DailyFocus        = dynamic(() => import('@/components/dashboard/DailyFocus'),         { loading })
const ThemesOverview    = dynamic(() => import('@/components/themes/ThemesOverview'),         { loading })
const IndustryOverview  = dynamic(() => import('@/components/map/IndustryOverview'),          { loading })
const IndustryMap       = dynamic(() => import('@/components/map/IndustryMap'),               { loading })
const CompanyDatabase   = dynamic(() => import('@/components/companies/CompanyDatabase'),     { loading })
const MarketHeatmap     = dynamic(() => import('@/components/heatmap/MarketHeatmap'),         { loading })
const AIAnalysis        = dynamic(() => import('@/components/ai/AIAnalysis'),                 { loading })
const ETFOverlap        = dynamic(() => import('@/components/overlap/ETFOverlap'),            { loading })
const DividendCalendar  = dynamic(() => import('@/components/dividend/DividendCalendar'),     { loading })
const InstitutionalFlow = dynamic(() => import('@/components/institutional/InstitutionalFlow'), { loading })
const SupplyChainSim    = dynamic(() => import('@/components/simulate/SupplyChainSim'),       { loading })
const PortfolioHealth   = dynamic(() => import('@/components/portfolio/PortfolioHealth'),     { loading })
const RotationRadar     = dynamic(() => import('@/components/rotation/RotationRadar'),        { loading })

type Tab = 'daily' | 'themes' | 'overview' | 'map' | 'companies' | 'heatmap' | 'ai'
         | 'overlap' | 'dividend' | 'institutional' | 'simulate' | 'portfolio' | 'rotation'

export default function TabContent({ tab }: { tab: Tab }) {
  switch (tab) {
    case 'daily':         return <DailyFocus />
    case 'themes':        return <ThemesOverview />
    case 'overview':      return <IndustryOverview />
    case 'map':           return <IndustryMap />
    case 'companies':     return <CompanyDatabase />
    case 'heatmap':       return <MarketHeatmap />
    case 'ai':            return <AIAnalysis />
    case 'overlap':       return <ETFOverlap />
    case 'dividend':      return <DividendCalendar />
    case 'institutional': return <InstitutionalFlow />
    case 'simulate':      return <SupplyChainSim />
    case 'portfolio':     return <PortfolioHealth />
    case 'rotation':      return <RotationRadar />
    default:              return <DailyFocus />
  }
}
