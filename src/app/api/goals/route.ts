import { NextRequest } from 'next/server'
import { backendFetch } from '@/lib/backend'

export async function GET() {
  return backendFetch('/goals')
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  return backendFetch('/goals', { method: 'POST', body: JSON.stringify(body) })
}
