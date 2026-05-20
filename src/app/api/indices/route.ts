import { NextResponse } from 'next/server'
import { mockIndices } from '@/lib/mock-data'

export const revalidate = 300

export async function GET() {
  try {
    // TODO: Replace with real Yahoo Finance / Alpha Vantage API
    // Simulate small random movement for demo
    const data = mockIndices.map(idx => ({
      ...idx,
      value: idx.value * (1 + (Math.random() - 0.5) * 0.001),
      updatedAt: new Date().toISOString(),
    }))
    return NextResponse.json({ data, updatedAt: new Date().toISOString() })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch indices' }, { status: 500 })
  }
}
