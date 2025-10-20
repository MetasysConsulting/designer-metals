import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import AuthGuard from '@/components/AuthGuard'
import BottomNavWrapper from '@/components/BottomNavWrapper'
import { Suspense } from 'react'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Designer Metals Dashboard',
  description: 'Sales analytics and customer database management',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Small wrapper to conditionally show bottom nav after auth
  function NavWrapper() {
    const pathname = usePathname()
    // Hide navigation on public landing page
    if (pathname === '/') return null
    return <BottomNavigation />
  }
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthGuard>
          <div className="min-h-screen bg-gray-50 pb-20">
            {children}
            <Suspense>
              <BottomNavWrapper />
            </Suspense>
          </div>
        </AuthGuard>
      </body>
    </html>
  )
}