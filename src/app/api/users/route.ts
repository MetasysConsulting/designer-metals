import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'

// GET: list users (admin only)
export async function GET() {
  try {
    const { getUser } = getKindeServerSession()
    const user = await getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: me } = await supabase
      .from('app_users')
      .select('role, email')
      .eq('email', user.email || '')
      .maybeSingle()
    if (!me || me.role !== 'admin') return NextResponse.json({ error: 'Forbidden: admin only' }, { status: 403 })

    const { data, error } = await supabase
      .from('app_users')
      .select('id, email, name, role, updated_at, created_at')
      .order('created_at', { ascending: false })
    if (error) throw error
    return NextResponse.json(data)
  } catch (e) {
    return NextResponse.json({ error: 'Failed to load users' }, { status: 500 })
  }
}

// POST: create user (admin only)
export async function POST(request: NextRequest) {
  try {
    const payload = await request.json()
    const { email, name, role } = payload || {}
    if (!email || !role) return NextResponse.json({ error: 'email and role required' }, { status: 400 })

    const { getUser } = getKindeServerSession()
    const user = await getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: me } = await supabase
      .from('app_users')
      .select('role, email')
      .eq('email', user.email || '')
      .maybeSingle()
    if (!me || me.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { data, error } = await supabase
      .from('app_users')
      .insert({ email, name: name || null, role })
      .select('id, email, name, role, created_at, updated_at')
      .single()
    if (error) throw error
    return NextResponse.json(data, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: (e as any)?.message || 'Failed to create user' }, { status: 500 })
  }
}

// DELETE: remove user by id (admin only)
export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const id = url.searchParams.get('id')
    const email = url.searchParams.get('email')
    if (!id && !email) return NextResponse.json({ error: 'id or email required' }, { status: 400 })

    const { getUser } = getKindeServerSession()
    const user = await getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: me } = await supabase
      .from('app_users')
      .select('role, email')
      .eq('email', user.email || '')
      .maybeSingle()
    if (!me || me.role !== 'admin') return NextResponse.json({ error: 'Forbidden: admin only' }, { status: 403 })

    console.log('[api/users:DELETE] incoming', { id, email })
    let deleted: any = null
    if (id) {
      const res = await supabase.from('app_users').delete().eq('id', id).select('id,email').maybeSingle()
      if (res.error) throw res.error
      deleted = res.data
    } else if (email) {
      const needle = email.trim()
      console.log('[api/users:DELETE] lookup by email', needle)
      const found = await supabase
        .from('app_users')
        .select('id,email')
        .ilike('email', needle)
        .maybeSingle()
      if (found.error) throw found.error
      if (!found.data) {
        console.log('[api/users:DELETE] not found by email')
        return NextResponse.json({ error: 'not found' }, { status: 404 })
      }
      console.log('[api/users:DELETE] deleting id', found.data.id)
      const res = await supabase.from('app_users').delete().eq('id', found.data.id).select('id,email').maybeSingle()
      if (res.error) throw res.error
      deleted = res.data
    }
    if (!deleted) {
      console.log('[api/users:DELETE] delete produced no row')
      return NextResponse.json({ error: 'not found' }, { status: 404 })
    }
    console.log('[api/users:DELETE] deleted', deleted)
    return NextResponse.json({ ok: true, id: deleted.id, email: deleted.email })
  } catch (e) {
    console.error('[api/users:DELETE] error', e)
    return NextResponse.json({ error: (e as any)?.message || 'Failed to delete user' }, { status: 500 })
  }
}


