'use client'

import { useState, useCallback } from 'react'
import { printDashboard as printDashboardUtil } from '@/utils/printDashboard'
import CustomerLocationMap from '@/components/CustomerLocationMap'
import FilterBar from '@/components/FilterBar'
import Header from '@/components/Header'

export default function CustomerLocations() {
  const [filters, setFilters] = useState({
    year: 'All',
    customer: 'All',
    category: 'All'
  })

  const handleFiltersChange = useCallback((newFilters: any) => {
    setFilters(newFilters)
  }, [])

  // Print function
  const printDashboard = () => printDashboardUtil('Designer Metals Customer Locations')

  return (
    <>
      <style jsx>{`
        @media print {
          @page {
            size: A4 landscape;
            margin: 0.3in;
          }
          
          body {
            margin: 0;
            padding: 0;
            font-size: 12px;
            line-height: 1.4;
          }
          
          .no-print {
            display: none !important;
          }
          
          .print-break {
            page-break-before: always;
          }
          
          .min-h-screen {
            min-height: auto !important;
            padding: 0 !important;
          }
          
          .bg-gray-50 {
            background-color: #f9fafb !important;
          }
          
          .shadow-sm {
            box-shadow: none !important;
          }
          
          .border {
            border: 1px solid #e5e7eb !important;
          }
          
          .rounded-lg {
            border-radius: 0.5rem !important;
          }
          
          .p-6 {
            padding: 1rem !important;
          }
          
          .mb-6 {
            margin-bottom: 1rem !important;
          }
          
          .text-2xl {
            font-size: 1.25rem !important;
          }
          
          .text-lg {
            font-size: 1rem !important;
          }
          
          .text-sm {
            font-size: 0.75rem !important;
          }
          
          .grid {
            display: grid !important;
          }
          
          .grid-cols-1 {
            grid-template-columns: 1fr !important;
          }
          
          .grid-cols-2 {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          
          .grid-cols-3 {
            grid-template-columns: repeat(3, 1fr) !important;
          }
          
          .gap-4 {
            gap: 0.5rem !important;
          }
          
          .gap-6 {
            gap: 1rem !important;
          }
          
          .space-y-8 > * + * {
            margin-top: 2rem !important;
          }
        }
      `}</style>
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
            <FilterBar filters={filters} onFiltersChange={handleFiltersChange} />
            
            {/* Export Options */}
            <div className="flex items-center gap-4">
              <button
                onClick={printDashboard}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2 text-sm"
                title="Print Report"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Print
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-8 pb-20 space-y-8">
        {/* Page Title */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Customer Locations</h1>
          <p className="text-lg text-gray-600">Geographic distribution of customers across states</p>
        </div>

        {/* Customer Location Map */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Customer Distribution Map</h2>
            <CustomerLocationMap filters={filters} />
          </div>
        </div>
      </div>
      
    </div>
    </>
  )
}
