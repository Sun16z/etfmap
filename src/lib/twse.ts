const BASE = 'https://openapi.twse.com.tw/v1'

export interface TWSTockRaw {
  Date: string
  Code: string
  Name: string
  TradeVolume: string
  TradeValue: string
  OpeningPrice: string
  HighestPrice: string
  LowestPrice: string
  ClosingPrice: string
  Change: string
  Transaction: string
}

export interface TWIndexRaw {
  Date: string
  OpeningIndex: string
  HighestIndex: string
  LowestIndex: string
  ClosingIndex: string
}

export function rocDateToISO(rocDate: string): string {
  const year = parseInt(rocDate.slice(0, 3)) + 1911
  const month = rocDate.slice(3, 5)
  const day = rocDate.slice(5, 7)
  return `${year}-${month}-${day}`
}

export function parsePrice(s: string): number {
  const n = parseFloat(s.replace(/,/g, ''))
  return isNaN(n) ? 0 : n
}

export function calcChangePct(closing: number, change: number): number {
  const prev = closing - change
  if (prev === 0) return 0
  return (change / prev) * 100
}

export function classifyETF(code: string, name: string): { category: string; subCategory: string } {
  if (code.endsWith('L')) return { category: '槓桿反向型', subCategory: '正2倍' }
  if (code.endsWith('R')) return { category: '槓桿反向型', subCategory: '反1倍' }
  if (code.endsWith('K')) return { category: '槓桿反向型', subCategory: '反2倍' }
  if (/債券|債/.test(name)) return { category: '債券型', subCategory: '債券' }
  if (/REITs|不動產/.test(name)) return { category: 'REITs型', subCategory: 'REITs' }
  if (/黃金|貴金屬|商品/.test(name)) return { category: '商品型', subCategory: '商品' }
  if (/ESG|永續/.test(name)) return { category: '股票型', subCategory: 'ESG' }
  if (/高股息|股息/.test(name)) return { category: '股票型', subCategory: '高股息' }
  if (/半導體/.test(name)) return { category: '股票型', subCategory: '半導體' }
  if (/科技|電子/.test(name)) return { category: '股票型', subCategory: '科技' }
  if (/美國|S&P|SP|納斯達克|Nasdaq/.test(name)) return { category: '股票型', subCategory: '美股' }
  if (/日本|歐洲|新興|全球|世界/.test(name)) return { category: '股票型', subCategory: '海外' }
  if (/金融|銀行/.test(name)) return { category: '股票型', subCategory: '金融' }
  if (/能源|電力|綠能/.test(name)) return { category: '股票型', subCategory: '能源' }
  return { category: '股票型', subCategory: '綜合' }
}

export function isETFCode(code: string): boolean {
  return code.startsWith('0')
}

// Industry → parent category for heatmap
export const INDUSTRY_PARENT: Record<string, string> = {
  '晶圓代工': '半導體鏈',
  'IC設計': '半導體鏈',
  '封測': '半導體鏈',
  '半導體材料': '半導體鏈',
  '記憶體': '半導體鏈',
  'PCB': '硬體基建',
  '被動元件': '硬體基建',
  '連接器': '硬體基建',
  '伺服器': '硬體基建',
  '網通': '硬體基建',
  '電腦周邊': '硬體基建',
  '光電': '硬體基建',
  '顯示器': '消費終端',
  '手機零件': '消費終端',
  '消費電子': '消費終端',
  '車用電子': '能源車用',
  '電動車': '能源車用',
  '功率元件': '能源車用',
  '電池': '能源車用',
  '太陽能': '能源車用',
  '金融保險': '金融',
  '銀行': '金融',
  '券商': '金融',
  '通信網路': '企業IT',
  '電子通路': '企業IT',
  '軟體': '企業IT',
  '航運': '航運',
  '鋼鐵': '傳產',
  '塑膠': '傳產',
  '紡織': '傳產',
  '食品': '傳產',
  '建材': '傳產',
  '化學': '傳產',
  '其他': '其他',
}

// Classify by code range + name keyword
export function classifyStockIndustry(code: string, name: string): { sector: string; industry: string; parent: string } {
  const num = parseInt(code)

  // Name keyword overrides (most accurate)
  if (/台積電|聯電|世界先進|力積電/.test(name)) return { sector: '半導體', industry: '晶圓代工', parent: '半導體鏈' }
  if (/日月光|矽品|南茂|頎邦|菱生/.test(name)) return { sector: '半導體', industry: '封測', parent: '半導體鏈' }
  if (/聯發科|瑞昱|novatek|聯詠|晨星|義隆|凌陽|矽統|天鈺/.test(name)) return { sector: '半導體', industry: 'IC設計', parent: '半導體鏈' }
  if (/台勝科|環球晶|昇陽半導|漢磊/.test(name)) return { sector: '半導體', industry: '半導體材料', parent: '半導體鏈' }
  if (/旺宏|華邦電|南亞科|威剛/.test(name)) return { sector: '半導體', industry: '記憶體', parent: '半導體鏈' }
  if (/鴻海|廣達|緯創|仁寶|英業達|和碩|鴻準/.test(name)) return { sector: '電子製造', industry: '伺服器', parent: '硬體基建' }
  if (/台光電|楠梓電|欣興|耀華|景碩|燿華|金像電/.test(name)) return { sector: '電子', industry: 'PCB', parent: '硬體基建' }
  if (/國巨|華新科|禾伸堂|信昌電|奇力新/.test(name)) return { sector: '電子', industry: '被動元件', parent: '硬體基建' }
  if (/台達電|致茂|健鼎|正崴/.test(name)) return { sector: '電子', industry: '連接器', parent: '硬體基建' }
  if (/智邦|中磊|合勤|友訊|億聯/.test(name)) return { sector: '電子', industry: '網通', parent: '企業IT' }
  if (/大立光|玉晶光|亞光|亨泰光/.test(name)) return { sector: '光電', industry: '光電', parent: '硬體基建' }
  if (/友達|群創|彩晶|瀚彩/.test(name)) return { sector: '光電', industry: '顯示器', parent: '消費終端' }
  if (/和泰|裕隆|中華汽車/.test(name)) return { sector: '汽車', industry: '車用電子', parent: '能源車用' }
  if (/康舒|台達電|上銀/.test(name)) return { sector: '電子', industry: '功率元件', parent: '能源車用' }
  if (/長榮|陽明|萬海|中航/.test(name)) return { sector: '航運', industry: '航運', parent: '航運' }
  if (/台新金|富邦金|國泰金|兆豐金|玉山金|永豐金|第一金|合庫金|中信金|開發金|華南金/.test(name)) return { sector: '金融', industry: '金融保險', parent: '金融' }

  // Code range fallback
  if (num >= 2300 && num < 2330) return { sector: '半導體', industry: '晶圓代工', parent: '半導體鏈' }
  if (num >= 2330 && num < 2400) return { sector: '半導體', industry: 'IC設計', parent: '半導體鏈' }
  if (num >= 2400 && num < 2500) return { sector: '電子', industry: 'PCB', parent: '硬體基建' }
  if (num >= 2500 && num < 2600) return { sector: '建材', industry: '建材', parent: '傳產' }
  if (num >= 2600 && num < 2700) return { sector: '航運', industry: '航運', parent: '航運' }
  if (num >= 2700 && num < 2800) return { sector: '觀光', industry: '其他', parent: '其他' }
  if (num >= 2800 && num < 2900) return { sector: '金融', industry: '金融保險', parent: '金融' }
  if (num >= 3000 && num < 3500) return { sector: '電子', industry: '電腦周邊', parent: '硬體基建' }
  if (num >= 3500 && num < 4000) return { sector: '電子', industry: '被動元件', parent: '硬體基建' }
  if (num >= 4000 && num < 5000) return { sector: '電子', industry: '電腦周邊', parent: '硬體基建' }
  if (num >= 5000 && num < 6000) return { sector: '電子', industry: '電子通路', parent: '企業IT' }
  if (num >= 6000 && num < 7000) return { sector: '通信', industry: '通信網路', parent: '企業IT' }
  if (num >= 1000 && num < 1200) return { sector: '水泥食品', industry: '食品', parent: '傳產' }
  if (num >= 1200 && num < 1400) return { sector: '塑化', industry: '塑膠', parent: '傳產' }
  if (num >= 1400 && num < 1600) return { sector: '紡織', industry: '紡織', parent: '傳產' }
  if (num >= 1600 && num < 2000) return { sector: '機電', industry: '鋼鐵', parent: '傳產' }

  return { sector: '其他', industry: '其他', parent: '其他' }
}

// Keep old function signature for compatibility
export function classifyStockSector(code: string, name: string) {
  const { sector, industry } = classifyStockIndustry(code, name)
  return { sector, industry }
}

export async function fetchAllDailyPrices(): Promise<TWSTockRaw[]> {
  const res = await fetch(`${BASE}/exchangeReport/STOCK_DAY_ALL`, {
    next: { revalidate: 300 },
    headers: { Accept: 'application/json' },
  })
  if (!res.ok) throw new Error(`TWSE STOCK_DAY_ALL failed: ${res.status}`)
  return res.json()
}

export async function fetchTAIEXHistory(): Promise<TWIndexRaw[]> {
  const res = await fetch(`${BASE}/indicesReport/BFIAUU`, {
    next: { revalidate: 300 },
    headers: { Accept: 'application/json' },
  })
  if (!res.ok) throw new Error(`TWSE BFIAUU failed: ${res.status}`)
  return res.json()
}
