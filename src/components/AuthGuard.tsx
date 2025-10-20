'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [ready, setReady] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    // Allow only exact matches for public routes
    const publicRoutes = new Set<string>(['/'])
    if (pathname && publicRoutes.has(pathname)) {
      setReady(true)
      return
    }
    const load = async () => {
      try {
        // Client log for debugging
        console.log('[AuthGuard] Checking membership via /api/me for', pathname)
        const res = await fetch('/api/me')
        if (!res.ok) {
          router.replace('/')
          return
        }
        const data = await res.json()
        console.log('[AuthGuard] /api/me result', data)
        if (!data?.authenticated) {
          router.replace('/')
          return
        }
        if (!data?.inDirectory) {
          // Not in app_users, block
          router.replace('/?unauthorized=1')
          return
        }
        setIsAdmin(data?.user?.role === 'admin')
        setReady(true)
      } catch {
        router.replace('/')
      }
    }
    load()
  }, [router, pathname])

  if (!ready) return null
  return <>{children}</>
}

export function useIsAdmin() {
  const [isAdmin, setIsAdmin] = useState(false)
  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch('/api/me')
        if (res.ok) {
          const d = await res.json()
          setIsAdmin(d?.user?.role === 'admin')
        }
      } catch {}
    }
    run()
  }, [])
  return isAdmin
}


