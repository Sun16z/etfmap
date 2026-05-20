import { NextResponse } from 'next/server'
import { fetchAllDailyPrices, isETFCode, parsePrice, calcChangePct } from '@/lib/twse'

export const revalidate = 300

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')?.trim() ?? ''
  if (q.length < 1) return NextResponse.json({ results: [] })

  try {
    const raw = await fetchAllDailyPrices()
    const lower = q.toLowerCase()

    const results = raw
      .filter(d =>
        d.Code.toLowerCase().startsWith(lower) ||
        d.Name.includes(q)
      )
      .slice(0, 8)
      .map(d => {
        const closing = parsePrice(d.ClosingPrice)
        const change  = parsePrice(d.Change)
        return {
          code:      d.Code,
          name:      d.Name,
          type:      isETFCode(d.Code) ? 'etf' : 'stock',
          price:     closing,
          changePct: closing > 0
            ? Math.round(calcChangePct(closing, change) * 100) / 100
            : 0,
        }
      })

    return NextResponse.json({ results })
  } catch {
    return NextResponse.json({ results: [] })
  }
}
