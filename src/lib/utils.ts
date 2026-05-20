import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(n: number, decimals = 2): string {
  return n.toFixed(decimals)
}

export function formatChange(change: number, pct: number): string {
  const sign = change >= 0 ? '+' : ''
  return `${sign}${change.toFixed(2)} (${sign}${pct.toFixed(2)}%)`
}

export function formatVolume(vol: number): string {
  if (vol >= 1e8) return `${(vol / 1e8).toFixed(1)}億`
  if (vol >= 1e4) return `${(vol / 1e4).toFixed(1)}萬`
  return vol.toString()
}

export function formatAUM(aum: number): string {
  if (aum >= 1000) return `${(aum / 1000).toFixed(1)}兆`
  return `${aum.toFixed(1)}億`
}

export function changeColor(changePct: number): string {
  if (changePct > 0) return 'text-emerald-400'
  if (changePct < 0) return 'text-red-400'
  return 'text-slate-400'
}

export function changeBg(changePct: number, intensity = 1): string {
  const abs = Math.abs(changePct)
  const opacity = Math.min(abs / 5, 1) * intensity
  if (changePct > 0) return `rgba(16,185,129,${opacity})`
  if (changePct < 0) return `rgba(239,68,68,${opacity})`
  return 'rgba(100,116,139,0.2)'
}

export function sentimentLabel(s?: string): string {
  if (s === 'bullish') return '偏多'
  if (s === 'bearish') return '偏空'
  return '中性'
}

export function sentimentColor(s?: string): string {
  if (s === 'bullish') return 'text-emerald-400'
  if (s === 'bearish') return 'text-red-400'
  return 'text-amber-400'
}
