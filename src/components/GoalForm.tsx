'use client'

import { useState } from 'react'
import type { Goal } from '@/lib/api'

interface Props {
  initial?: Goal
  onSubmit: (data: { title: string; target_amount: number; target_date: string }) => Promise<void>
  onCancel: () => void
}

export default function GoalForm({ initial, onSubmit, onCancel }: Props) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [amount, setAmount] = useState(initial ? String(initial.target_amount) : '')
  const [date, setDate] = useState(initial?.target_date?.slice(0, 10) ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!title || !amount || !date) {
      setError('All fields are required')
      return
    }
    setLoading(true)
    try {
      await onSubmit({ title, target_amount: Number(amount), target_date: date })
    } catch {
      setError('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-sm text-red-600">{error}</p>}

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Goal name</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="New iPhone, Trip to Egypt..."
          className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Amount ($)</label>
        <input
          type="number"
          min="1"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="1200"
          className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Target date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          min={new Date().toISOString().slice(0, 10)}
          className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
        />
      </div>

      <div className="flex gap-3 pt-1">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 rounded-xl bg-indigo-600 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:opacity-60"
        >
          {loading ? 'Saving...' : initial ? 'Save changes' : 'Add goal'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
