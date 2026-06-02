import { NextRequest } from 'next/server'
import { backendFetch } from '@/lib/backend'

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json()
  return backendFetch(`/goals/${id}`, { method: 'PUT', body: JSON.stringify(body) })
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return backendFetch(`/goals/${id}`, { method: 'DELETE' })
}
