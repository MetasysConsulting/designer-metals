'use client'

import { useState, useCallback, useEffect } from 'react'
import { loadFilters } from '@/utils/filterState'
import DashboardHeader from '@/components/DashboardHeader'
import IndividualSalesChart from '@/components/IndividualSalesChart'

export default function IndividualSales() {
  const [filters, setFilters] = useState(loadFilters())

  useEffect(() => {
    const savedFilters = loadFilters()
    console.log('Individual Sales - Loading saved filters:', savedFilters)
    setFilters(savedFilters)
  }, [])

  const handleFiltersChange = useCallback((newFilters: any) => {
    console.log('Individual Sales - Filters updated:', newFilters)
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
      <DashboardHeader pageName="Individual Sales" onFiltersChange={handleFiltersChange} />

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