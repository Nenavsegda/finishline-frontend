'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { api, type Goal, type Summary } from '@/lib/api'
import GoalCard from '@/components/GoalCard'
import GoalForm from '@/components/GoalForm'
import SavingsSummary from '@/components/SavingsSummary'
import Timeline from '@/components/Timeline'

type Period = 'daily' | 'weekly' | 'monthly'

export default function GoalsPage() {
  const router = useRouter()
  const [goals, setGoals] = useState<Goal[]>([])
  const [summary, setSummary] = useState<Summary | null>(null)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  const [initialLoading, setInitialLoading] = useState(true)
  const [quickTitle, setQuickTitle] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [period, setPeriod] = useState<Period>('monthly')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    api.me().catch(() => router.replace('/'))
    loadData(true)
  }, [])

  async function loadData(initial = false) {
    if (initial) setInitialLoading(true)
    try {
      const [g, s] = await Promise.all([api.getGoals(), api.getSummary()])
      setGoals(g)
      setSummary(s)
    } finally {
      if (initial) setInitialLoading(false)
    }
  }

  function handleQuickSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!quickTitle.trim()) return
    setShowForm(true)
  }

  async function handleCreate(data: { title: string; target_amount: number; target_date: string }) {
    await api.createGoal(data)
    setShowForm(false)
    setQuickTitle('')
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
    if (!confirm('Удалить эту цель?')) return
    await api.deleteGoal(id)
    loadData()
  }

  async function handleLogout() {
    await api.logout()
    router.replace('/')
  }

  function cancelForm() {
    setShowForm(false)
    setEditingGoal(null)
    setQuickTitle('')
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  const hasGoals = goals.length > 0
  const activeGoals = goals.filter((g) => g.is_active === 1)
  const isFormOpen = showForm || editingGoal !== null

  return (
    <div className="flex min-h-screen flex-col" style={{ backgroundColor: '#F5F4EF' }}>

      {/* ── Header ── */}

      <header className="flex items-center justify-between px-6 py-4 sm:px-10">
        <div className="flex items-center gap-2">
          {/* Checkered finish flag */}
          <svg width="22" height="17" viewBox="0 0 28 22" fill="none">
            <line x1="3" y1="2" x2="3" y2="20" stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="round"/>
            {[0,1,2].map(row => [0,1,2,3].map(col => (
              <rect key={`${row}-${col}`} x={3+col*6} y={2+row*3} width={6} height={3} fill={(row+col)%2===0?'#1a1a1a':'#ffffff'}/>
            )))}
            <rect x="3" y="2" width="24" height="9" fill="none" stroke="#1a1a1a" strokeWidth="0.6"/>
          </svg>
          <span className="text-[15px] font-semibold tracking-tight text-gray-800">FinishLine</span>
        </div>
        <button
          onClick={handleLogout}
          className="text-sm text-gray-400 transition hover:text-gray-700"
        >
          Выйти
        </button>
      </header>

      {/* ── Main ── */}
      <main className="flex flex-1 flex-col items-center px-4 pb-16 sm:px-6">
        <div className="w-full max-w-2xl">

          {initialLoading ? (
            <div className="flex justify-center pt-32">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-200 border-t-gray-500" />
            </div>
          ) : isFormOpen ? (

            /* ── Goal form ── */
            <div className="pt-10">
              <div className="rounded-3xl border border-[#E5E2DA] bg-white p-7 shadow-sm">
                <div className="mb-6 flex items-center gap-3">
                  <button
                    onClick={cancelForm}
                    className="flex h-8 w-8 items-center justify-center rounded-xl text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                    </svg>
                  </button>
                  <h2 className="text-base font-semibold text-gray-900">
                    {editingGoal ? 'Редактировать цель' : quickTitle ? `«${quickTitle}»` : 'Новая цель'}
                  </h2>
                </div>
                <GoalForm
                  initial={editingGoal ?? { title: quickTitle }}
                  isEditing={!!editingGoal}
                  onSubmit={editingGoal ? handleUpdate : handleCreate}
                  onCancel={cancelForm}
                />
              </div>
            </div>

          ) : (
            <>
              {/* ── Heading (Claude-style) ── */}
              <div className="pb-6 pt-14 text-center sm:pt-20">
                <h1
                  className="text-[2rem] font-semibold leading-tight text-gray-900 sm:text-[2.5rem]"
                  style={{ fontFamily: "var(--font-lora), Georgia, 'Times New Roman', serif" }}
                >
                  Что вы хотите накопить?
                </h1>
              </div>

              {/* ── Input (Claude-style box) ── */}
              <form onSubmit={handleQuickSubmit}>
                <div className="relative rounded-3xl border border-[#E5E2DA] bg-white shadow-[0_2px_16px_rgba(0,0,0,0.07)] transition-shadow focus-within:shadow-[0_4px_24px_rgba(0,0,0,0.11)]">
                  <input
                    ref={inputRef}
                    value={quickTitle}
                    onChange={(e) => setQuickTitle(e.target.value)}
                    placeholder={hasGoals ? 'Добавить ещё одну цель...' : 'Например: отпуск в Барселоне, новый MacBook...'}
                    className="w-full rounded-3xl bg-transparent px-6 py-5 text-[15.5px] text-gray-900 outline-none placeholder:text-gray-400 sm:text-base"
                  />
                  {/* Bottom toolbar row */}
                  <div className="flex items-center justify-end px-4 pb-3 pt-0">
                    <button
                      type="submit"
                      disabled={!quickTitle.trim()}
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-900 text-white shadow-sm transition hover:bg-gray-700 active:scale-95 disabled:opacity-25"
                      title="Далее"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18" />
                      </svg>
                    </button>
                  </div>
                </div>
              </form>

              {/* ── Timeline ── */}
              {hasGoals && (
                <div className="mt-8">
                  <Timeline goals={goals} />
                </div>
              )}

              {/* ── Summary ── */}
              {summary && activeGoals.length > 0 && (
                <div className="mt-6">
                  <SavingsSummary summary={summary} period={period} onPeriodChange={setPeriod} />
                </div>
              )}

              {/* ── Goals list ── */}
              {hasGoals && (
                <div className="mt-4 space-y-3 pb-4">
                  {goals.map((goal) => (
                    <GoalCard
                      key={goal.id}
                      goal={goal}
                      onToggle={handleToggle}
                      onDelete={handleDelete}
                      onEdit={(g) => { setEditingGoal(g); setShowForm(false) }}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  )
}
