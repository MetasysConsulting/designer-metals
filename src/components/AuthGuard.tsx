'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [ready, setReady] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [authChecked, setAuthChecked] = useState(false)

  useEffect(() => {
    // Allow only exact matches for public routes
    const publicRoutes = new Set<string>(['/'])
    if (pathname && publicRoutes.has(pathname)) {
      setReady(true)
      return
    }
    
    // If we already checked auth and user is valid, don't re-check
    if (authChecked && ready) {
      return
    }
    
    const load = async () => {
      try {
        // Client log for debugging
        console.log('[AuthGuard] Checking membership via /api/me for', pathname)
        const res = await fetch('/api/me')
        if (!res.ok) {
          console.log('[AuthGuard] /api/me not ok, redirecting to /')
          router.replace('/')
          return
        }
        const data = await res.json()
        console.log('[AuthGuard] /api/me result', data)
        if (!data?.authenticated) {
          console.log('[AuthGuard] Not authenticated, redirecting to /')
          router.replace('/')
          return
        }
        if (!data?.inDirectory) {
          // Not in app_users, block
          console.log('[AuthGuard] Not in directory, redirecting to /')
          router.replace('/?unauthorized=1')
          return
        }
        setIsAdmin(data?.user?.role === 'admin')
        console.log('[AuthGuard] Access granted, isAdmin:', data?.user?.role === 'admin')
        setAuthChecked(true)
        setReady(true)
      } catch (e) {
        console.log('[AuthGuard] Exception, redirecting to /', e)
        router.replace('/')
      }
    }
    load()
  }, [router, pathname, authChecked, ready])

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


