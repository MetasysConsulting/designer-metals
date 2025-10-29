'use client'

import { useState, useEffect } from 'react'
import { loadFilters } from '@/utils/filterState'
import DashboardHeader from '@/components/DashboardHeader'
import DataDebugger from '@/components/DataDebugger'
import CategoryBarChart from '@/components/CategoryBarChart'
import SalesByYearChart from '@/components/SalesByYearChart'
import StackedBarChart from '@/components/StackedBarChart'

export default function DataTestPage() {
  const [filters, setFilters] = useState(loadFilters())
  const [categoryData, setCategoryData] = useState<any[]>([])
  const [yearData, setYearData] = useState<any[]>([])
  const [stackedData, setStackedData] = useState<any[]>([])

  useEffect(() => {
    const savedFilters = loadFilters()
    setFilters(savedFilters)
  }, [])

  const handleFiltersChange = (newFilters: any) => {
    setFilters(newFilters)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader 
        pageName="Data Verification Test" 
        onFiltersChange={handleFiltersChange}
      />
      
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Data Verification Test</h1>
          <p className="text-gray-600">
            This page helps you verify that chart data matches the database. 
            The debugger below shows a comparison between what's in your charts and what's in the database.
          </p>
        </div>

        {/* Category Bar Chart Debug */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Category Bar Chart</h2>
          <DataDebugger 
            filters={filters}
            chartName="Category Bar Chart"
            chartData={categoryData}
          />
          <div className="bg-white rounded-lg shadow p-4">
            <CategoryBarChart filters={filters} />
          </div>
        </div>

        {/* Sales by Year Chart Debug */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Sales by Year Chart</h2>
          <DataDebugger 
            filters={filters}
            chartName="Sales by Year Chart"
            chartData={yearData}
          />
          <div className="bg-white rounded-lg shadow p-4">
            <SalesByYearChart filters={filters} />
          </div>
        </div>

        {/* Stacked Bar Chart Debug */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Stacked Bar Chart</h2>
          <DataDebugger 
            filters={filters}
            chartName="Stacked Bar Chart"
            chartData={stackedData}
          />
          <div className="bg-white rounded-lg shadow p-4">
            <StackedBarChart filters={filters} />
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">How to Use This Page:</h3>
          <ul className="text-blue-700 text-sm space-y-1">
            <li>• Change filters using the header controls</li>
            <li>• Watch the debugger sections update with real-time data comparison</li>
            <li>• Check the console for detailed logging</li>
            <li>• Green checkmark = data matches closely</li>
            <li>• Yellow warning = small difference</li>
            <li>• Red X = significant difference that needs investigation</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
