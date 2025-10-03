'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'

interface Tab {
  id: string
  label: string
  icon: string
  href: string
}

export default function BottomNavigation() {
  const pathname = usePathname()

  const tabs: Tab[] = [
    { id: 'sales-overview', label: 'Sales Overview', icon: '📊', href: '/' },
    { id: 'sales-category', label: 'Sales By Category', icon: '📈', href: '/sales-category' },
    { id: 'sales-category-details', label: 'Sales By Category Details', icon: '📋', href: '/sales-category-details' },
    { id: 'ytd-sales', label: 'YTD Sales', icon: '📅', href: '/ytd-sales' },
    { id: 'monthly-sales', label: 'Monthly Sales', icon: '📆', href: '/monthly-sales' },
    { id: 'individual-sales', label: 'Individual Sales', icon: '👤', href: '/individual-sales' },
    { id: 'sales-year', label: 'Sales By Year', icon: '🗓️', href: '/sales-year' },
    { id: 'yearly-coil', label: 'Yearly Coil Sales', icon: '🔄', href: '/yearly-coil' },
    { id: 'ytd-coil', label: 'YTD Coil Sales', icon: '⚡', href: '/ytd-coil' },
    { id: 'year-comparison', label: 'Sales By Year Comparison', icon: '📊', href: '/year-comparison' }
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-gray-800 border-t border-gray-700 shadow-lg">
      <div className="flex items-center justify-between px-4 py-2 overflow-x-auto">
        {/* Navigation arrows */}
        <div className="flex items-center space-x-2 mr-4">
          <button className="p-2 text-gray-400 hover:text-white transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button className="p-2 text-gray-400 hover:text-white transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center space-x-1 flex-1 overflow-x-auto">
          {tabs.map((tab) => (
            <Link
              key={tab.id}
              href={tab.href}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                pathname === tab.href
                  ? 'bg-teal-600 text-white shadow-lg'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700'
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
              <span>{tab.label}</span>
            </Link>
          ))}
        </div>

        {/* Add button */}
        <button className="ml-4 p-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
    </div>
  )
}
