import { NextResponse } from 'next/server'
import type { PriceData } from '@/types/rotation'

export const revalidate = 3600

const SYMBOLS: Record<string, string> = {
  '6981.T': '村田製作所',
  '6976.T': '太陽誘電',
  'MU':     '美光',
  'NVDA':   '輝達',
  'TSLA':   '特斯拉',
  '000660.KS': 'SK 海力士',
}

async function fetchYahooChart(symbol: string): Promise<PriceData> {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=35d`
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0' },
    next: { revalidate: 3600 },
  })
  if (!res.ok) throw new Error(`Yahoo Finance error for ${symbol}: ${res.status}`)

  const json = await res.json()
  const result = json?.chart?.result?.[0]
  if (!result) throw new Error(`No data for ${symbol}`)

  const closes: number[] = (result.indicators?.quote?.[0]?.close ?? []).filter((v: unknown) => v !== null && v !== undefined)
  const meta = result.meta

  const price  = meta.regularMarketPrice ?? closes.at(-1) ?? 0
  const prev1  = closes.at(-2) ?? price
  const prev5  = closes.at(-6) ?? closes[0] ?? price
  const prev22 = closes[0] ?? price

  const change1d = prev1 !== 0 ? ((price - prev1) / prev1) * 100 : 0
  const change5d = prev5 !== 0 ? ((price - prev5) / prev5) * 100 : 0
  const change1m = prev22 !== 0 ? ((price - prev22) / prev22) * 100 : 0

  return {
    symbol,
    name:        SYMBOLS[symbol] ?? symbol,
    price:       Math.round(price * 100) / 100,
    change1d_pct: Math.round(change1d * 100) / 100,
    change5d_pct: Math.round(change5d * 100) / 100,
    change1m_pct: Math.round(change1m * 100) / 100,
    updatedAt:   new Date().toISOString(),
  }
}

export async function GET() {
  const results = await Promise.allSettled(
    Object.keys(SYMBOLS).map(sym => fetchYahooChart(sym))
  )

  const data: Record<string, PriceData> = {}
  results.forEach((r, i) => {
    const sym = Object.keys(SYMBOLS)[i]
    if (r.status === 'fulfilled') {
      data[sym] = r.value
    } else {
      data[sym] = {
        symbol: sym, name: SYMBOLS[sym], price: 0,
        change1d_pct: 0, change5d_pct: 0, change1m_pct: 0,
        updatedAt: new Date().toISOString(),
        error: String(r.reason),
      }
    }
  })

  return NextResponse.json({ data, updatedAt: new Date().toISOString() })
}
