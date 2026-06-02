import { NextRequest, NextResponse } from 'next/server'
import { createSession } from '@/lib/session'
import { backendFetch } from '@/lib/backend'

const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'
const GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v2/userinfo'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const frontendUrl = process.env.NEXT_PUBLIC_APP_URL!

  if (error || !code) {
    return NextResponse.redirect(`${frontendUrl}/?error=access_denied`)
  }

  const tokenRes = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
      grant_type: 'authorization_code',
    }),
  })

  if (!tokenRes.ok) {
    return NextResponse.redirect(`${frontendUrl}/?error=token_exchange_failed`)
  }

  const { access_token } = (await tokenRes.json()) as { access_token: string }

  const profileRes = await fetch(GOOGLE_USERINFO_URL, {
    headers: { Authorization: `Bearer ${access_token}` },
  })

  if (!profileRes.ok) {
    return NextResponse.redirect(`${frontendUrl}/?error=profile_fetch_failed`)
  }

  const profile = (await profileRes.json()) as { email: string; name: string; id: string }

  // Upsert user in DB via backend
  const upsertRes = await fetch(`${process.env.BACKEND_URL}/users/upsert`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-internal-token': process.env.INTERNAL_API_SECRET!,
    },
    body: JSON.stringify({ email: profile.email, name: profile.name }),
  })

  if (!upsertRes.ok) {
    return NextResponse.redirect(`${frontendUrl}/?error=user_save_failed`)
  }

  const { userId } = (await upsertRes.json()) as { userId: string }

  await createSession(userId, profile.email)

  return NextResponse.redirect(`${frontendUrl}/goals`)
}
