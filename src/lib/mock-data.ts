import type { MarketIndex, ETF, Stock, Theme, NewsItem, HeatmapNode, AIScore } from '@/types'

export const mockIndices: MarketIndex[] = [
  { code: 'NASDAQ', name: '那斯達克', value: 17845.32, change: 165.43, changePct: 0.94 },
  { code: 'SP500', name: 'S&P 500', value: 5612.78, change: 42.11, changePct: 0.76 },
  { code: 'PHLX', name: '費城半導體', value: 4823.56, change: -38.21, changePct: -0.79 },
  { code: 'TSMCADR', name: '台積電 ADR', value: 178.42, change: 2.34, changePct: 1.33 },
  { code: 'NVDA', name: '輝達 NVDA', value: 875.30, change: -12.40, changePct: -1.40 },
  { code: 'NIKKEI', name: '日經 225', value: 38542.10, change: -312.45, changePct: -0.81 },
  { code: 'KOSPI', name: '韓國綜合', value: 2634.56, change: 18.32, changePct: 0.70 },
  { code: 'VIX', name: 'VIX 恐慌', value: 16.45, change: -0.87, changePct: -5.02 },
]

export const mockNews: NewsItem[] = [
  {
    id: '1',
    title: 'AI 伺服器需求持續強勁，台廠供應鏈全面受惠',
    summary: 'Meta、微軟、Google 等科技巨頭持續擴大 AI 基礎建設投資，帶動台灣相關供應鏈出口訂單能見度延伸至明年底，台積電先進製程產能利用率維持高檔。',
    source: '工商時報',
    url: '#',
    publishedAt: new Date().toISOString(),
    tags: ['AI', '伺服器', '台積電'],
    themeTags: ['AI 伺服器組裝', '晶圓代工', 'AI 先進封裝'],
  },
  {
    id: '2',
    title: '電動車滲透率持續攀升，車用半導體缺口擴大',
    summary: '全球電動車銷售年成長率突破 35%，帶動車用 MCU、功率元件、電池管理 IC 等需求大幅增加，多家台灣車用半導體廠訂單能見度達 18 個月以上。',
    source: '電子時報',
    url: '#',
    publishedAt: new Date(Date.now() - 3600000).toISOString(),
    tags: ['電動車', '車用半導體', '功率電感'],
    themeTags: ['車用電子', '功率電感'],
  },
  {
    id: '3',
    title: '台股 ETF 規模創歷史新高，突破 4 兆元大關',
    summary: '台股 ETF 市場快速成長，總規模突破 4 兆元，其中 AI 相關主題 ETF 年增幅超過 120%，吸引大量散戶資金流入，成為台股市場重要推動力。',
    source: '聯合報',
    url: '#',
    publishedAt: new Date(Date.now() - 7200000).toISOString(),
    tags: ['ETF', '台股', '資金流向'],
    themeTags: ['ETF', '科技股'],
  },
]

export const mockThemes: Theme[] = [
  {
    id: 't1', name: 'AI 伺服器組裝', nameEn: 'AI Server Assembly',
    category: 'AI 伺服器', icon: '🖥️',
    description: '涵蓋 AI 伺服器整機設計、組裝與系統整合業者，受惠於全球雲端資本支出大幅成長。',
    tags: ['AI', '伺服器', 'GB200', 'CoWoS'], isHot: true, etfCount: 3, stockCount: 12,
  },
  {
    id: 't2', name: '晶圓代工', nameEn: 'Foundry',
    category: '半導體鏈', icon: '⚙️',
    description: '提供晶圓代工服務，涵蓋先進製程（N2/N3/N5）至成熟製程，台積電為全球龍頭。',
    tags: ['台積電', '先進製程', 'N2', 'N3'], isHot: true, etfCount: 5, stockCount: 8,
  },
  {
    id: 't3', name: 'AI 先進封裝', nameEn: 'Advanced Packaging',
    category: '半導體鏈', icon: '📦',
    description: 'CoWoS、SoIC 等先進封裝技術，整合 HBM 記憶體與 AI 晶片，為 AI 算力瓶頸解方。',
    tags: ['CoWoS', 'SoIC', 'HBM', '封裝'], isHot: true, etfCount: 2, stockCount: 6,
  },
  {
    id: 't4', name: '車用電子', nameEn: 'Automotive Electronics',
    category: '能源車用', icon: '🚗',
    description: '電動車與智慧汽車所需的半導體、感測器、電子控制單元，受惠電動化趨勢。',
    tags: ['電動車', 'MCU', 'ADAS', '功率元件'], isHot: false, etfCount: 2, stockCount: 15,
  },
  {
    id: 't5', name: 'PCB 硬板製造', nameEn: 'PCB Manufacturing',
    category: '硬體基建', icon: '🔌',
    description: '印刷電路板製造，從傳統多層板至 ABF 載板、高速伺服器 PCB，需求受 AI 基建帶動。',
    tags: ['ABF載板', 'PCB', '高速板', '伺服器'], isHot: false, etfCount: 1, stockCount: 18,
  },
  {
    id: 't6', name: '被動元件', nameEn: 'Passive Components',
    category: '元件材料', icon: '🔋',
    description: '電阻、電容、電感等被動元件，廣泛用於各類電子產品，AI 趨勢帶動高階規格需求。',
    tags: ['MLCC', '電阻', '電容', '電感'], isHot: false, etfCount: 1, stockCount: 10,
  },
  {
    id: 't7', name: '雲端與 MSP', nameEn: 'Cloud & MSP',
    category: '企業IT', icon: '☁️',
    description: '雲端服務供應商與受管服務提供商，協助企業導入雲端與 AI 解決方案。',
    tags: ['雲端', 'AWS', 'Azure', 'SaaS'], isHot: false, etfCount: 3, stockCount: 9,
  },
  {
    id: 't8', name: 'IC 設計', nameEn: 'IC Design',
    category: '半導體鏈', icon: '💡',
    description: '無晶圓廠 IC 設計公司，涵蓋 AI 晶片、網通 IC、電源管理、顯示驅動等各類應用。',
    tags: ['IC設計', 'AI晶片', 'GPU', 'ASIC'], isHot: true, etfCount: 4, stockCount: 25,
  },
]

export const mockETFs: ETF[] = [
  {
    id: 'e1', code: '0050', name: '元大台灣50', category: '股票型', subCategory: '大型股',
    issuer: '元大', price: 185.40, change: 1.25, changePct: 0.68,
    aum: 3250.5, ter: 0.43, trackIndex: '台灣50指數',
    description: '追蹤台灣50指數，持有台灣市值最大的50家上市公司，為台股最大 ETF。',
  },
  {
    id: 'e2', code: '00878', name: '國泰永續高股息', category: '股票型', subCategory: 'ESG高股息',
    issuer: '國泰', price: 21.35, change: 0.12, changePct: 0.56,
    aum: 2840.2, ter: 0.67, trackIndex: 'MSCI台灣ESG永續高股息指數',
    description: '結合 ESG 篩選與高股息策略，每季配息，適合追求穩定現金流的投資人。',
  },
  {
    id: 'e3', code: '00929', name: '復華台灣科技優息', category: '股票型', subCategory: '科技高股息',
    issuer: '復華', price: 22.18, change: 0.23, changePct: 1.05,
    aum: 1580.7, ter: 0.71, trackIndex: '台灣科技優息指數',
    description: '聚焦台灣科技股，每月配息，深受存股族青睞。',
  },
  {
    id: 'e4', code: '00632R', name: '元大台灣50反1', category: '槓桿反向型', subCategory: '反向',
    issuer: '元大', price: 8.23, change: -0.08, changePct: -0.96,
    aum: 356.3, ter: 1.08, trackIndex: '台灣50指數',
    description: '每日追蹤台灣50指數報酬的反向1倍，適合短線避險使用。',
  },
  {
    id: 'e5', code: '00646', name: '元大S&P500', category: '股票型', subCategory: '美股',
    issuer: '元大', price: 52.80, change: 0.45, changePct: 0.86,
    aum: 892.1, ter: 0.46, trackIndex: 'S&P 500指數',
    description: '追蹤美國S&P 500指數，以台幣計價投資美股的低成本工具。',
  },
  {
    id: 'e6', code: '00919', name: '群益台灣精選高息', category: '股票型', subCategory: '高股息',
    issuer: '群益', price: 23.42, change: 0.18, changePct: 0.77,
    aum: 1120.4, ter: 0.65, trackIndex: '台灣精選高息指數',
    description: '精選台灣高股息個股，月月配息策略廣受退休族群喜愛。',
  },
]

export const mockStocks: Stock[] = [
  {
    id: 's1', code: '2330', name: '台積電', sector: '半導體', industry: '晶圓代工',
    marketCap: 28500, price: 1020.00, change: 15.00, changePct: 1.49,
    pe: 28.5, pb: 8.2, ceo: '魏哲家', founded: 1987,
    website: 'https://www.tsmc.com', address: '新竹科學園區',
    description: '全球最大晶圓代工廠，掌握全球先進製程主要產能，為 AI 晶片核心製造商。',
  },
  {
    id: 's2', code: '2317', name: '鴻海', sector: '電子', industry: '電子製造服務',
    marketCap: 15200, price: 215.50, change: 3.50, changePct: 1.65,
    pe: 12.4, pb: 1.8, ceo: '劉揚偉', founded: 1974,
    website: 'https://www.foxconn.com', address: '台北市',
    description: '全球最大電子製造服務商，積極轉型 AI 伺服器、電動車等高附加價值領域。',
  },
  {
    id: 's3', code: '2454', name: '聯發科', sector: '半導體', industry: 'IC設計',
    marketCap: 8420, price: 1305.00, change: -28.00, changePct: -2.10,
    pe: 22.1, pb: 5.6, ceo: '蔡力行', founded: 1997,
    website: 'https://www.mediatek.com', address: '新竹市',
    description: '全球前三大 IC 設計公司，主力產品涵蓋手機、電視、IoT、AI 邊緣運算晶片。',
  },
  {
    id: 's4', code: '2379', name: '瑞昱', sector: '半導體', industry: 'IC設計',
    marketCap: 2840, price: 625.00, change: 12.00, changePct: 1.96,
    pe: 18.3, pb: 4.2, ceo: '葉博仁', founded: 1987,
    website: 'https://www.realtek.com', address: '新竹市',
    description: '網路通訊 IC 龍頭，產品廣泛應用於乙太網路、WiFi、音效、儲存控制器等領域。',
  },
]

export const mockHeatmapData: HeatmapNode = {
  name: '台股產業',
  value: 0,
  changePct: 0,
  children: [
    {
      name: '半導體鏈', value: 0, changePct: 0,
      children: [
        { name: '晶圓代工', value: 8.2, changePct: 1.49 },
        { name: 'IC 設計', value: 6.5, changePct: -2.10 },
        { name: 'AI 先進封裝', value: 5.8, changePct: 3.21 },
        { name: 'IC 測試服務', value: 3.2, changePct: 2.31 },
        { name: 'IP 授權與 ASIC', value: 2.8, changePct: -0.87 },
      ],
    },
    {
      name: '硬體基建', value: 0, changePct: 0,
      children: [
        { name: 'AI 伺服器組裝', value: 7.1, changePct: 5.12 },
        { name: 'PCB 硬板製造', value: 4.3, changePct: -1.96 },
        { name: '光感測與元件', value: 3.5, changePct: 4.21 },
        { name: 'CXL 技術', value: 2.1, changePct: 2.18 },
      ],
    },
    {
      name: '元件材料', value: 0, changePct: 0,
      children: [
        { name: '被動元件', value: 3.8, changePct: -1.89 },
        { name: '電池關鍵材料', value: 2.9, changePct: -2.07 },
        { name: '半導體材料', value: 2.4, changePct: -1.36 },
        { name: '玻璃布', value: 1.8, changePct: 1.42 },
      ],
    },
    {
      name: '能源車用', value: 0, changePct: 0,
      children: [
        { name: '車用電子', value: 4.2, changePct: 1.93 },
        { name: '功率電感', value: 3.1, changePct: -1.57 },
        { name: '電子廢料與回收', value: 2.0, changePct: -2.75 },
      ],
    },
    {
      name: '消費終端', value: 0, changePct: 0,
      children: [
        { name: '軟板', value: 9.1, changePct: 7.66 },
        { name: 'IC 載板', value: 6.8, changePct: 6.62 },
        { name: '顯示驅動 IC', value: 3.0, changePct: 1.96 },
        { name: 'PC 筆記型電腦', value: 2.5, changePct: -2.01 },
      ],
    },
    {
      name: '智慧應用', value: 0, changePct: 0,
      children: [
        { name: '類比與功率 IC', value: 4.5, changePct: 2.82 },
        { name: '雲端與 MSP', value: 3.8, changePct: 2.77 },
        { name: '實體 AI 機器人', value: 2.6, changePct: 1.93 },
        { name: 'AR/VR/XR', value: 1.5, changePct: 1.08 },
      ],
    },
    {
      name: '企業IT', value: 0, changePct: 0,
      children: [
        { name: '封測代工機台', value: 5.5, changePct: -1.47 },
        { name: '網通設備', value: 2.8, changePct: -0.99 },
        { name: '銀行金融', value: 2.2, changePct: -1.37 },
      ],
    },
    {
      name: '多元產業', value: 0, changePct: 0,
      children: [
        { name: '國防軍工', value: 3.2, changePct: -1.43 },
        { name: '貨櫃航運', value: 2.8, changePct: -1.89 },
        { name: '封測代工', value: 2.5, changePct: -1.47 },
      ],
    },
  ],
}

export const mockAIScores: Array<{ code: string; name: string; sentiment: string; score: AIScore }> = [
  {
    code: '2330', name: '台積電', sentiment: 'bullish',
    score: { total: 92, themeScore: 95, techScore: 88, fundScore: 94, baseScore: 91, sentiment: 'bullish' },
  },
  {
    code: '0050', name: '元大台灣50', sentiment: 'bullish',
    score: { total: 88, themeScore: 87, techScore: 85, fundScore: 90, baseScore: 90, sentiment: 'bullish' },
  },
  {
    code: '2317', name: '鴻海', sentiment: 'bullish',
    score: { total: 84, themeScore: 90, techScore: 80, fundScore: 82, baseScore: 84, sentiment: 'bullish' },
  },
  {
    code: '2454', name: '聯發科', sentiment: 'neutral',
    score: { total: 76, themeScore: 78, techScore: 72, fundScore: 75, baseScore: 79, sentiment: 'neutral' },
  },
  {
    code: '00878', name: '國泰永續高股息', sentiment: 'bullish',
    score: { total: 82, themeScore: 80, techScore: 83, fundScore: 85, baseScore: 80, sentiment: 'bullish' },
  },
]
