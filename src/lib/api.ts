const BASE = process.env.NEXT_PUBLIC_API_URL

export interface Goal {
  id: string
  user_id: string
  title: string
  target_amount: number
  target_date: string
  is_active: number
  is_completed: number
  created_at: string
  updated_at: string
}

export interface Summary {
  daily: number
  weekly: number
  monthly: number
}

async function req<T>(path: string, options?: RequestInit): Promise<T> {
  const headers: Record<string, string> = options?.body ? { 'Content-Type': 'application/json' } : {}
  const res = await fetch(`${BASE}${path}`, {
    credentials: 'include',
    ...options,
    headers,
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  if (res.status === 204) return undefined as T
  return res.json()
}

export const api = {
  me: () => req<{ userId: string; email: string }>('/auth/me'),
  logout: () => req<void>('/auth/logout', { method: 'POST' }),
  getGoals: () => req<Goal[]>('/goals'),
  createGoal: (body: { title: string; target_amount: number; target_date: string }) =>
    req<Goal>('/goals', { method: 'POST', body: JSON.stringify(body) }),
  updateGoal: (id: string, body: Partial<{ title: string; target_amount: number; target_date: string }>) =>
    req<Goal>(`/goals/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  toggleGoal:    (id: string) => req<Goal>(`/goals/${id}/toggle`,   { method: 'PATCH' }),
  completeGoal:  (id: string) => req<Goal>(`/goals/${id}/complete`, { method: 'PATCH' }),
  deleteGoal:    (id: string) => req<void>(`/goals/${id}`,          { method: 'DELETE' }),
  getSummary: () => req<Summary>('/goals/summary'),
}
