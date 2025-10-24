'use client'

import { useState, useCallback, useEffect } from 'react'
import { loadFilters, saveFilters } from '@/utils/filterState'
import ExportButtons from '@/components/ExportButtons'
import FilterBar from '@/components/FilterBar'
import { LogoutLink } from '@kinde-oss/kinde-auth-nextjs/components'

interface DashboardHeaderProps {
  pageName: string
  onFiltersChange?: (filters: any) => void
}

export default function DashboardHeader({ pageName, onFiltersChange }: DashboardHeaderProps) {
  const [filters, setFilters] = useState(loadFilters())
  
  // Load filters from localStorage on mount
  useEffect(() => {
    const savedFilters = loadFilters()
    console.log('DashboardHeader loading saved filters:', savedFilters)
    setFilters(savedFilters)
  }, [pageName]) // Only re-run when page changes

  const handleFiltersChange = useCallback((newFilters: any) => {
    console.log('DashboardHeader - Filter changed:', newFilters)
    setFilters(newFilters)
    saveFilters(newFilters) // Save to localStorage
    if (onFiltersChange) {
      onFiltersChange(newFilters)
    }
  }, [onFiltersChange])

  return (
    <div className="w-full bg-gray-50 py-6 px-8 border-b border-gray-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          {/* Designer Metals Logo */}
          <img 
            src="/Designer Metals Logo.png" 
            alt="Designer Metals Logo" 
            className="h-24 object-contain"
          />
        </div>
        
        <div className="flex items-center gap-8">
          {/* Filters */}
          <FilterBar onFiltersChange={handleFiltersChange} />
          
          {/* Export Options */}
          <ExportButtons pageName={pageName} />
          
          {/* Logout Button */}
          <LogoutLink className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium text-sm">
            Logout
          </LogoutLink>
        </div>
      </div>
    </div>
  )
}
