import { redirect } from 'next/navigation'

export async function GET() {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
    response_type: 'code',
    scope: 'openid email profile',
    hd: process.env.GOOGLE_ALLOWED_DOMAIN!,
    access_type: 'online',
  })
  redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`)
}
