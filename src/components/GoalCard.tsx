'use client'

import type { Goal } from '@/lib/api'

interface Props {
  goal: Goal
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  onEdit: (goal: Goal) => void
}

function daysLeft(targetDate: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(targetDate)
  return Math.max(0, Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)))
}

export default function GoalCard({ goal, onToggle, onDelete, onEdit }: Props) {
  const days = daysLeft(goal.target_date)
  const isActive = goal.is_active === 1

  return (
    <div className={`rounded-2xl border bg-white p-5 shadow-sm transition ${!isActive ? 'opacity-50' : ''}`}>
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold">{goal.title}</h3>
          <p className="mt-0.5 text-sm text-gray-500">
            {new Date(goal.target_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
            {' · '}
            {days > 0 ? `${days} days left` : 'Deadline passed'}
          </p>
        </div>
        <span className="text-lg font-bold text-indigo-600">
          ${Number(goal.target_amount).toLocaleString('en-US')}
        </span>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onToggle(goal.id)}
          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
            isActive
              ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
          }`}
        >
          {isActive ? 'Deactivate' : 'Activate'}
        </button>
        <button
          onClick={() => onEdit(goal)}
          className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-200"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(goal.id)}
          className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-100"
        >
          Delete
        </button>
      </div>
    </div>
  )
}
