'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/goals')
  }, [router])

  return (
    <main className="flex min-h-screen items-center justify-center">
      <p className="text-gray-500">Выполняется вход...</p>
    </main>
  )
}
