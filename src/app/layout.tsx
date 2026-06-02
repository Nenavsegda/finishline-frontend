import type { Metadata } from 'next'
import localFont from 'next/font/local'
import './globals.css'

const lora = localFont({
  src: [
    { path: '../../public/fonts/lora-latin.woff2',    weight: '400 600', style: 'normal' },
    { path: '../../public/fonts/lora-cyrillic.woff2', weight: '400 600', style: 'normal' },
  ],
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
