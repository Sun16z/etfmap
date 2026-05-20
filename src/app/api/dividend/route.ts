import { NextResponse } from 'next/server'

export const revalidate = 3600

const FINMIND = 'https://api.finmindtrade.com/api/v4/data'

const ETF_CODES = ['0050', '0056', '00878', '00929', '00919', '00646']

const ETF_NAMES: Record<string, string> = {
  '0050':  '元大台灣50',
  '0056':  '元大高股息',
  '00878': '國泰永續高股息',
  '00929': '復華台灣科技優息',
  '00919': '群益台灣精選高息',
  '00646': '元大S&P500',
}

const COLORS: Record<string, string> = {
  '0050':  '#8b5cf6',
  '0056':  '#3b82f6',
  '00878': '#06b6d4',
  '00929': '#10b981',
  '00919': '#f59e0b',
  '00646': '#f43f5e',
}

export interface DividendEvent {
  code: string
  name: string
  color: string
  year: number
  month: number
  exDivDate: string
  payDate: string
  cashPerUnit: number
  annualYield: number
}

interface FinMindDividend {
  date: string           // announcement date
  stock_id: string
  CashEarningsDistribution: number
  CashExDividendTradingDate: string   // ex-div date "YYYY-MM-DD"
  CashDividendPaymentDate: string     // payout date  "YYYY-MM-DD"
}

async function fetchDividends(code: string, startDate: string): Promise<FinMindDividend[]> {
  const url = `${FINMIND}?dataset=TaiwanStockDividend&data_id=${code}&start_date=${startDate}`
  const res = await fetch(url, { next: { revalidate: 3600 } })
  if (!res.ok) return []
  const json = await res.json()
  return (json.data ?? []) as FinMindDividend[]
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const year = parseInt(searchParams.get('year') ?? String(new Date().getFullYear()))

  // fetch 2 years back to also catch last year's data for yield calculation
  const startDate = `${year - 1}-01-01`

  try {
    const allDividends = await Promise.all(ETF_CODES.map(c => fetchDividends(c, startDate)))

    const events: DividendEvent[] = []

    ETF_CODES.forEach((code, idx) => {
      const divs = allDividends[idx]

      // Compute trailing 12-month annual yield proxy from sum of cash distributions
      const trailing = divs
        .filter(d => d.CashEarningsDistribution > 0)
        .reduce((s, d) => s + d.CashEarningsDistribution, 0)

      divs.forEach(d => {
        if (d.CashEarningsDistribution <= 0) return
        const payDate = d.CashDividendPaymentDate || d.CashExDividendTradingDate
        if (!payDate || !payDate.startsWith(String(year))) return

        const payYear  = parseInt(payDate.slice(0, 4))
        const payMonth = parseInt(payDate.slice(5, 7))

        events.push({
          code,
          name:         ETF_NAMES[code],
          color:        COLORS[code],
          year:         payYear,
          month:        payMonth,
          exDivDate:    d.CashExDividendTradingDate || payDate,
          payDate,
          cashPerUnit:  Math.round(d.CashEarningsDistribution * 100) / 100,
          annualYield:  Math.round(trailing * 10) / 10,
        })
      })
    })

    events.sort((a, b) => a.payDate.localeCompare(b.payDate))
    return NextResponse.json({ events, year })
  } catch (err) {
    console.error('[dividend API]', err)
    return NextResponse.json({ error: 'Failed to fetch dividend data' }, { status: 500 })
  }
}
