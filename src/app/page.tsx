'use client'

import { useState, useCallback } from 'react'
import ResizableDashboard from '@/components/ResizableDashboard'
import FilterBar from '@/components/FilterBar'

export default function SalesOverview() {
  const [filters, setFilters] = useState({
    year: 'All',
    customer: 'All',
    category: 'All'
  })

  const handleFiltersChange = useCallback((newFilters: any) => {
    setFilters(newFilters)
    console.log('Filters changed:', newFilters)
  }, [])



  return (
    <div className="w-full min-h-screen bg-gray-50">
      {/* Header with Logo, Filters, and Export Options */}
      <div className="w-full bg-gray-50 py-6 px-8">
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
          </div>
        </div>
      </div>

      {/* Resizable Dashboard */}
      <ResizableDashboard filters={filters} />
    </div>
  )
}