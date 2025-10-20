'use client'

import { usePathname } from 'next/navigation'
import BottomNavigation from './BottomNavigation'

export default function BottomNavWrapper() {
  const pathname = usePathname()
  // Hide navigation on public landing page
  if (pathname === '/') return null
  return <BottomNavigation />
}


