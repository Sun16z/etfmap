// ETF 成分股靜態資料（來源：各 ETF 月報，每月更新）
// 格式：{ code, weight(%) }

export interface Holding {
  code: string
  name: string
  weight: number  // %
  sector?: string
}

export interface ETFProfile {
  code: string
  name: string
  issuer: string
  ter: number       // 費用率 %
  aum: number       // 億
  dividendFreq: 'monthly' | 'quarterly' | 'semi-annual' | 'annual'
  dividendYield?: number  // 預估殖利率 %
  trackIndex: string
  holdings: Holding[]
}

export const ETF_PROFILES: Record<string, ETFProfile> = {
  '0050': {
    code: '0050', name: '元大台灣50', issuer: '元大', ter: 0.43, aum: 3250,
    dividendFreq: 'semi-annual', dividendYield: 3.2, trackIndex: '台灣50指數',
    holdings: [
      { code: '2330', name: '台積電', weight: 46.8, sector: '半導體' },
      { code: '2317', name: '鴻海', weight: 5.1, sector: '電子製造' },
      { code: '2454', name: '聯發科', weight: 4.3, sector: '半導體' },
      { code: '2308', name: '台達電', weight: 2.8, sector: '電子' },
      { code: '2882', name: '國泰金', weight: 2.4, sector: '金融' },
      { code: '2881', name: '富邦金', weight: 2.1, sector: '金融' },
      { code: '3711', name: '日月光投控', weight: 1.9, sector: '半導體' },
      { code: '2412', name: '中華電', weight: 1.8, sector: '通信' },
      { code: '2303', name: '聯電', weight: 1.7, sector: '半導體' },
      { code: '1303', name: '南亞', weight: 1.6, sector: '塑化' },
    ],
  },
  '0056': {
    code: '0056', name: '元大高股息', issuer: '元大', ter: 0.93, aum: 2100,
    dividendFreq: 'quarterly', dividendYield: 7.8, trackIndex: '台灣高股息指數',
    holdings: [
      { code: '2330', name: '台積電', weight: 8.2, sector: '半導體' },
      { code: '2454', name: '聯發科', weight: 6.5, sector: '半導體' },
      { code: '2882', name: '國泰金', weight: 5.8, sector: '金融' },
      { code: '2881', name: '富邦金', weight: 5.2, sector: '金融' },
      { code: '2412', name: '中華電', weight: 4.9, sector: '通信' },
      { code: '1301', name: '台塑', weight: 4.1, sector: '塑化' },
      { code: '1303', name: '南亞', weight: 3.8, sector: '塑化' },
      { code: '2308', name: '台達電', weight: 3.5, sector: '電子' },
      { code: '1326', name: '台化', weight: 3.2, sector: '塑化' },
      { code: '2886', name: '兆豐金', weight: 3.0, sector: '金融' },
    ],
  },
  '00878': {
    code: '00878', name: '國泰永續高股息', issuer: '國泰', ter: 0.67, aum: 2840,
    dividendFreq: 'quarterly', dividendYield: 5.8, trackIndex: 'MSCI台灣ESG永續高股息指數',
    holdings: [
      { code: '2330', name: '台積電', weight: 14.5, sector: '半導體' },
      { code: '2317', name: '鴻海', weight: 6.8, sector: '電子製造' },
      { code: '2454', name: '聯發科', weight: 5.9, sector: '半導體' },
      { code: '2882', name: '國泰金', weight: 4.2, sector: '金融' },
      { code: '2308', name: '台達電', weight: 3.9, sector: '電子' },
      { code: '3045', name: '台灣大', weight: 3.5, sector: '通信' },
      { code: '2412', name: '中華電', weight: 3.2, sector: '通信' },
      { code: '2881', name: '富邦金', weight: 3.0, sector: '金融' },
      { code: '2886', name: '兆豐金', weight: 2.8, sector: '金融' },
      { code: '4938', name: '和碩', weight: 2.5, sector: '電子製造' },
    ],
  },
  '00929': {
    code: '00929', name: '復華台灣科技優息', issuer: '復華', ter: 0.71, aum: 1580,
    dividendFreq: 'monthly', dividendYield: 8.5, trackIndex: '台灣科技優息指數',
    holdings: [
      { code: '2330', name: '台積電', weight: 22.3, sector: '半導體' },
      { code: '2317', name: '鴻海', weight: 9.8, sector: '電子製造' },
      { code: '2454', name: '聯發科', weight: 8.5, sector: '半導體' },
      { code: '2308', name: '台達電', weight: 5.6, sector: '電子' },
      { code: '3711', name: '日月光投控', weight: 4.2, sector: '半導體' },
      { code: '2379', name: '瑞昱', weight: 3.8, sector: '半導體' },
      { code: '4938', name: '和碩', weight: 3.5, sector: '電子製造' },
      { code: '3034', name: '聯詠', weight: 3.2, sector: '半導體' },
      { code: '2303', name: '聯電', weight: 2.9, sector: '半導體' },
      { code: '2382', name: '廣達', weight: 2.6, sector: '電子製造' },
    ],
  },
  '00919': {
    code: '00919', name: '群益台灣精選高息', issuer: '群益', ter: 0.65, aum: 1120,
    dividendFreq: 'monthly', dividendYield: 8.2, trackIndex: '台灣精選高息指數',
    holdings: [
      { code: '2330', name: '台積電', weight: 15.6, sector: '半導體' },
      { code: '2317', name: '鴻海', weight: 7.2, sector: '電子製造' },
      { code: '2882', name: '國泰金', weight: 5.5, sector: '金融' },
      { code: '2454', name: '聯發科', weight: 5.1, sector: '半導體' },
      { code: '2881', name: '富邦金', weight: 4.8, sector: '金融' },
      { code: '2308', name: '台達電', weight: 4.2, sector: '電子' },
      { code: '2412', name: '中華電', weight: 3.8, sector: '通信' },
      { code: '3045', name: '台灣大', weight: 3.5, sector: '通信' },
      { code: '2886', name: '兆豐金', weight: 3.2, sector: '金融' },
      { code: '1301', name: '台塑', weight: 2.9, sector: '塑化' },
    ],
  },
  '00646': {
    code: '00646', name: '元大S&P500', issuer: '元大', ter: 0.46, aum: 892,
    dividendFreq: 'semi-annual', dividendYield: 1.3, trackIndex: 'S&P 500指數',
    holdings: [
      { code: 'AAPL', name: 'Apple', weight: 7.1, sector: '科技' },
      { code: 'MSFT', name: 'Microsoft', weight: 6.8, sector: '科技' },
      { code: 'NVDA', name: 'NVIDIA', weight: 6.2, sector: '半導體' },
      { code: 'AMZN', name: 'Amazon', weight: 3.8, sector: '電商' },
      { code: 'GOOGL', name: 'Alphabet', weight: 3.5, sector: '科技' },
      { code: 'META', name: 'Meta', weight: 2.9, sector: '科技' },
      { code: 'TSLA', name: 'Tesla', weight: 1.8, sector: '電動車' },
      { code: 'BRK.B', name: 'Berkshire', weight: 1.7, sector: '金融' },
      { code: 'UNH', name: 'UnitedHealth', weight: 1.5, sector: '醫療' },
      { code: 'JPM', name: 'JPMorgan', weight: 1.4, sector: '金融' },
    ],
  },

  // ── 高股息系列 ──────────────────────────────────────────────
  '00713': {
    code: '00713', name: '元大台灣高息低波', issuer: '元大', ter: 0.45, aum: 520,
    dividendFreq: 'quarterly', dividendYield: 5.9, trackIndex: '台灣高股息低波動指數',
    holdings: [
      { code: '2412', name: '中華電', weight: 6.8, sector: '通信' },
      { code: '2882', name: '國泰金', weight: 6.2, sector: '金融' },
      { code: '2881', name: '富邦金', weight: 5.9, sector: '金融' },
      { code: '1301', name: '台塑', weight: 5.4, sector: '塑化' },
      { code: '1303', name: '南亞', weight: 4.8, sector: '塑化' },
      { code: '2886', name: '兆豐金', weight: 4.5, sector: '金融' },
      { code: '2884', name: '玉山金', weight: 4.2, sector: '金融' },
      { code: '1326', name: '台化', weight: 3.8, sector: '塑化' },
      { code: '2885', name: '元大金', weight: 3.5, sector: '金融' },
      { code: '3045', name: '台灣大', weight: 3.2, sector: '通信' },
    ],
  },
  '00900': {
    code: '00900', name: '富邦特選高股息30', issuer: '富邦', ter: 0.65, aum: 680,
    dividendFreq: 'quarterly', dividendYield: 7.2, trackIndex: '特選台灣高股息30指數',
    holdings: [
      { code: '2330', name: '台積電', weight: 10.5, sector: '半導體' },
      { code: '2454', name: '聯發科', weight: 7.8, sector: '半導體' },
      { code: '2882', name: '國泰金', weight: 6.2, sector: '金融' },
      { code: '2881', name: '富邦金', weight: 5.8, sector: '金融' },
      { code: '2317', name: '鴻海', weight: 5.3, sector: '電子製造' },
      { code: '2308', name: '台達電', weight: 4.8, sector: '電子' },
      { code: '2412', name: '中華電', weight: 4.5, sector: '通信' },
      { code: '2886', name: '兆豐金', weight: 4.0, sector: '金融' },
      { code: '3045', name: '台灣大', weight: 3.5, sector: '通信' },
      { code: '1301', name: '台塑', weight: 3.2, sector: '塑化' },
    ],
  },
  '00907': {
    code: '00907', name: '永豐優息存股', issuer: '永豐', ter: 0.75, aum: 310,
    dividendFreq: 'monthly', dividendYield: 6.8, trackIndex: '台灣優息存股指數',
    holdings: [
      { code: '2330', name: '台積電', weight: 12.0, sector: '半導體' },
      { code: '2882', name: '國泰金', weight: 6.5, sector: '金融' },
      { code: '2881', name: '富邦金', weight: 6.0, sector: '金融' },
      { code: '2412', name: '中華電', weight: 5.5, sector: '通信' },
      { code: '2454', name: '聯發科', weight: 5.0, sector: '半導體' },
      { code: '2317', name: '鴻海', weight: 4.8, sector: '電子製造' },
      { code: '2308', name: '台達電', weight: 4.2, sector: '電子' },
      { code: '2886', name: '兆豐金', weight: 3.8, sector: '金融' },
      { code: '3045', name: '台灣大', weight: 3.5, sector: '通信' },
      { code: '2884', name: '玉山金', weight: 3.2, sector: '金融' },
    ],
  },
  '00915': {
    code: '00915', name: '凱基優選高股息30', issuer: '凱基', ter: 0.67, aum: 285,
    dividendFreq: 'monthly', dividendYield: 7.5, trackIndex: '臺灣指數優選高股息30指數',
    holdings: [
      { code: '2330', name: '台積電', weight: 11.8, sector: '半導體' },
      { code: '2454', name: '聯發科', weight: 7.2, sector: '半導體' },
      { code: '2882', name: '國泰金', weight: 6.0, sector: '金融' },
      { code: '2317', name: '鴻海', weight: 5.5, sector: '電子製造' },
      { code: '2881', name: '富邦金', weight: 5.2, sector: '金融' },
      { code: '2308', name: '台達電', weight: 4.5, sector: '電子' },
      { code: '2412', name: '中華電', weight: 4.0, sector: '通信' },
      { code: '3045', name: '台灣大', weight: 3.8, sector: '通信' },
      { code: '2886', name: '兆豐金', weight: 3.5, sector: '金融' },
      { code: '1301', name: '台塑', weight: 3.0, sector: '塑化' },
    ],
  },
  '00918': {
    code: '00918', name: '大華優利高填息30', issuer: '大華', ter: 0.68, aum: 198,
    dividendFreq: 'monthly', dividendYield: 7.0, trackIndex: '臺灣優利高填息30指數',
    holdings: [
      { code: '2330', name: '台積電', weight: 13.2, sector: '半導體' },
      { code: '2454', name: '聯發科', weight: 6.8, sector: '半導體' },
      { code: '2317', name: '鴻海', weight: 5.8, sector: '電子製造' },
      { code: '2882', name: '國泰金', weight: 5.2, sector: '金融' },
      { code: '2881', name: '富邦金', weight: 4.8, sector: '金融' },
      { code: '2308', name: '台達電', weight: 4.5, sector: '電子' },
      { code: '3711', name: '日月光投控', weight: 4.0, sector: '半導體' },
      { code: '2412', name: '中華電', weight: 3.8, sector: '通信' },
      { code: '2886', name: '兆豐金', weight: 3.5, sector: '金融' },
      { code: '4938', name: '和碩', weight: 3.2, sector: '電子製造' },
    ],
  },
  '00934': {
    code: '00934', name: '中信成長高股息', issuer: '中信', ter: 0.67, aum: 420,
    dividendFreq: 'monthly', dividendYield: 6.5, trackIndex: '臺灣成長高股息指數',
    holdings: [
      { code: '2330', name: '台積電', weight: 18.5, sector: '半導體' },
      { code: '2454', name: '聯發科', weight: 8.5, sector: '半導體' },
      { code: '2317', name: '鴻海', weight: 7.2, sector: '電子製造' },
      { code: '2308', name: '台達電', weight: 5.8, sector: '電子' },
      { code: '3711', name: '日月光投控', weight: 4.5, sector: '半導體' },
      { code: '2382', name: '廣達', weight: 4.2, sector: '電子製造' },
      { code: '2882', name: '國泰金', weight: 3.8, sector: '金融' },
      { code: '2379', name: '瑞昱', weight: 3.5, sector: '半導體' },
      { code: '2303', name: '聯電', weight: 3.2, sector: '半導體' },
      { code: '4938', name: '和碩', weight: 3.0, sector: '電子製造' },
    ],
  },
  '00939': {
    code: '00939', name: '統一台灣高息動能', issuer: '統一', ter: 0.71, aum: 256,
    dividendFreq: 'quarterly', dividendYield: 6.9, trackIndex: '台灣高息動能指數',
    holdings: [
      { code: '2330', name: '台積電', weight: 14.8, sector: '半導體' },
      { code: '2454', name: '聯發科', weight: 6.5, sector: '半導體' },
      { code: '2317', name: '鴻海', weight: 5.9, sector: '電子製造' },
      { code: '2882', name: '國泰金', weight: 5.2, sector: '金融' },
      { code: '2881', name: '富邦金', weight: 4.8, sector: '金融' },
      { code: '2308', name: '台達電', weight: 4.3, sector: '電子' },
      { code: '2412', name: '中華電', weight: 3.9, sector: '通信' },
      { code: '3045', name: '台灣大', weight: 3.5, sector: '通信' },
      { code: '2886', name: '兆豐金', weight: 3.2, sector: '金融' },
      { code: '1301', name: '台塑', weight: 2.8, sector: '塑化' },
    ],
  },
  '00940': {
    code: '00940', name: '元大台灣價值高息', issuer: '元大', ter: 0.71, aum: 1850,
    dividendFreq: 'quarterly', dividendYield: 6.2, trackIndex: '台灣價值高息指數',
    holdings: [
      { code: '2330', name: '台積電', weight: 16.2, sector: '半導體' },
      { code: '2454', name: '聯發科', weight: 7.8, sector: '半導體' },
      { code: '2317', name: '鴻海', weight: 6.5, sector: '電子製造' },
      { code: '2882', name: '國泰金', weight: 5.5, sector: '金融' },
      { code: '2308', name: '台達電', weight: 5.0, sector: '電子' },
      { code: '2881', name: '富邦金', weight: 4.5, sector: '金融' },
      { code: '3711', name: '日月光投控', weight: 4.0, sector: '半導體' },
      { code: '2412', name: '中華電', weight: 3.8, sector: '通信' },
      { code: '2303', name: '聯電', weight: 3.3, sector: '半導體' },
      { code: '4938', name: '和碩', weight: 3.0, sector: '電子製造' },
    ],
  },

  // ── 半導體 / 科技主題 ────────────────────────────────────────
  '00891': {
    code: '00891', name: '中信關鍵半導體', issuer: '中信', ter: 0.68, aum: 380,
    dividendFreq: 'quarterly', dividendYield: 4.5, trackIndex: 'ICE FactSet台灣關鍵半導體指數',
    holdings: [
      { code: '2330', name: '台積電', weight: 28.5, sector: '半導體' },
      { code: '2454', name: '聯發科', weight: 12.8, sector: '半導體' },
      { code: '3711', name: '日月光投控', weight: 8.5, sector: '半導體' },
      { code: '2303', name: '聯電', weight: 6.2, sector: '半導體' },
      { code: '2379', name: '瑞昱', weight: 5.8, sector: '半導體' },
      { code: '3034', name: '聯詠', weight: 5.2, sector: '半導體' },
      { code: '2408', name: '南亞科', weight: 4.8, sector: '半導體' },
      { code: '3533', name: '嘉澤', weight: 4.2, sector: '半導體' },
      { code: '6770', name: '力積電', weight: 3.8, sector: '半導體' },
      { code: '3443', name: '創意', weight: 3.5, sector: '半導體' },
    ],
  },
  '00892': {
    code: '00892', name: '富邦台灣半導體', issuer: '富邦', ter: 0.66, aum: 295,
    dividendFreq: 'quarterly', dividendYield: 4.2, trackIndex: '富時台灣半導體指數',
    holdings: [
      { code: '2330', name: '台積電', weight: 32.8, sector: '半導體' },
      { code: '2454', name: '聯發科', weight: 14.5, sector: '半導體' },
      { code: '3711', name: '日月光投控', weight: 9.2, sector: '半導體' },
      { code: '2303', name: '聯電', weight: 6.8, sector: '半導體' },
      { code: '2379', name: '瑞昱', weight: 5.5, sector: '半導體' },
      { code: '3034', name: '聯詠', weight: 5.0, sector: '半導體' },
      { code: '2408', name: '南亞科', weight: 4.5, sector: '半導體' },
      { code: '6770', name: '力積電', weight: 3.8, sector: '半導體' },
      { code: '3443', name: '創意', weight: 3.2, sector: '半導體' },
      { code: '3529', name: '力旺', weight: 2.8, sector: '半導體' },
    ],
  },
  '00920': {
    code: '00920', name: '富邦台灣核心科技', issuer: '富邦', ter: 0.62, aum: 340,
    dividendFreq: 'quarterly', dividendYield: 5.5, trackIndex: '富時台灣核心科技指數',
    holdings: [
      { code: '2330', name: '台積電', weight: 20.5, sector: '半導體' },
      { code: '2317', name: '鴻海', weight: 10.2, sector: '電子製造' },
      { code: '2454', name: '聯發科', weight: 9.8, sector: '半導體' },
      { code: '2308', name: '台達電', weight: 6.5, sector: '電子' },
      { code: '3711', name: '日月光投控', weight: 5.5, sector: '半導體' },
      { code: '2382', name: '廣達', weight: 5.0, sector: '電子製造' },
      { code: '2379', name: '瑞昱', weight: 4.5, sector: '半導體' },
      { code: '4938', name: '和碩', weight: 4.0, sector: '電子製造' },
      { code: '3034', name: '聯詠', weight: 3.8, sector: '半導體' },
      { code: '2303', name: '聯電', weight: 3.5, sector: '半導體' },
    ],
  },
  '00927': {
    code: '00927', name: '群益半導體收益', issuer: '群益', ter: 0.68, aum: 222,
    dividendFreq: 'monthly', dividendYield: 7.8, trackIndex: '台灣半導體收益指數',
    holdings: [
      { code: '2330', name: '台積電', weight: 25.2, sector: '半導體' },
      { code: '2454', name: '聯發科', weight: 11.5, sector: '半導體' },
      { code: '3711', name: '日月光投控', weight: 8.8, sector: '半導體' },
      { code: '2303', name: '聯電', weight: 6.5, sector: '半導體' },
      { code: '2379', name: '瑞昱', weight: 5.8, sector: '半導體' },
      { code: '3034', name: '聯詠', weight: 5.2, sector: '半導體' },
      { code: '2408', name: '南亞科', weight: 4.8, sector: '半導體' },
      { code: '6770', name: '力積電', weight: 4.2, sector: '半導體' },
      { code: '3443', name: '創意', weight: 3.8, sector: '半導體' },
      { code: '3533', name: '嘉澤', weight: 3.5, sector: '半導體' },
    ],
  },
  '00936': {
    code: '00936', name: '台新臺灣IC設計', issuer: '台新', ter: 0.72, aum: 158,
    dividendFreq: 'quarterly', dividendYield: 5.2, trackIndex: '臺灣IC設計指數',
    holdings: [
      { code: '2454', name: '聯發科', weight: 24.5, sector: '半導體' },
      { code: '2379', name: '瑞昱', weight: 12.8, sector: '半導體' },
      { code: '3034', name: '聯詠', weight: 11.2, sector: '半導體' },
      { code: '3533', name: '嘉澤', weight: 7.5, sector: '半導體' },
      { code: '3443', name: '創意', weight: 6.8, sector: '半導體' },
      { code: '6770', name: '力積電', weight: 5.5, sector: '半導體' },
      { code: '3529', name: '力旺', weight: 5.0, sector: '半導體' },
      { code: '6415', name: '矽力-KY', weight: 4.5, sector: '半導體' },
      { code: '6533', name: '晶心科', weight: 4.0, sector: '半導體' },
      { code: '6770', name: '力積電', weight: 3.5, sector: '半導體' },
    ],
  },

  // ── AI / 5G / 科技主題 ───────────────────────────────────────
  '00881': {
    code: '00881', name: '國泰台灣5G+', issuer: '國泰', ter: 0.71, aum: 265,
    dividendFreq: 'quarterly', dividendYield: 4.8, trackIndex: 'ICE FactSet台灣5G+指數',
    holdings: [
      { code: '2330', name: '台積電', weight: 18.2, sector: '半導體' },
      { code: '2317', name: '鴻海', weight: 9.5, sector: '電子製造' },
      { code: '2454', name: '聯發科', weight: 8.8, sector: '半導體' },
      { code: '2308', name: '台達電', weight: 6.5, sector: '電子' },
      { code: '3045', name: '台灣大', weight: 5.8, sector: '通信' },
      { code: '2412', name: '中華電', weight: 5.2, sector: '通信' },
      { code: '4904', name: '遠傳', weight: 4.8, sector: '通信' },
      { code: '3711', name: '日月光投控', weight: 4.2, sector: '半導體' },
      { code: '2382', name: '廣達', weight: 3.8, sector: '電子製造' },
      { code: '2379', name: '瑞昱', weight: 3.5, sector: '半導體' },
    ],
  },
  '00757': {
    code: '00757', name: '統一FANG+', issuer: '統一', ter: 0.99, aum: 185,
    dividendFreq: 'semi-annual', dividendYield: 0.8, trackIndex: 'NYSE FANG+指數',
    holdings: [
      { code: 'META', name: 'Meta', weight: 10.0, sector: '科技' },
      { code: 'AAPL', name: 'Apple', weight: 10.0, sector: '科技' },
      { code: 'AMZN', name: 'Amazon', weight: 10.0, sector: '電商' },
      { code: 'NFLX', name: 'Netflix', weight: 10.0, sector: '媒體' },
      { code: 'GOOGL', name: 'Alphabet', weight: 10.0, sector: '科技' },
      { code: 'MSFT', name: 'Microsoft', weight: 10.0, sector: '科技' },
      { code: 'NVDA', name: 'NVIDIA', weight: 10.0, sector: '半導體' },
      { code: 'TSLA', name: 'Tesla', weight: 10.0, sector: '電動車' },
      { code: 'SNOW', name: 'Snowflake', weight: 10.0, sector: '雲端' },
      { code: 'CRM', name: 'Salesforce', weight: 10.0, sector: '科技' },
    ],
  },
  '00923': {
    code: '00923', name: '群益台科電', issuer: '群益', ter: 0.69, aum: 195,
    dividendFreq: 'quarterly', dividendYield: 5.1, trackIndex: '台灣科技電子指數',
    holdings: [
      { code: '2330', name: '台積電', weight: 22.8, sector: '半導體' },
      { code: '2317', name: '鴻海', weight: 9.2, sector: '電子製造' },
      { code: '2454', name: '聯發科', weight: 8.5, sector: '半導體' },
      { code: '2308', name: '台達電', weight: 6.2, sector: '電子' },
      { code: '3711', name: '日月光投控', weight: 5.0, sector: '半導體' },
      { code: '2382', name: '廣達', weight: 4.8, sector: '電子製造' },
      { code: '2379', name: '瑞昱', weight: 4.2, sector: '半導體' },
      { code: '4938', name: '和碩', weight: 3.8, sector: '電子製造' },
      { code: '3034', name: '聯詠', weight: 3.5, sector: '半導體' },
      { code: '2303', name: '聯電', weight: 3.2, sector: '半導體' },
    ],
  },

  // ── ESG / 公司治理 ────────────────────────────────────────────
  '00692': {
    code: '00692', name: '富邦公司治理', issuer: '富邦', ter: 0.46, aum: 380,
    dividendFreq: 'annual', dividendYield: 3.5, trackIndex: '台灣公司治理100指數',
    holdings: [
      { code: '2330', name: '台積電', weight: 38.2, sector: '半導體' },
      { code: '2317', name: '鴻海', weight: 6.8, sector: '電子製造' },
      { code: '2454', name: '聯發科', weight: 5.5, sector: '半導體' },
      { code: '2882', name: '國泰金', weight: 4.2, sector: '金融' },
      { code: '2308', name: '台達電', weight: 3.8, sector: '電子' },
      { code: '2881', name: '富邦金', weight: 3.5, sector: '金融' },
      { code: '2412', name: '中華電', weight: 3.0, sector: '通信' },
      { code: '2303', name: '聯電', weight: 2.8, sector: '半導體' },
      { code: '3711', name: '日月光投控', weight: 2.5, sector: '半導體' },
      { code: '1303', name: '南亞', weight: 2.2, sector: '塑化' },
    ],
  },
  '00850': {
    code: '00850', name: '元大臺灣ESG永續', issuer: '元大', ter: 0.46, aum: 290,
    dividendFreq: 'annual', dividendYield: 3.2, trackIndex: 'MSCI台灣ESG領先指數',
    holdings: [
      { code: '2330', name: '台積電', weight: 35.5, sector: '半導體' },
      { code: '2317', name: '鴻海', weight: 7.2, sector: '電子製造' },
      { code: '2454', name: '聯發科', weight: 6.8, sector: '半導體' },
      { code: '2882', name: '國泰金', weight: 4.5, sector: '金融' },
      { code: '2308', name: '台達電', weight: 4.0, sector: '電子' },
      { code: '2881', name: '富邦金', weight: 3.8, sector: '金融' },
      { code: '2412', name: '中華電', weight: 3.2, sector: '通信' },
      { code: '3711', name: '日月光投控', weight: 2.8, sector: '半導體' },
      { code: '2303', name: '聯電', weight: 2.5, sector: '半導體' },
      { code: '1303', name: '南亞', weight: 2.2, sector: '塑化' },
    ],
  },

  // ── 龍頭 / 均等權重 ──────────────────────────────────────────
  '00921': {
    code: '00921', name: '兆豐龍頭等權重', issuer: '兆豐', ter: 0.66, aum: 145,
    dividendFreq: 'quarterly', dividendYield: 5.8, trackIndex: '臺灣龍頭等權重指數',
    holdings: [
      { code: '2330', name: '台積電', weight: 5.0, sector: '半導體' },
      { code: '2317', name: '鴻海', weight: 5.0, sector: '電子製造' },
      { code: '2454', name: '聯發科', weight: 5.0, sector: '半導體' },
      { code: '2882', name: '國泰金', weight: 5.0, sector: '金融' },
      { code: '2308', name: '台達電', weight: 5.0, sector: '電子' },
      { code: '2881', name: '富邦金', weight: 5.0, sector: '金融' },
      { code: '2412', name: '中華電', weight: 5.0, sector: '通信' },
      { code: '2886', name: '兆豐金', weight: 5.0, sector: '金融' },
      { code: '3045', name: '台灣大', weight: 5.0, sector: '通信' },
      { code: '3711', name: '日月光投控', weight: 5.0, sector: '半導體' },
    ],
  },
  '00922': {
    code: '00922', name: '國泰台灣領袖50', issuer: '國泰', ter: 0.62, aum: 175,
    dividendFreq: 'quarterly', dividendYield: 4.2, trackIndex: '富時台灣領袖50指數',
    holdings: [
      { code: '2330', name: '台積電', weight: 30.5, sector: '半導體' },
      { code: '2317', name: '鴻海', weight: 7.5, sector: '電子製造' },
      { code: '2454', name: '聯發科', weight: 6.8, sector: '半導體' },
      { code: '2882', name: '國泰金', weight: 4.5, sector: '金融' },
      { code: '2308', name: '台達電', weight: 4.0, sector: '電子' },
      { code: '2881', name: '富邦金', weight: 3.8, sector: '金融' },
      { code: '3711', name: '日月光投控', weight: 3.5, sector: '半導體' },
      { code: '2412', name: '中華電', weight: 3.0, sector: '通信' },
      { code: '2303', name: '聯電', weight: 2.8, sector: '半導體' },
      { code: '1303', name: '南亞', weight: 2.5, sector: '塑化' },
    ],
  },

  // ── 海外 / 美股 ───────────────────────────────────────────────
  '00733': {
    code: '00733', name: '富邦臺灣中小', issuer: '富邦', ter: 0.55, aum: 165,
    dividendFreq: 'annual', dividendYield: 2.8, trackIndex: '富時台灣中小型指數',
    holdings: [
      { code: '2379', name: '瑞昱', weight: 5.5, sector: '半導體' },
      { code: '3034', name: '聯詠', weight: 5.0, sector: '半導體' },
      { code: '2382', name: '廣達', weight: 4.8, sector: '電子製造' },
      { code: '6669', name: '緯穎', weight: 4.5, sector: '電子製造' },
      { code: '3231', name: '緯創', weight: 4.2, sector: '電子製造' },
      { code: '2301', name: '光寶科', weight: 3.8, sector: '電子' },
      { code: '2308', name: '台達電', weight: 3.5, sector: '電子' },
      { code: '3711', name: '日月光投控', weight: 3.2, sector: '半導體' },
      { code: '2408', name: '南亞科', weight: 3.0, sector: '半導體' },
      { code: '6770', name: '力積電', weight: 2.8, sector: '半導體' },
    ],
  },
  '00937': {
    code: '00937', name: '台新北美科技', issuer: '台新', ter: 0.76, aum: 132,
    dividendFreq: 'quarterly', dividendYield: 1.5, trackIndex: '彭博北美科技指數',
    holdings: [
      { code: 'AAPL', name: 'Apple', weight: 14.5, sector: '科技' },
      { code: 'MSFT', name: 'Microsoft', weight: 13.8, sector: '科技' },
      { code: 'NVDA', name: 'NVIDIA', weight: 12.5, sector: '半導體' },
      { code: 'AMZN', name: 'Amazon', weight: 8.2, sector: '電商' },
      { code: 'GOOGL', name: 'Alphabet', weight: 7.5, sector: '科技' },
      { code: 'META', name: 'Meta', weight: 6.8, sector: '科技' },
      { code: 'TSLA', name: 'Tesla', weight: 3.5, sector: '電動車' },
      { code: 'AVGO', name: 'Broadcom', weight: 3.2, sector: '半導體' },
      { code: 'ORCL', name: 'Oracle', weight: 2.8, sector: '科技' },
      { code: 'AMD', name: 'AMD', weight: 2.5, sector: '半導體' },
    ],
  },
}

// 計算兩個 ETF 的持股重疊度
export function calcOverlap(etf1: ETFProfile, etf2: ETFProfile): {
  overlapWeight: number         // 重疊加權比例 (取兩者最小值相加)
  sharedStocks: Array<{ code: string; name: string; w1: number; w2: number }>
} {
  const map2 = new Map(etf2.holdings.map(h => [h.code, h]))
  const shared = etf1.holdings
    .filter(h => map2.has(h.code))
    .map(h => ({
      code: h.code,
      name: h.name,
      w1: h.weight,
      w2: map2.get(h.code)!.weight,
    }))

  const overlapWeight = shared.reduce((sum, s) => sum + Math.min(s.w1, s.w2), 0)
  return { overlapWeight, sharedStocks: shared }
}

// 供應鏈關係圖資料
export interface SupplyNode {
  id: string
  name: string
  role: '上游' | '中游' | '下游' | '終端'
  sector: string
  marketCap?: number  // 億
}

export interface SupplyEdge {
  source: string
  target: string
  strength: number    // 歷史相關係數 0-1
  description: string
}

export const AI_SUPPLY_CHAIN: { nodes: SupplyNode[]; edges: SupplyEdge[] } = {
  nodes: [
    { id: '2330', name: '台積電', role: '中游', sector: '晶圓代工', marketCap: 28500 },
    { id: '2454', name: '聯發科', role: '上游', sector: 'IC設計', marketCap: 8420 },
    { id: '3711', name: '日月光', role: '中游', sector: '封測', marketCap: 5200 },
    { id: '2382', name: '廣達', role: '下游', sector: '伺服器', marketCap: 3800 },
    { id: '2317', name: '鴻海', role: '下游', sector: '伺服器組裝', marketCap: 15200 },
    { id: '3231', name: '緯創', role: '下游', sector: '伺服器', marketCap: 2100 },
    { id: '6669', name: '緯穎', role: '下游', sector: '伺服器', marketCap: 3500 },
    { id: '2301', name: '光寶科', role: '下游', sector: '電源', marketCap: 1800 },
    { id: '2379', name: '瑞昱', role: '上游', sector: 'IC設計', marketCap: 2840 },
    { id: '2408', name: '南亞科', role: '上游', sector: 'DRAM', marketCap: 1900 },
    { id: '3034', name: '聯詠', role: '上游', sector: 'IC設計', marketCap: 2200 },
    { id: '2308', name: '台達電', role: '下游', sector: '電源模組', marketCap: 8200 },
  ],
  edges: [
    { source: '2454', target: '2330', strength: 0.82, description: 'AI 晶片設計委外代工' },
    { source: '2379', target: '2330', strength: 0.71, description: '網通 IC 代工' },
    { source: '3034', target: '2330', strength: 0.68, description: '顯示驅動 IC 代工' },
    { source: '2408', target: '2330', strength: 0.55, description: 'DRAM 搭配 HBM' },
    { source: '2330', target: '3711', strength: 0.79, description: 'CoWoS 封裝委外' },
    { source: '3711', target: '2382', strength: 0.65, description: 'AI 晶片供給伺服器廠' },
    { source: '3711', target: '2317', strength: 0.73, description: 'AI 晶片供給伺服器廠' },
    { source: '3711', target: '3231', strength: 0.61, description: 'AI 晶片供給伺服器廠' },
    { source: '3711', target: '6669', strength: 0.78, description: 'AI 晶片供給伺服器廠' },
    { source: '2301', target: '2382', strength: 0.58, description: '電源供應模組' },
    { source: '2308', target: '2382', strength: 0.62, description: '伺服器電源' },
    { source: '2308', target: '2317', strength: 0.59, description: '伺服器電源' },
  ],
}
