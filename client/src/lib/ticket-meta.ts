import type { Priority } from '../api/types'

export const PRIORITY_LABELS: Record<Priority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
}

export const PRIORITIES: Priority[] = ['low', 'medium', 'high']

const STATUS_TONES: Record<string, string> = {
  open: 'border-brand-200 bg-brand-50 text-brand-700',
  'in progress': 'border-amber-200 bg-amber-50 text-amber-700',
  resolved: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  closed: 'border-slate-200 bg-slate-100 text-slate-600',
}

export function statusTone(name: string): string {
  return (
    STATUS_TONES[name.trim().toLowerCase()] ??
    'border-slate-200 bg-white text-slate-600'
  )
}

const STATUS_DOTS: Record<string, string> = {
  open: 'bg-brand-500',
  'in progress': 'bg-amber-500',
  resolved: 'bg-emerald-500',
  closed: 'bg-slate-400',
}

export function statusDot(name: string): string {
  return STATUS_DOTS[name.trim().toLowerCase()] ?? 'bg-slate-400'
}

const PRIORITY_TONES: Record<Priority, string> = {
  low: 'border-slate-200 bg-slate-50 text-slate-600',
  medium: 'border-amber-200 bg-amber-50 text-amber-700',
  high: 'border-red-200 bg-red-50 text-red-700',
}

export function priorityTone(priority: Priority): string {
  return PRIORITY_TONES[priority]
}

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

export function formatDateTime(value: string): string {
  const date = new Date(value)

  return Number.isNaN(date.getTime()) ? value : dateFormatter.format(date)
}

export function relativeTime(value: string): string {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return value

  const seconds = Math.round((date.getTime() - Date.now()) / 1000)
  const formatter = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' })
  const ranges: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ['year', 60 * 60 * 24 * 365],
    ['month', 60 * 60 * 24 * 30],
    ['day', 60 * 60 * 24],
    ['hour', 60 * 60],
    ['minute', 60],
  ]

  for (const [unit, secondsInUnit] of ranges) {
    if (Math.abs(seconds) >= secondsInUnit) {
      return formatter.format(Math.round(seconds / secondsInUnit), unit)
    }
  }

  return 'just now'
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}
