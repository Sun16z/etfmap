import { NextResponse } from 'next/server'
import { readFileSync } from 'fs'
import { join } from 'path'
import yaml from 'js-yaml'
import type { LeadingIndicators, RotationChains, PriceData } from '@/types/rotation'
import { runRotationEngine } from '@/lib/rotation-engine'

export const revalidate = 3600

function loadYaml<T>(filename: string): T {
  const fp = join(process.cwd(), 'knowledge', filename)
  return yaml.load(readFileSync(fp, 'utf8')) as T
}

async function fetchPriceApi(path: string): Promise<Record<string, PriceData>> {
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'
  try {
    const res  = await fetch(`${base}${path}`, { next: { revalidate: 3600 } })
    const json = await res.json()
    return json.data ?? {}
  } catch {
    return {}
  }
}

async function fetchTwStockApi(): Promise<Record<string, PriceData>> {
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'
  try {
    const res  = await fetch(`${base}/api/rotation/sectors`, { next: { revalidate: 300 } })
    const json = await res.json()
    return json.stocks ?? {}
  } catch {
    return {}
  }
}

export async function GET() {
  try {
    // ── Load knowledge base ──────────────────────────────────────────────────
    const chains = loadYaml<RotationChains>('rotation_chains.yaml')

    // ── Fetch all price data in parallel ─────────────────────────────────────
    const [commodities, overseas, twStocks] = await Promise.all([
      fetchPriceApi('/api/rotation/commodities'),
      fetchPriceApi('/api/rotation/overseas'),
      fetchTwStockApi(),
    ])

    const priceMap: Record<string, PriceData> = {
      ...commodities,
      ...overseas,
      ...twStocks,
    }

    // ── Run engine ───────────────────────────────────────────────────────────
    const signals = runRotationEngine(chains.chains, priceMap, new Date().toISOString())

    return NextResponse.json(signals)
  } catch (err) {
    console.error('[signals]', err)
    return NextResponse.json(
      { active: [], watch: [], priceMap: {}, updatedAt: new Date().toISOString(), error: String(err) },
      { status: 500 }
    )
  }
}
