'use client'

import { LoginLink } from '@kinde-oss/kinde-auth-nextjs/components'

export default function Landing() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
      <div className="max-w-xl w-full bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        {/* Unauthorized notice */}
        {typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('unauthorized') && (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            You are signed in but not authorized yet. Please contact an administrator to be granted access.
          </div>
        )}
        <div className="text-center">
          <img src="/Designer Metals Logo.png" alt="Designer Metals" className="h-16 mx-auto mb-4" />
          <h1 className="text-2xl font-semibold text-gray-900">Designer Metals Analytics</h1>
          <p className="text-gray-600 mt-2">Sign in to access dashboards</p>
        </div>
        <div className="mt-8 grid grid-cols-1 gap-3">
          <LoginLink className="w-full px-4 py-3 bg-teal-600 text-white rounded-lg text-center hover:bg-teal-700">Sign in</LoginLink>
        </div>
      </div>
    </div>
  )
}


