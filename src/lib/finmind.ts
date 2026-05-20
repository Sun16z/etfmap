const BASE = 'https://api.finmindtrade.com/api/v4/data'

async function query(params: Record<string, string>) {
  const url = new URL(BASE)
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  const res = await fetch(url.toString(), { next: { revalidate: 300 } })
  if (!res.ok) throw new Error(`FinMind error: ${res.status}`)
  return res.json()
}

export async function getTaiwanStockPrice(stockId: string, startDate: string) {
  return query({ dataset: 'TaiwanStockPrice', data_id: stockId, start_date: startDate })
}

export async function getTaiwanETFList() {
  return query({ dataset: 'TaiwanStockInfo' })
}

export async function getTaiwanStockInfo(stockId: string) {
  return query({ dataset: 'TaiwanStockInfo', data_id: stockId })
}

export async function getTaiwanDailyPrice(stockId: string) {
  const today = new Date()
  const startDate = new Date(today)
  startDate.setDate(today.getDate() - 5)
  return query({
    dataset: 'TaiwanStockPrice',
    data_id: stockId,
    start_date: startDate.toISOString().split('T')[0],
  })
}
