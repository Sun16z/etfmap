import { NextResponse } from 'next/server'
import {
  fetchAllDailyPrices,
  isETFCode,
  classifyETF,
  parsePrice,
  calcChangePct,
  rocDateToISO,
} from '@/lib/twse'

export const revalidate = 300

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search') ?? ''
  const category = searchParams.get('category') ?? ''
  const codes = searchParams.get('codes')?.split(',').filter(Boolean) ?? []
  const page = parseInt(searchParams.get('page') ?? '1')
  const limit = parseInt(searchParams.get('limit') ?? '50')

  try {
    const raw = await fetchAllDailyPrices()

    let etfs = raw
      .filter(d => isETFCode(d.Code))
      .map(d => {
        const closing = parsePrice(d.ClosingPrice)
        const change = parsePrice(d.Change)
        const changePct = calcChangePct(closing, change)
        const { category: cat, subCategory } = classifyETF(d.Code, d.Name)
        return {
          id: d.Code,
          code: d.Code,
          name: d.Name,
          category: cat,
          subCategory,
          price: closing,
          change,
          changePct: Math.round(changePct * 100) / 100,
          volume: parseInt(d.TradeVolume.replace(/,/g, '')) || 0,
          tradeValue: parseInt(d.TradeValue.replace(/,/g, '')) || 0,
          transactions: parseInt(d.Transaction) || 0,
          date: rocDateToISO(d.Date),
        }
      })

    if (codes.length > 0) {
      const codeSet = new Set(codes)
      etfs = etfs.filter(e => codeSet.has(e.code))
    }
    if (search) {
      const q = search.toLowerCase()
      etfs = etfs.filter(e =>
        e.name.includes(search) ||
        e.code.toLowerCase().includes(q)
      )
    }
    if (category) {
      etfs = etfs.filter(e => e.category === category || e.subCategory === category)
    }

    // Sort by trade value desc (most active first)
    etfs.sort((a, b) => b.tradeValue - a.tradeValue)

    const total = etfs.length
    const data = etfs.slice((page - 1) * limit, page * limit)

    return NextResponse.json({ data, total, page, limit })
  } catch (error) {
    console.error('[ETF API]', error)
    return NextResponse.json({ error: 'Failed to fetch ETF data from TWSE' }, { status: 500 })
  }
}
