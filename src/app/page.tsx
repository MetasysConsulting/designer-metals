'use client'

import { useState, useCallback } from 'react'
import html2canvas from 'html2canvas'
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


  const exportToImage = async () => {
    console.log('Image export started')
    
    // Use visible dashboard content
    const targetElement = document.querySelector('.min-h-screen') as HTMLElement
    if (!targetElement) {
      alert('Dashboard content not found. Please try again.')
      return
    }

    try {
      console.log('Starting html2canvas capture for image...')
      // Use html2canvas to capture the dashboard with better settings
      const canvas = await html2canvas(targetElement, {
        scale: 1.5,
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        logging: true,
        removeContainer: true,
        foreignObjectRendering: true,
        onclone: (clonedDoc) => {
          // Ensure all styles are preserved in the clone
          const clonedElement = clonedDoc.querySelector('.min-h-screen') || clonedDoc.body
          if (clonedElement) {
            clonedElement.style.position = 'static'
            clonedElement.style.transform = 'none'
            clonedElement.style.overflow = 'visible'
          }
        }
      })
      
      console.log('Canvas created for image, dimensions:', canvas.width, 'x', canvas.height)

      // Convert to image and download
      const link = document.createElement('a')
      link.download = `Designer-Metals-Sales-Dashboard-${new Date().toISOString().split('T')[0]}.png`
      link.href = canvas.toDataURL('image/png', 0.9)
      link.click()
      
      console.log('Image download triggered')
      
    } catch (error) {
      console.error('Image export failed:', error)
      alert('Image export failed. Please try using your browser\'s screenshot functionality (Ctrl+Shift+S or Cmd+Shift+S)')
    }
  }

  const emailReport = () => {
    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
    
    const subject = encodeURIComponent('Designer Metals - Sales Dashboard Report')
    const body = encodeURIComponent(`
Dear Team,

Please find the Sales Dashboard Report for Designer Metals.

Report Details:
• Generated: ${currentDate}
• Applied Filters: 
  - Year: ${filters.year}
  - Customer: ${filters.customer}
  - Category: ${filters.category}

This report contains comprehensive sales analytics including:
• Monthly sales trends and analysis
• Year-to-date performance metrics
• Detailed transaction data
• Customer performance insights

The dashboard provides real-time data from our Supabase database and includes interactive charts and detailed sales tables.

For any questions or additional analysis, please contact the Analytics Team.

Best regards,
Designer Metals Analytics Team
    `)
    
    window.open(`mailto:?subject=${subject}&body=${body}`)
  }

  return (
    <>
      <style jsx>{`
        @media print {
          .export-buttons {
            display: none !important;
          }
          .no-print {
            display: none !important;
          }
          
          /* Print-specific styles for charts and layout */
          body {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          /* Ensure charts fit properly on page */
          .chart-container, .echarts-for-react {
            width: 100% !important;
            height: auto !important;
            max-height: 300px !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          
          /* Chart canvas sizing for print */
          canvas {
            max-width: 100% !important;
            height: auto !important;
            max-height: 300px !important;
          }
          
          /* Grid layout adjustments for print */
          .grid {
            display: block !important;
          }
          
          .grid > div {
            width: 100% !important;
            margin-bottom: 20px !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          
          /* Table adjustments */
          .overflow-x-auto {
            overflow: visible !important;
          }
          
          table {
            width: 100% !important;
            font-size: 12px !important;
          }
          
          /* Ensure proper spacing */
          .p-6, .p-8 {
            padding: 15px !important;
          }
          
          /* Header adjustments */
          .h-24 {
            height: 60px !important;
          }
          
          /* Page breaks */
          .page-break-before {
            page-break-before: always !important;
          }
          
          .page-break-after {
            page-break-after: always !important;
          }
          
          .page-break-inside-avoid {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
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
                onClick={() => window.print()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2 text-sm"
                title="Print Report"
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
              
              <button
                onClick={() => emailReport()}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center gap-2 text-sm"
                title="Email Report"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Email
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
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden page-break-inside-avoid">
            <div className="p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">Total Sales - Monthly View</h2>
              <div className="h-80 w-full chart-container">
                <SalesChart filters={filters} />
              </div>
            </div>
          </div>
          
          {/* YTD Sales Chart */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden page-break-inside-avoid">
            <div className="p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">Total Sales</h2>
              <div className="h-80 w-full chart-container">
                <YTDChart filters={filters} />
              </div>
            </div>
          </div>
        </div>

        {/* Sales Details Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 page-break-inside-avoid">
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