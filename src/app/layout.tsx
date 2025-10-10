import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import BottomNavigation from '@/components/BottomNavigation'

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
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50 pb-20">
          {children}
          <BottomNavigation />
        </div>
      </body>
    </html>
  )
}