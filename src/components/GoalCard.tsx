'use client'

import { useState } from 'react'
import type { Goal } from '@/lib/api'

interface Props {
  goal: Goal
  onToggle:   (id: string) => void
  onComplete: (id: string) => void
  onDelete:   (id: string) => void
  onEdit:     (goal: Goal) => void
}

function daysLeft(targetDate: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(targetDate)
  return Math.max(0, Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)))
}

export default function GoalCard({ goal, onToggle, onComplete, onDelete, onEdit }: Props) {
  const days = daysLeft(goal.target_date)
  const isActive = goal.is_active === 1
  const [confirming, setConfirming] = useState(false)

  return (
    <div
      className={`rounded-2xl border border-cream-border bg-white p-5 shadow-sm transition-all duration-200 ${
        !isActive ? 'opacity-40' : 'hover:shadow-md hover:border-gray-300'
      }`}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate font-semibold text-gray-900">{goal.title}</h3>
          <p className="mt-0.5 text-sm text-gray-400">
            {new Date(goal.target_date).toLocaleDateString('ru-RU', {
              year: 'numeric', month: 'long', day: 'numeric',
            })}
            {' · '}
            {days > 0 ? `осталось ${days} ${pluralDays(days)}` : 'срок истёк'}
          </p>
        </div>
        <span className="shrink-0 text-lg font-bold text-gray-900">
          €{Number(goal.target_amount).toLocaleString('ru-RU')}
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {confirming ? (
          <>
            <span className="flex items-center text-xs text-gray-500 mr-1">Удалить цель?</span>
            <button
              onClick={() => { onDelete(goal.id); setConfirming(false) }}
              className="rounded-lg bg-red-500 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-red-600"
            >
              Да, удалить
            </button>
            <button
              onClick={() => setConfirming(false)}
              className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-200"
            >
              Отмена
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => onToggle(goal.id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  : 'bg-gray-900 text-white hover:bg-gray-700'
              }`}
            >
              {isActive ? 'Пауза' : 'Активировать'}
            </button>
            <button
              onClick={() => onComplete(goal.id)}
              className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-200"
            >
              Выполнена
            </button>
            <button
              onClick={() => onEdit(goal)}
              className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-200"
            >
              Изменить
            </button>
            <button
              onClick={() => setConfirming(true)}
              className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-500 transition-colors hover:bg-red-100"
            >
              Удалить
            </button>
          </>
        )}
      </div>
    </div>
  )
}

function pluralDays(n: number): string {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return 'день'
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return 'дня'
  return 'дней'
}
