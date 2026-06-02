'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { api, type Goal, type Summary } from '@/lib/api'
import GoalCard from '@/components/GoalCard'
import GoalForm from '@/components/GoalForm'
import SavingsSummary from '@/components/SavingsSummary'
import Timeline from '@/components/Timeline'
import FinishFlagIcon from '@/components/FinishFlagIcon'

type Period = 'daily' | 'weekly' | 'monthly'
type Step   = 0 | 1 | 2

const GOAL_LIMIT = 20

function isExpired(targetDate: string) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return new Date(targetDate) < today
}

export default function GoalsPage() {
  const router = useRouter()
  const [goals, setGoals]               = useState<Goal[]>([])
  const [summary, setSummary]           = useState<Summary | null>(null)
  const [editingGoal, setEditingGoal]   = useState<Goal | null>(null)
  const [initialLoading, setInitialLoading] = useState(true)
  const [period, setPeriod]             = useState<Period>('monthly')
  const [pastOpen, setPastOpen]         = useState(false)

  // Progressive create form
  const [step, setStep]           = useState<Step>(0)
  const [quickTitle, setQuickTitle]   = useState('')
  const [quickAmount, setQuickAmount] = useState('')
  const [quickDate, setQuickDate]     = useState('')
  const [creating, setCreating]       = useState(false)
  const [createError, setCreateError] = useState('')

  const titleRef  = useRef<HTMLInputElement>(null)
  const amountRef = useRef<HTMLInputElement>(null)
  const dateRef   = useRef<HTMLInputElement>(null)

  useEffect(() => {
    api.me().catch(() => router.replace('/'))
    loadData(true)
  }, [])

  useEffect(() => {
    if (step === 1) setTimeout(() => amountRef.current?.focus(), 50)
    if (step === 2) setTimeout(() => dateRef.current?.focus(), 50)
  }, [step])

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

  // ── Create form handlers ──────────────────────────────
  function handleTitleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!quickTitle.trim()) return
    setStep(1)
  }

  function handleAmountSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!quickAmount || Number(quickAmount) <= 0) return
    setStep(2)
  }

  async function handleDateSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!quickDate) return
    setCreateError('')
    setCreating(true)
    try {
      await api.createGoal({
        title: quickTitle.trim(),
        target_amount: Number(quickAmount),
        target_date: quickDate,
      })
      resetForm()
      loadData()
    } catch {
      setCreateError('Что-то пошло не так. Попробуйте ещё раз.')
    } finally {
      setCreating(false)
    }
  }

  function resetForm() {
    setStep(0)
    setQuickTitle('')
    setQuickAmount('')
    setQuickDate('')
    setCreateError('')
    setTimeout(() => titleRef.current?.focus(), 50)
  }

  // ── Goal actions ─────────────────────────────────────
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

  async function handleComplete(id: string) {
    await api.completeGoal(id)
    loadData()
  }

  async function handleDelete(id: string) {
    await api.deleteGoal(id)
    loadData()
  }

  async function handleLogout() {
    await api.logout()
    router.replace('/')
  }

  // ── Derived lists ─────────────────────────────────────
  // Past = completed OR expired by date
  const pastGoals    = goals.filter(g => g.is_completed === 1 || isExpired(g.target_date))
  // Current = not past (regardless of is_active toggle)
  const currentGoals = goals.filter(g => g.is_completed === 0 && !isExpired(g.target_date))
  const activeGoals  = currentGoals.filter(g => g.is_active === 1)

  const atLimit   = currentGoals.length >= GOAL_LIMIT
  const hasGoals  = currentGoals.length > 0

  // Shared styles
  const submitBtn =
    'flex h-8 w-8 items-center justify-center rounded-full bg-gray-900 text-white shadow-sm transition hover:bg-gray-700 active:scale-95 disabled:opacity-25'
  const boxClass =
    'relative rounded-3xl border border-[#E5E2DA] bg-white shadow-[0_2px_16px_rgba(0,0,0,0.07)] transition-shadow focus-within:shadow-[0_4px_24px_rgba(0,0,0,0.11)]'

  return (
    <div className="flex min-h-screen flex-col" style={{ backgroundColor: '#F5F4EF' }}>

      {/* ── Header ── */}
      <header className="flex items-center justify-between px-6 py-4 sm:px-10">
        <div className="flex items-center gap-2">
          <FinishFlagIcon size={22} />
          <span className="text-[15px] font-semibold tracking-tight text-gray-800">FinishLine</span>
        </div>
        <button onClick={handleLogout} className="text-sm text-gray-400 transition hover:text-gray-700">
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

          ) : editingGoal ? (

            /* ── Edit form ── */
            <div className="pt-10">
              <div className="rounded-3xl border border-[#E5E2DA] bg-white p-7 shadow-sm">
                <div className="mb-6 flex items-center gap-3">
                  <button
                    onClick={() => setEditingGoal(null)}
                    className="flex h-8 w-8 items-center justify-center rounded-xl text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                    </svg>
                  </button>
                  <h2 className="text-base font-semibold text-gray-900">Редактировать цель</h2>
                </div>
                <GoalForm
                  initial={editingGoal}
                  isEditing
                  onSubmit={handleUpdate}
                  onCancel={() => setEditingGoal(null)}
                />
              </div>
            </div>

          ) : (
            <>
              {/* ── Heading ── */}
              <div className="pb-6 pt-14 text-center sm:pt-20">
                <h1
                  className="text-[2rem] font-semibold leading-tight text-gray-900 sm:text-[2.5rem]"
                  style={{ fontFamily: "var(--font-lora), Georgia, 'Times New Roman', serif" }}
                >
                  Что вы хотите накопить?
                </h1>
              </div>

              {/* ── Progressive create form ── */}
              <div className="space-y-3">

                {/* Step 0 — Title */}
                <div className={boxClass}>
                  {step === 0 ? (
                    atLimit ? (
                      /* Limit reached */
                      <div className="px-6 py-5">
                        <p className="text-sm text-gray-400">
                          Достигнут лимит {GOAL_LIMIT} целей. Удалите одну из существующих, чтобы добавить новую.
                        </p>
                      </div>
                    ) : (
                      <form onSubmit={handleTitleSubmit}>
                        <input
                          ref={titleRef}
                          value={quickTitle}
                          onChange={e => setQuickTitle(e.target.value)}
                          placeholder={hasGoals ? 'Добавить ещё одну цель...' : 'Например: отпуск в Барселоне, новый MacBook...'}
                          className="w-full rounded-3xl bg-transparent px-6 py-5 text-[15.5px] text-gray-900 outline-none placeholder:text-gray-400 sm:text-base"
                          autoFocus
                        />
                        <div className="flex items-center justify-end px-4 pb-3 pt-0">
                          <button type="submit" disabled={!quickTitle.trim()} className={submitBtn} title="Далее">
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18" />
                            </svg>
                          </button>
                        </div>
                      </form>
                    )
                  ) : (
                    /* Locked title */
                    <div className="flex items-center gap-3 px-6 py-5">
                      <button
                        onClick={resetForm}
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-gray-300 transition hover:bg-gray-100 hover:text-gray-600"
                      >
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                        </svg>
                      </button>
                      <span className="text-[15.5px] text-gray-900">{quickTitle}</span>
                    </div>
                  )}
                </div>

                {/* Step 1 — Amount */}
                {step >= 1 && (
                  <div className={`${boxClass} animate-slide-up`}>
                    {step === 1 ? (
                      <form onSubmit={handleAmountSubmit}>
                        <div className="flex items-center px-6 pt-5 pb-1">
                          <span className="mr-2 text-sm text-gray-400">€</span>
                          <input
                            ref={amountRef}
                            type="number"
                            min="1"
                            step="0.01"
                            value={quickAmount}
                            onChange={e => setQuickAmount(e.target.value)}
                            placeholder="Сколько нужно накопить?"
                            className="flex-1 bg-transparent text-[15.5px] text-gray-900 outline-none placeholder:text-gray-400"
                          />
                        </div>
                        <div className="flex justify-end px-4 pb-3 pt-2">
                          <button
                            type="submit"
                            disabled={!quickAmount || Number(quickAmount) <= 0}
                            className={submitBtn}
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18" />
                            </svg>
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="flex items-center gap-2 px-6 py-5">
                        <span className="text-sm text-gray-400">€</span>
                        <span className="text-[15.5px] text-gray-900">{quickAmount}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Step 2 — Date + Save */}
                {step >= 2 && (
                  <div className={`${boxClass} animate-slide-up`}>
                    <form onSubmit={handleDateSubmit}>
                      <div className="px-6 pt-5 pb-1">
                        <input
                          ref={dateRef}
                          type="date"
                          value={quickDate}
                          onChange={e => setQuickDate(e.target.value)}
                          min={new Date().toISOString().slice(0, 10)}
                          max={(() => { const d = new Date(); d.setFullYear(d.getFullYear() + 5); return d.toISOString().slice(0, 10) })()}
                          className="w-full bg-transparent text-[15.5px] text-gray-900 outline-none"
                        />
                      </div>
                      {createError && (
                        <p className="mx-6 mt-2 rounded-lg bg-red-50 px-3 py-1.5 text-sm text-red-600">{createError}</p>
                      )}
                      <div className="flex justify-end px-4 pb-3 pt-2">
                        <button
                          type="submit"
                          disabled={!quickDate || creating}
                          className="rounded-full bg-gray-900 px-5 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-700 active:scale-95 disabled:opacity-40"
                        >
                          {creating ? 'Сохранение...' : 'Добавить цель'}
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>

              {/* ── Timeline ── */}
              {hasGoals && (
                <div className="mt-8">
                  <Timeline goals={currentGoals} />
                </div>
              )}

              {/* ── Summary ── */}
              {summary && activeGoals.length > 0 && (
                <div className="mt-6">
                  <SavingsSummary summary={summary} period={period} onPeriodChange={setPeriod} />
                </div>
              )}

              {/* ── Current goals list ── */}
              {hasGoals && (
                <div className="mt-4 space-y-3">
                  {currentGoals.map(goal => (
                    <GoalCard
                      key={goal.id}
                      goal={goal}
                      onToggle={handleToggle}
                      onComplete={handleComplete}
                      onDelete={handleDelete}
                      onEdit={g => setEditingGoal(g)}
                    />
                  ))}
                </div>
              )}

              {/* ── Past goals (collapsible) ── */}
              {pastGoals.length > 0 && (
                <div className="mt-6 pb-4">
                  <button
                    onClick={() => setPastOpen(o => !o)}
                    className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-sm text-gray-400 transition hover:bg-black/5"
                  >
                    <span className="font-medium">
                      Прошлые цели · {pastGoals.length}
                    </span>
                    <svg
                      className={`h-4 w-4 transition-transform duration-200 ${pastOpen ? 'rotate-180' : ''}`}
                      fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </button>

                  {pastOpen && (
                    <div className="mt-2 space-y-2 animate-slide-up">
                      {pastGoals.map(goal => (
                        <PastGoalItem
                          key={goal.id}
                          goal={goal}
                          onDelete={handleDelete}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  )
}

// ── Past goal item ────────────────────────────────────────
function PastGoalItem({ goal, onDelete }: { goal: Goal; onDelete: (id: string) => void }) {
  const completed = goal.is_completed === 1
  const [confirming, setConfirming] = useState(false)

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-[#E5E2DA] bg-white px-4 py-3">
      {/* Icon: ✓ for completed, ✕ for expired */}
      <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
        completed ? 'bg-gray-100 text-gray-500' : 'bg-gray-100 text-gray-400'
      }`}>
        {completed ? '✓' : '✕'}
      </span>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-gray-400">{goal.title}</p>
        <p className="text-xs text-gray-300">
          €{Number(goal.target_amount).toLocaleString('ru-RU')}
          {' · '}
          {new Date(goal.target_date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' })}
        </p>
      </div>

      {/* Delete */}
      {confirming ? (
        <div className="flex shrink-0 items-center gap-1.5">
          <button
            onClick={() => { onDelete(goal.id); setConfirming(false) }}
            className="rounded-lg bg-red-500 px-2 py-1 text-xs font-medium text-white transition hover:bg-red-600"
          >
            Удалить
          </button>
          <button
            onClick={() => setConfirming(false)}
            className="rounded-lg bg-gray-100 px-2 py-1 text-xs font-medium text-gray-500 transition hover:bg-gray-200"
          >
            Отмена
          </button>
        </div>
      ) : (
        <button
          onClick={() => setConfirming(true)}
          className="shrink-0 rounded-lg p-1.5 text-gray-300 transition hover:bg-red-50 hover:text-red-400"
          title="Удалить"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  )
}
