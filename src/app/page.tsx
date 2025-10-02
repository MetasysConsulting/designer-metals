'use client'

import { useState, useCallback } from 'react'
import ARINVTable from '@/components/ARINVTable'
import SalesChart from '@/components/SalesChart'
import CategoryChart from '@/components/CategoryChart'
// import YearlyChart from '@/components/YearlyChart'
import YTDChart from '@/components/YTDChart'
import KPICards from '@/components/KPICards'
import FilterBar from '@/components/FilterBar'
import SalesDetailsTable from '@/components/SalesDetailsTable'

export default function Home() {
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
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">DESIGNER METALS</h1>
              <p className="text-gray-600">YTD Sales Performance Dashboard</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">DM</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <FilterBar onFiltersChange={handleFiltersChange} />

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* YTD Chart */}
          <div className="lg:col-span-2">
            <YTDChart filters={filters} />
          </div>
          
          {/* KPI Cards */}
          <div className="lg:col-span-1">
            <KPICards filters={filters} />
          </div>
        </div>

        {/* Sales Details Table */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Sales Performance Details</h2>
          <SalesDetailsTable filters={filters} />
        </div>

        {/* Additional Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Monthly Sales</h2>
            <SalesChart filters={filters} />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Sales by Category</h2>
            <CategoryChart filters={filters} />
          </div>
        </div>
        
        {/* Customer Database Section */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Customer Database</h2>
          <ARINVTable />
        </div>
      </div>
    </div>
  )
}