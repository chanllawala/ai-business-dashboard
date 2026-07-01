import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import { isClerkConfigured } from '@/lib/clerk'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'NovaBiz — AI-Powered Business Hub',
  description: 'AI-powered multi-business management. Manage customers, sales, employees and more — with an AI advisor that knows your business.',
  icons: { icon: '/favicon.ico' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const body = (
    <html lang="en" className={inter.variable}>
      <body className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen antialiased font-sans">
        {children}
      </body>
    </html>
  )

  return isClerkConfigured() ? <ClerkProvider>{body}</ClerkProvider> : body
}
