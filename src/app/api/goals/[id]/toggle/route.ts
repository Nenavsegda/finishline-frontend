import { NextRequest } from 'next/server'
import { backendFetch } from '@/lib/backend'

export async function PATCH(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return backendFetch(`/goals/${id}/toggle`, { method: 'PATCH' })
}
