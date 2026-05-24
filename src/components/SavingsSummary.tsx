'use client'

import { useState } from 'react'
import type { Summary } from '@/lib/api'

type Period = 'daily' | 'weekly' | 'monthly'

const labels: Record<Period, string> = {
  daily: 'per day',
  weekly: 'per week',
  monthly: 'per month',
}

export default function SavingsSummary({ summary }: { summary: Summary }) {
  const [period, setPeriod] = useState<Period>('monthly')

  return (
    <div className="rounded-2xl bg-indigo-600 p-6 text-white">
      <p className="mb-1 text-sm font-medium text-indigo-200">You need to save</p>
      <p className="mb-4 text-4xl font-bold">
        ${summary[period].toLocaleString('en-US', { minimumFractionDigits: 2 })}
      </p>
      <div className="flex gap-2">
        {(['daily', 'weekly', 'monthly'] as Period[]).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition ${
              period === p ? 'bg-white text-indigo-600' : 'bg-indigo-500 text-white hover:bg-indigo-400'
            }`}
          >
            {labels[p]}
          </button>
        ))}
      </div>
    </div>
  )
}
