import { NextResponse } from 'next/server'
import { mockAIScores } from '@/lib/mock-data'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type') ?? 'deep' // deep | short | wave
  const sentiment = searchParams.get('sentiment') ?? 'bullish' // bullish | bearish

  // TODO: Integrate Claude API for real AI analysis scoring
  // Example: call Claude with stock news + technicals → return structured score
  const data = sentiment === 'bearish'
    ? mockAIScores.filter(s => s.sentiment === 'bearish')
    : mockAIScores.filter(s => s.sentiment !== 'bearish')

  return NextResponse.json({ data, type, updatedAt: new Date().toISOString() })
}
