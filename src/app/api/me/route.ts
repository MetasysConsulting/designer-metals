import { NextResponse } from 'next/server'
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const { getUser } = getKindeServerSession()
    const user = await getUser()
    console.log('[api/me] Kinde getUser:', !!user && user.id, 'email:', user?.email)
    if (!user || !user.email) {
      console.log('[api/me] Not authenticated')
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }

    // Membership check by email per requirements
    const { data, error } = await supabase
      .from('app_users')
      .select('id, email, name, role, kinde_id')
      .eq('email', user.email)
      .maybeSingle()

    if (error) {
      console.error('app_users fetch error', error)
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }

    if (!data) {
      console.log('[api/me] User not found in app_users; blocking')
      return NextResponse.json({ authenticated: true, inDirectory: false })
    }

    console.log('[api/me] User found in app_users role=', data.role)
    return NextResponse.json({ authenticated: true, inDirectory: true, user: data })
  } catch (e) {
    console.error('[api/me] Exception', e)
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }
}


