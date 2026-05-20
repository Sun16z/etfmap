import { NextResponse } from 'next/server'
import {
  fetchAllDailyPrices,
  isETFCode,
  classifyStockSector,
  parsePrice,
  calcChangePct,
  rocDateToISO,
} from '@/lib/twse'

export const revalidate = 300

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search') ?? ''
  const sector = searchParams.get('sector') ?? ''
  const page = parseInt(searchParams.get('page') ?? '1')
  const limit = parseInt(searchParams.get('limit') ?? '50')

  try {
    const raw = await fetchAllDailyPrices()

    let stocks = raw
      .filter(d => !isETFCode(d.Code) && /^\d{4}$/.test(d.Code))
      .map(d => {
        const closing = parsePrice(d.ClosingPrice)
        const change = parsePrice(d.Change)
        const changePct = calcChangePct(closing, change)
        const { sector: sec, industry } = classifyStockSector(d.Code, d.Name)
        return {
          id: d.Code,
          code: d.Code,
          name: d.Name,
          sector: sec,
          industry,
          price: closing,
          change,
          changePct: Math.round(changePct * 100) / 100,
          volume: parseInt(d.TradeVolume.replace(/,/g, '')) || 0,
          tradeValue: parseInt(d.TradeValue.replace(/,/g, '')) || 0,
          transactions: parseInt(d.Transaction) || 0,
          date: rocDateToISO(d.Date),
        }
      })

    if (search) {
      const q = search.toLowerCase()
      stocks = stocks.filter(s =>
        s.name.includes(search) || s.code.includes(q)
      )
    }
    if (sector) {
      stocks = stocks.filter(s => s.sector === sector)
    }

    // Sort by trade value desc
    stocks.sort((a, b) => b.tradeValue - a.tradeValue)

    const total = stocks.length
    const data = stocks.slice((page - 1) * limit, page * limit)

    return NextResponse.json({ data, total, page, limit })
  } catch (error) {
    console.error('[Stocks API]', error)
    return NextResponse.json({ error: 'Failed to fetch stock data from TWSE' }, { status: 500 })
  }
}
