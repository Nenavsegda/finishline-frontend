import { NextResponse } from 'next/server'
import { getSession } from './session'

const BACKEND_URL = process.env.BACKEND_URL!
const INTERNAL_TOKEN = process.env.INTERNAL_API_SECRET!

export async function backendFetch(
  path: string,
  init: RequestInit = {}
): Promise<NextResponse> {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const res = await fetch(`${BACKEND_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      'x-internal-token': INTERNAL_TOKEN,
      'x-user-id': session.userId,
      ...(init.headers as Record<string, string> | undefined),
    },
  })

  if (res.status === 204) return new NextResponse(null, { status: 204 })

  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}
