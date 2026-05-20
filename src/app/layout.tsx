import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ETF 地圖 — 台股智慧投資情報',
  description: '全方位台股 ETF 與產業地圖，涵蓋市場熱力圖、題材分析、AI 評分，快速掌握投資機會。',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-TW" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full">{children}</body>
    </html>
  )
}
