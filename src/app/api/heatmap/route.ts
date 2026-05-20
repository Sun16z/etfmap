import { NextResponse } from 'next/server'
import {
  fetchAllDailyPrices,
  isETFCode,
  classifyStockIndustry,
  parsePrice,
  calcChangePct,
} from '@/lib/twse'

export const revalidate = 300

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const period = searchParams.get('period') ?? 'daily'

  try {
    const raw = await fetchAllDailyPrices()

    // parent → industry → { values }
    type Bucket = { changes: number[]; tradeValue: number }
    const parentMap: Record<string, Record<string, Bucket>> = {}

    raw
      .filter(d => !isETFCode(d.Code) && /^\d{4}$/.test(d.Code))
      .forEach(d => {
        const closing = parsePrice(d.ClosingPrice)
        const change = parsePrice(d.Change)
        if (closing === 0) return

        const changePct = calcChangePct(closing, change)
        const tv = parseInt(d.TradeValue.replace(/,/g, '')) || 0
        const { industry, parent } = classifyStockIndustry(d.Code, d.Name)

        if (!parentMap[parent]) parentMap[parent] = {}
        if (!parentMap[parent][industry]) parentMap[parent][industry] = { changes: [], tradeValue: 0 }
        parentMap[parent][industry].changes.push(changePct)
        parentMap[parent][industry].tradeValue += tv
      })

    const children = Object.entries(parentMap)
      .filter(([, industries]) => Object.keys(industries).length > 0)
      .map(([parentName, industries]) => ({
        name: parentName,
        value: 0,
        changePct: 0,
        children: Object.entries(industries)
          .filter(([, b]) => b.tradeValue > 0)
          .map(([industry, b]) => {
            const avg = b.changes.reduce((a, c) => a + c, 0) / b.changes.length
            return {
              name: industry,
              value: Math.max(b.tradeValue / 1e8, 0.1),
              changePct: Math.round(avg * 100) / 100,
            }
          })
          .sort((a, b) => b.value - a.value),
      }))
      .sort((a, b) =>
        b.children.reduce((s, c) => s + c.value, 0) -
        a.children.reduce((s, c) => s + c.value, 0)
      )

    const data = { name: '台股產業', value: 0, changePct: 0, children }

    return NextResponse.json({ data, period, updatedAt: new Date().toISOString() })
  } catch (error) {
    console.error('[Heatmap API]', error)
    return NextResponse.json({ error: 'Failed to build heatmap' }, { status: 500 })
  }
}
