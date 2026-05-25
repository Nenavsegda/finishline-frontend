'use client'

import type { Summary } from '@/lib/api'

type Period = 'daily' | 'weekly' | 'monthly'

const labels: Record<Period, string> = {
  daily: 'в день',
  weekly: 'в неделю',
  monthly: 'в месяц',
}

interface Props {
  summary: Summary
  period: Period
  onPeriodChange: (p: Period) => void
}

export default function SavingsSummary({ summary, period, onPeriodChange }: Props) {

  return (
    <div className="py-4">
      <p className="mb-1 text-sm text-gray-400 tracking-wide uppercase" style={{ fontSize: '11px', letterSpacing: '0.08em' }}>
        Нужно откладывать
      </p>
      <p
        className="mb-4 font-bold leading-none tracking-tight text-gray-900"
        style={{ fontSize: 'clamp(3rem, 10vw, 5.5rem)' }}
      >
        €{summary[period].toLocaleString('ru-RU', { minimumFractionDigits: 2 })}
      </p>
      <div className="flex gap-1">
        {(['daily', 'weekly', 'monthly'] as Period[]).map((p) => (
          <button
            key={p}
            onClick={() => onPeriodChange(p)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              period === p
                ? 'bg-gray-900 text-white'
                : 'text-gray-400 hover:text-gray-700'
            }`}
          >
            {labels[p]}
          </button>
        ))}
      </div>
    </div>
  )
}
