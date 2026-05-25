import type { Metadata } from 'next'
import { Lora } from 'next/font/google'
import './globals.css'

const lora = Lora({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '600'],
  variable: '--font-lora',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'FinishLine',
  description: 'Откладывайте на мечту — каждый день',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={lora.variable}>
      <body className="min-h-screen text-gray-900">{children}</body>
    </html>
  )
}
