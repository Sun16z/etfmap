import { NextResponse } from 'next/server'
import { fetchAllDailyPrices, isETFCode, parsePrice, calcChangePct, classifyStockIndustry } from '@/lib/twse'
import type { PriceData, SectorReturn } from '@/types/rotation'

export const revalidate = 300

export async function GET() {
  try {
    const raw = await fetchAllDailyPrices()

    // ─── Individual Taiwan stock prices ──────────────────────────────────────
    const stockMap: Record<string, PriceData> = {}
    const sectorBuckets: Record<string, number[]> = {}
    const sectorParent: Record<string, string> = {}

    for (const d of raw) {
      if (isETFCode(d.Code) || !/^\d{4}$/.test(d.Code)) continue

      const closing = parsePrice(d.ClosingPrice)
      const change  = parsePrice(d.Change)
      if (closing === 0) continue

      const changePct = calcChangePct(closing, change)
      const { industry, parent } = classifyStockIndustry(d.Code, d.Name)

      stockMap[d.Code] = {
        symbol:       d.Code,
        name:         d.Name,
        price:        closing,
        change1d_pct: Math.round(changePct * 100) / 100,
        change5d_pct: Math.round(changePct * 100) / 100, // TWSE only gives today; use 1d as proxy
        change1m_pct: 0,
        updatedAt:    new Date().toISOString(),
      }

      if (!sectorBuckets[industry]) sectorBuckets[industry] = []
      sectorBuckets[industry].push(changePct)
      sectorParent[industry] = parent
    }

    // ─── Sector median returns ────────────────────────────────────────────────
    const sectors: SectorReturn[] = Object.entries(sectorBuckets)
      .filter(([, vals]) => vals.length >= 3)
      .map(([sector, vals]) => {
        const sorted = [...vals].sort((a, b) => a - b)
        const mid    = Math.floor(sorted.length / 2)
        const median = sorted.length % 2 === 0
          ? (sorted[mid - 1] + sorted[mid]) / 2
          : sorted[mid]
        return {
          sector,
          parent:       sectorParent[sector] ?? '其他',
          change1d_pct: Math.round(median * 100) / 100,
          stockCount:   vals.length,
        }
      })
      .sort((a, b) => b.change1d_pct - a.change1d_pct)

    return NextResponse.json({
      stocks:   stockMap,
      sectors,
      updatedAt: new Date().toISOString(),
    })
  } catch (err) {
    console.error('[sectors]', err)
    return NextResponse.json({ stocks: {}, sectors: [], updatedAt: new Date().toISOString() })
  }
}
