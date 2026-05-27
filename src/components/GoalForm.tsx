'use client'

import { useRef, useEffect, useState } from 'react'

interface GoalData {
  title?: string
  target_amount?: number
  target_date?: string
}

interface Props {
  initial?: GoalData
  isEditing?: boolean
  onSubmit: (data: { title: string; target_amount: number; target_date: string }) => Promise<void>
  onCancel: () => void
}

export default function GoalForm({ initial, isEditing = false, onSubmit, onCancel }: Props) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [amount, setAmount] = useState(initial?.target_amount != null ? String(initial.target_amount) : '')
  const [date, setDate] = useState(initial?.target_date?.slice(0, 10) ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const amountRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (initial?.title && !initial?.target_amount) {
      amountRef.current?.focus()
    }
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!title.trim() || !amount || !date) {
      setError('Заполните все поля')
      return
    }
    setLoading(true)
    try {
      await onSubmit({ title: title.trim(), target_amount: Number(amount), target_date: date })
    } catch {
      setError('Что-то пошло не так. Попробуйте ещё раз.')
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    'w-full rounded-xl border border-cream-border bg-cream px-4 py-2.5 text-sm text-gray-900 outline-none placeholder:text-gray-400 transition focus:border-gray-400 focus:bg-white focus:ring-2 focus:ring-gray-100'

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
      )}

      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">Название цели</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Новый iPhone, отпуск в Европе..."
          className={inputClass}
          autoFocus={!initial?.title}
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">Сумма (€)</label>
        <div className="relative">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">€</span>
          <input
            ref={amountRef}
            type="number"
            min="1"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className={`${inputClass} pl-8`}
          />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">Дата цели</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          min={new Date().toISOString().slice(0, 10)}
          max={(() => { const d = new Date(); d.setFullYear(d.getFullYear() + 5); return d.toISOString().slice(0, 10) })()}
          className={inputClass}
        />
      </div>

      <div className="flex gap-3 pt-1">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 rounded-xl bg-gray-900 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-700 active:scale-[0.98] disabled:opacity-40"
        >
          {loading ? 'Сохранение...' : isEditing ? 'Сохранить' : 'Добавить цель'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-xl border border-cream-border py-2.5 text-sm font-medium text-gray-600 transition hover:bg-white"
        >
          Отмена
        </button>
      </div>
    </form>
  )
}
