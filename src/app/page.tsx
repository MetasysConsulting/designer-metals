'use client'

import { useState, useCallback } from 'react'
import html2canvas from 'html2canvas'
import { printDashboard as printDashboardUtil } from '@/utils/printDashboard'
import SalesChart from '@/components/SalesChart'
import CategoryChart from '@/components/CategoryChart'
import YTDChart from '@/components/YTDChart'
import KPICards from '@/components/KPICards'
import FilterBar from '@/components/FilterBar'
import SalesDetailsTable from '@/components/SalesDetailsTable'
import Header from '@/components/Header'

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


  const printDashboard = () => printDashboardUtil('Designer Metals Dashboard')

  const exportToImage = async () => {
    try {
      // Hide buttons temporarily
      const buttons = document.querySelectorAll('button')
      buttons.forEach(btn => {
        if (btn instanceof HTMLElement) {
          btn.style.visibility = 'hidden'
        }
      })

      await new Promise(resolve => setTimeout(resolve, 100))

      // Use html2canvas to capture the entire viewport (better for logo)
      const canvas = await html2canvas(document.body, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        windowWidth: window.innerWidth,
        windowHeight: window.innerHeight
      })

      // Restore buttons
      buttons.forEach(btn => {
        if (btn instanceof HTMLElement) {
          btn.style.visibility = 'visible'
        }
      })

      // Convert to blob and download
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          link.download = `designer-metals-dashboard-${new Date().toISOString().split('T')[0]}.png`
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          URL.revokeObjectURL(url)
        }
      }, 'image/png', 1.0)

    } catch (error) {
      console.error('Image export failed:', error)
      alert('Image export failed. Please try using your browser\'s screenshot functionality (Ctrl+Shift+S or Cmd+Shift+S)')
    }
  }



  return (
    <>
      <style jsx>{`
        @media print {
          @page {
            size: A4 landscape;
            margin: 0.3in;
          }
          
          body {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
            print-color-adjust: exact !important;
            transform: rotate(0deg);
            width: 100%;
            height: 100vh;
          }
          
          html {
            width: 100%;
            height: 100%;
          }
          
          .export-buttons {
            display: none !important;
          }
          .no-print {
            display: none !important;
          }
          
          .min-h-screen {
            min-height: 100vh !important;
            background: white !important;
            padding: 0.5rem !important;
            margin: 0 !important;
            width: 100% !important;
            height: 100vh !important;
            display: flex !important;
            flex-direction: column !important;
          }
          
          .bg-gray-50 {
            background: white !important;
          }
          
          .bg-white {
            background: white !important;
            border: 1px solid #e5e7eb !important;
            box-shadow: none !important;
          }
          
          .shadow-sm {
            box-shadow: none !important;
          }
          
          .rounded-lg {
            border-radius: 0.375rem !important;
          }
          
          .grid {
            display: grid !important;
            gap: 1rem !important;
          }
          
          .grid-cols-1 {
            grid-template-columns: 1fr !important;
          }
          
          .xl\\:grid-cols-2 {
            grid-template-columns: 1fr 1fr !important;
          }
          
          /* Force landscape layout */
          .grid {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            gap: 0.5rem !important;
            width: 100% !important;
          }
          
          .h-80 {
            height: 15rem !important;
            max-height: 15rem !important;
          }
          
          .w-full {
            width: 100% !important;
          }
          
          .p-6, .p-8 {
            padding: 0.5rem !important;
          }
          
          .mb-6, .mb-8 {
            margin-bottom: 0.5rem !important;
          }
          
          .text-2xl {
            font-size: 1.25rem !important;
          }
          
          .text-4xl {
            font-size: 1.5rem !important;
          }
          
          .text-lg {
            font-size: 0.875rem !important;
          }
          
          .font-bold {
            font-weight: 700 !important;
          }
          
          .font-semibold {
            font-weight: 600 !important;
          }
          
          .text-gray-900 {
            color: #111827 !important;
          }
          
          .text-gray-800 {
            color: #1f2937 !important;
          }
          
          .text-gray-600 {
            color: #4b5563 !important;
          }
          
          .border-gray-200 {
            border-color: #e5e7eb !important;
          }
          
          /* Ensure charts are visible in print */
          .echarts-for-react {
            width: 100% !important;
            height: 100% !important;
          }
          
          canvas {
            max-width: 100% !important;
            height: auto !important;
          }
          
          /* Table styles for print */
          table {
            width: 100% !important;
            border-collapse: collapse !important;
          }
          
          th, td {
            border: 1px solid #e5e7eb !important;
            padding: 0.5rem !important;
            text-align: left !important;
          }
          
          th {
            background-color: #f9fafb !important;
            font-weight: 600 !important;
          }
          
          /* Ensure all content fits on one page */
          .overflow-x-auto {
            overflow: visible !important;
          }
          
          .max-h-96 {
            max-height: none !important;
          }
          
          .overflow-y-auto {
            overflow: visible !important;
          }
          
          /* KPI Cards print styles */
          .kpi-card {
            background: white !important;
            border: 1px solid #e5e7eb !important;
            box-shadow: none !important;
          }
          
          /* Chart containers */
          .chart-container {
            width: 100% !important;
            height: 15rem !important;
          }
          
          /* Ensure everything fits on one A4 landscape page */
          * {
            page-break-inside: avoid !important;
          }
          
          .bg-white {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          
          /* Ensure proper spacing */
          .space-y-4 > * + * {
            margin-top: 1rem !important;
          }
          
          .space-y-6 > * + * {
            margin-top: 1.5rem !important;
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
            <FilterBar onFiltersChange={handleFiltersChange} />
            
            {/* Export Options */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => printDashboard()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2 text-sm"
                title="Print Screenshot with Controls"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Print
              </button>
              
              <button
                onClick={() => exportToImage()}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2 text-sm"
                title="Save as Image"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Image
              </button>
              
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-8">
        {/* Page Title */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Sales Dashboard Overview</h1>
          <p className="text-lg text-gray-600 mt-2">Comprehensive sales analytics and performance insights</p>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
          {/* Monthly Sales Chart */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">Total Sales - Monthly View</h2>
              <div className="h-80 w-full">
                <SalesChart filters={filters} />
              </div>
            </div>
          </div>
          
          {/* YTD Sales Chart */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">Total Sales</h2>
              <div className="h-80 w-full">
                <YTDChart filters={filters} />
              </div>
            </div>
          </div>
        </div>

        {/* Sales Details Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Sales Performance Details</h2>
            <div className="overflow-x-auto">
              <SalesDetailsTable filters={filters} />
            </div>
          </div>
        </div>
      </div>
      
    </div>
    </>
  )
}