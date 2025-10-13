'use client'

import { useState, useCallback } from 'react'
import html2canvas from 'html2canvas'
import { printDashboard as printUtil } from '@/utils/printDashboard'
import FilterBar from '@/components/FilterBar'
import IndividualSalesChart from '@/components/IndividualSalesChart'

export default function IndividualSales() {
  const [filters, setFilters] = useState({
    year: 'All',
    customer: 'All',
    category: 'All'
  })

  const handleFiltersChange = useCallback((newFilters: any) => {
    setFilters(newFilters)
  }, [])

  // Export functions
  const exportToImage = async () => {
    console.log('Image export started')
    
    const targetElement = document.querySelector('.min-h-screen') as HTMLElement
    if (!targetElement) {
      alert('Dashboard content not found. Please try again.')
      return
    }

    try {
      console.log('Starting html2canvas capture for image...')
      const canvas = await html2canvas(targetElement, {
        scale: 1.5,
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        logging: true,
        removeContainer: true,
        foreignObjectRendering: true,
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.querySelector('.min-h-screen') || clonedDoc.body
          if (clonedElement) {
            clonedElement.style.position = 'static'
            clonedElement.style.transform = 'none'
            clonedElement.style.overflow = 'visible'
          }
        }
      })
      
      console.log('Canvas created for image, dimensions:', canvas.width, 'x', canvas.height)

      const link = document.createElement('a')
      link.download = `Designer-Metals-Individual-Sales-${new Date().toISOString().split('T')[0]}.png`
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
    
    const subject = encodeURIComponent('Designer Metals - Individual Sales Report')
    const body = encodeURIComponent(`
Dear Team,

Please find the Individual Sales Report for Designer Metals.

Report Details:
• Generated: ${currentDate}
• Applied Filters: 
  - Year: ${filters.year}
  - Customer: ${filters.customer}
  - Category: ${filters.category}

This report contains comprehensive individual sales analytics including:
• Carport Sales by Year
• Coil Sales by Year
• Panel Sales by Year
• LuxGuard Sales by Year

The dashboard provides real-time data from our Supabase database and includes interactive charts for each product category.

For any questions or additional analysis, please contact the Analytics Team.

Best regards,
Designer Metals Analytics Team
    `)
    
    window.open(`mailto:?subject=${subject}&body=${body}`)
  }

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
            
            {/* Export Options */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => printUtil('Designer Metals Individual Sales')}
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
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">INDIVIDUAL SALES</h1>
          <p className="text-lg text-gray-600 mt-2">Sales by year for different product categories</p>
        </div>

        {/* 2x2 Grid of Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Carport Sales by Year */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Carport Sales by Year</h2>
              <div className="h-80 w-full">
                <IndividualSalesChart 
                  category="Carport" 
                  filters={filters}
                  data={[
                    { year: '2022', sales: 0.01 },
                    { year: '2023', sales: 0.02 },
                    { year: '2024', sales: 1.38 },
                    { year: '2025', sales: 1.79 }
                  ]}
                />
              </div>
            </div>
          </div>

          {/* Coil Sales by Year */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Coil Sales by Year</h2>
              <div className="h-80 w-full">
                <IndividualSalesChart 
                  category="Coil" 
                  filters={filters}
                  data={[
                    { year: '2021', sales: 0.0 },
                    { year: '2022', sales: 0.1 },
                    { year: '2023', sales: 2.7 },
                    { year: '2024', sales: 3.9 },
                    { year: '2025', sales: 5.5 }
                  ]}
                />
              </div>
            </div>
          </div>

          {/* Panel Sales by Year */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Panel Sales by Year</h2>
              <div className="h-80 w-full">
                <IndividualSalesChart 
                  category="Panel" 
                  filters={filters}
                  data={[
                    { year: '2020', sales: 1.3 },
                    { year: '2022', sales: 2.0 },
                    { year: '2023', sales: 2.3 },
                    { year: '2024', sales: 3.3 },
                    { year: '2025', sales: 3.9 }
                  ]}
                />
              </div>
            </div>
          </div>

          {/* LuxGuard Sales by Year */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">LuxGuard Sales by Year</h2>
              <div className="h-80 w-full">
                <IndividualSalesChart 
                  category="LuxGuard" 
                  filters={filters}
                  data={[
                    { year: '2022', sales: 0.03 },
                    { year: '2023', sales: 0.11 },
                    { year: '2024', sales: 0.61 },
                    { year: '2025', sales: 0.56 }
                  ]}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}