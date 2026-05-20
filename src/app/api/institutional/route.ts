import { NextResponse } from 'next/server'

export const revalidate = 300

const FINMIND = 'https://api.finmindtrade.com/api/v4/data'

const STOCK_NAMES: Record<string, string> = {
  '2330': '台積電', '2317': '鴻海', '2454': '聯發科',
  '2308': '台達電', '2882': '國泰金', '2881': '富邦金',
  '3711': '日月光投控', '2412': '中華電', '2303': '聯電',
}

function startDate(days: number): string {
  const d = new Date()
  // add buffer for weekends (days * 1.5)
  d.setDate(d.getDate() - Math.ceil(days * 1.5))
  return d.toISOString().slice(0, 10)
}

interface FinMindRow {
  date: string
  stock_id: string
  name: string   // Foreign_Investor | Investment_Trust | Dealer_self | Dealer_Hedging | Foreign_Dealer_Self
  buy: number
  sell: number
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code') ?? '2330'

  try {
    const url = `${FINMIND}?dataset=TaiwanStockInstitutionalInvestorsBuySell&data_id=${code}&start_date=${startDate(40)}`
    const res = await fetch(url, { next: { revalidate: 300 } })
    if (!res.ok) throw new Error(`FinMind ${res.status}`)
    const json = await res.json()
    const rows: FinMindRow[] = json.data ?? []

    // Group by date
    const byDate: Record<string, { foreign: number; trust: number; dealer: number }> = {}
    rows.forEach(r => {
      if (!byDate[r.date]) byDate[r.date] = { foreign: 0, trust: 0, dealer: 0 }
      const net = r.buy - r.sell
      if (r.name === 'Foreign_Investor') byDate[r.date].foreign += net
      if (r.name === 'Investment_Trust') byDate[r.date].trust += net
      if (r.name === 'Dealer_self' || r.name === 'Dealer_Hedging') byDate[r.date].dealer += net
    })

    // Sort dates, take last 30 trading days, convert to millions
    // FinMind units are 千元; divide by 1e5 → 億元 (100M NTD)
    const series = Object.entries(byDate)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-30)
      .map(([date, v]) => ({
        date,
        foreign: Math.round(v.foreign / 1e5),
        trust:   Math.round(v.trust   / 1e5),
        dealer:  Math.round(v.dealer  / 1e5),
        retail:  -Math.round((v.foreign + v.trust + v.dealer) / 1e5),
      }))

    return NextResponse.json({ code, name: STOCK_NAMES[code] ?? code, series })
  } catch (err) {
    console.error('[institutional API]', err)
    return NextResponse.json({ error: 'Failed to fetch institutional data' }, { status: 500 })
  }
}
