'use client'

import { useEffect, useState } from 'react'

type AppUser = {
  id: string
  email: string
  name: string | null
  role: 'user' | 'admin'
  created_at?: string
  updated_at?: string
}

export default function UsersAdmin() {
  const [users, setUsers] = useState<AppUser[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState<{ email: string; name: string; role: 'user' | 'admin' }>({ email: '', name: '', role: 'user' })
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/users')
      if (!res.ok) throw new Error('Failed to load users')
      const data = await res.json()
      setUsers(data)
    } catch (e: any) {
      setError(e.message || 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const createUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      if (!res.ok) throw new Error('Failed to create user')
      setForm({ email: '', name: '', role: 'user' })
      await load()
    } catch (e: any) {
      setError(e.message || 'Failed to create user')
    }
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Users</h1>

      <form onSubmit={createUser} className="bg-white border border-gray-300 rounded-2xl p-6 mb-8 flex flex-wrap gap-5 items-end shadow">
        <div className="flex-1 min-w-[220px]">
          <label className="block text-sm font-semibold text-gray-900 mb-1">Email</label>
          <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} type="email" required className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-teal-600 placeholder:text-gray-500 bg-white text-gray-900" placeholder="user@company.com" />
        </div>
        <div className="flex-1 min-w-[160px]">
          <label className="block text-sm font-semibold text-gray-900 mb-1">Name</label>
          <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-teal-600 placeholder:text-gray-500 bg-white text-gray-900" placeholder="Optional" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-1">Role</label>
          <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value as any })} className="border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-teal-600">
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <button type="submit" className="px-5 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 shadow">Add</button>
      </form>

      {error && <div className="mb-4 text-sm text-red-800 bg-red-50 border border-red-200 rounded-lg p-3">{error}</div>}

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left p-3 text-xs font-semibold uppercase tracking-wide text-gray-700">Email</th>
              <th className="text-left p-3 text-xs font-semibold uppercase tracking-wide text-gray-700">Name</th>
              <th className="text-left p-3 text-xs font-semibold uppercase tracking-wide text-gray-700">Role</th>
              <th className="text-left p-3 text-xs font-semibold uppercase tracking-wide text-gray-700">Added</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr><td className="p-4 text-gray-700" colSpan={4}>Loading…</td></tr>
            ) : users.length === 0 ? (
              <tr><td className="p-4 text-gray-700" colSpan={4}>No users yet.</td></tr>
            ) : (
              users.map(u => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="p-4 text-gray-900">{u.email}</td>
                  <td className="p-4 text-gray-900">{u.name || '-'}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${u.role==='admin' ? 'bg-teal-50 text-teal-800 border-teal-200' : 'bg-gray-50 text-gray-800 border-gray-200'}`}>{u.role}</span>
                  </td>
                  <td className="p-4 text-sm text-gray-700 flex items-center gap-3">
                    <span>{u.created_at ? new Date(u.created_at).toLocaleString() : ''}</span>
                    <button
                      onClick={async () => {
                        if (!confirm(`Delete ${u.email}?`)) return
                        try {
                          const res = await fetch(`/api/users?email=${encodeURIComponent(u.email)}`, { method: 'DELETE' })
                          const out = await res.json().catch(() => ({}))
                          if (!res.ok) throw new Error(out?.error || 'Delete failed')
                          await load()
                        } catch (e: any) {
                          alert(e.message || 'Failed to delete user')
                        }
                      }}
                      className="ml-auto px-3 py-1.5 text-sm rounded-lg border border-red-200 text-red-700 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}


