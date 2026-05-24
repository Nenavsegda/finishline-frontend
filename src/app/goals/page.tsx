'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { api, type Goal, type Summary } from '@/lib/api'
import GoalCard from '@/components/GoalCard'
import GoalForm from '@/components/GoalForm'
import SavingsSummary from '@/components/SavingsSummary'

export default function GoalsPage() {
  const router = useRouter()
  const [goals, setGoals] = useState<Goal[]>([])
  const [summary, setSummary] = useState<Summary | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.me().catch(() => router.replace('/'))
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    try {
      const [g, s] = await Promise.all([api.getGoals(), api.getSummary()])
      setGoals(g)
      setSummary(s)
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate(data: { title: string; target_amount: number; target_date: string }) {
    await api.createGoal(data)
    setShowForm(false)
    loadData()
  }

  async function handleUpdate(data: { title: string; target_amount: number; target_date: string }) {
    if (!editingGoal) return
    await api.updateGoal(editingGoal.id, data)
    setEditingGoal(null)
    loadData()
  }

  async function handleToggle(id: string) {
    await api.toggleGoal(id)
    loadData()
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this goal?')) return
    await api.deleteGoal(id)
    loadData()
  }

  async function handleLogout() {
    await api.logout()
    router.replace('/')
  }

  return (
    <main className="mx-auto max-w-lg px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">FinishLine</h1>
        <button onClick={handleLogout} className="text-sm text-gray-400 hover:text-gray-600">
          Sign out
        </button>
      </div>

      {summary && <div className="mb-6"><SavingsSummary summary={summary} /></div>}

      {(showForm || editingGoal) && (
        <div className="mb-6 rounded-2xl border bg-white p-5 shadow-sm">
          <h2 className="mb-4 font-semibold">{editingGoal ? 'Edit goal' : 'New goal'}</h2>
          <GoalForm
            initial={editingGoal ?? undefined}
            onSubmit={editingGoal ? handleUpdate : handleCreate}
            onCancel={() => { setShowForm(false); setEditingGoal(null) }}
          />
        </div>
      )}

      {!showForm && !editingGoal && (
        <button
          onClick={() => setShowForm(true)}
          className="mb-6 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-gray-200 py-4 text-sm font-medium text-gray-400 transition hover:border-indigo-300 hover:text-indigo-500"
        >
          + Add goal
        </button>
      )}

      {loading ? (
        <p className="text-center text-sm text-gray-400">Loading...</p>
      ) : goals.length === 0 ? (
        <p className="text-center text-sm text-gray-400">No goals yet. Add your first one above.</p>
      ) : (
        <div className="space-y-3">
          {goals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onToggle={handleToggle}
              onDelete={handleDelete}
              onEdit={setEditingGoal}
            />
          ))}
        </div>
      )}
    </main>
  )
}
