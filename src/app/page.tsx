import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import TabContent from '@/components/layout/TabContent'

type Tab = 'daily' | 'themes' | 'overview' | 'map' | 'companies' | 'heatmap' | 'ai'
         | 'overlap' | 'dividend' | 'institutional' | 'simulate' | 'portfolio' | 'rotation'

const VALID_TABS: Tab[] = [
  'daily', 'themes', 'overview', 'map', 'companies', 'heatmap', 'ai',
  'overlap', 'dividend', 'institutional', 'simulate', 'portfolio', 'rotation',
]

function Spinner() {
  return (
    <div className="flex items-center justify-center py-24">
      <div className="w-8 h-8 rounded-full border-2 border-violet-500/20 border-t-violet-500 animate-spin" />
    </div>
  )
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const params = await searchParams
  const tab = (params.tab ?? 'daily') as Tab

  if (!VALID_TABS.includes(tab)) {
    redirect('/?tab=daily')
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar activeTab={tab} />
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 py-6">
        <Suspense fallback={<Spinner />}>
          <TabContent tab={tab} />
        </Suspense>
      </main>
    </div>
  )
}
