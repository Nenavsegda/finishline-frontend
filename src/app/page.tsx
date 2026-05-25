'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

const API = process.env.NEXT_PUBLIC_API_URL

function LoginContent() {
  const params = useSearchParams()
  const error = params.get('error')

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4" style={{ backgroundColor: '#F5F4EF' }}>
      <div className="w-full max-w-sm">
        {/* Finish flag logo */}
        <div className="mb-5 flex justify-center">
          <svg width="56" height="44" viewBox="0 0 28 22" fill="none">
            <line x1="3" y1="2" x2="3" y2="20" stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="round"/>
            {[0,1,2].map(row => [0,1,2,3].map(col => (
              <rect key={`${row}-${col}`} x={3+col*6} y={2+row*3} width={6} height={3} fill={(row+col)%2===0?'#1a1a1a':'#ffffff'}/>
            )))}
            <rect x="3" y="2" width="24" height="9" fill="none" stroke="#1a1a1a" strokeWidth="0.6"/>
          </svg>
        </div>

        {/* Title */}
        <div className="mb-10 text-center">
          <h1
            className="mb-2 text-3xl font-semibold text-gray-900"
            style={{ fontFamily: "var(--font-lora), Georgia, serif" }}
          >
            FinishLine
          </h1>
          <p className="text-[15px] leading-relaxed text-gray-500">
            Откладывайте на мечту — каждый день
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error === 'access_denied'
              ? 'Доступ запрещён. Используйте авторизованный аккаунт.'
              : 'Что-то пошло не так. Попробуйте ещё раз.'}
          </div>
        )}

        {/* Google sign-in */}
        <a
          href={`${API}/auth/google`}
          className="flex w-full items-center justify-center gap-3 rounded-2xl border border-cream-border bg-white px-5 py-3.5 text-[15px] font-medium text-gray-700 shadow-sm transition-all duration-150 hover:shadow-md hover:bg-gray-50 active:scale-[0.98]"
        >
          <svg className="h-[18px] w-[18px] shrink-0" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Войти через Google
        </a>

        <p className="mt-5 text-center text-xs text-gray-400">
          Только аккаунты Google
        </p>
      </div>
    </main>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  )
}
