'use client'

import { useState, useCallback, useEffect } from 'react'
import { loadFilters } from '@/utils/filterState'
import DashboardHeader from '@/components/DashboardHeader'
import YTDCoilChart from '@/components/YTDCoilChart'

export default function YTDCoil() {
  const [filters, setFilters] = useState(loadFilters())

  useEffect(() => {
    const savedFilters = loadFilters()
    setFilters(savedFilters)
  }, [])

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
      link.download = `Designer-Metals-YTD-Coil-Sales-${new Date().toISOString().split('T')[0]}.png`
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
    
    const subject = encodeURIComponent('Designer Metals - YTD Coil Sales Report')
    const body = encodeURIComponent(`
Dear Team,

Please find the YTD Coil Sales Report for Designer Metals.

Report Details:
• Generated: ${currentDate}
• Applied Filters: 
  - Year: ${filters.year}
  - Customer: ${filters.customer}
  - Category: ${filters.category}

This report contains comprehensive YTD coil sales analytics including:
• Coil YTD sales by year
• Year-over-year coil performance analysis
• Coil sales trends and growth patterns
• Interactive horizontal bar chart

The dashboard provides real-time data from our Supabase database and includes interactive charts and detailed analysis.

For any questions or additional analysis, please contact the Analytics Team.

Best regards,
Designer Metals Analytics Team
    `)
    
    window.open(`mailto:?subject=${subject}&body=${body}`)
  }

  return (
    <div className="w-full min-h-screen bg-gray-50">
      <DashboardHeader pageName="YTD Coil Sales" onFiltersChange={handleFiltersChange} />

      {/* Main Content */}
      <div className="p-8">
        {/* Page Title */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">YTD COIL SALES</h1>
          <p className="text-lg text-gray-600 mt-2">Coil YTD sales by year analysis</p>
        </div>

        {/* YTD Coil Sales Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Coil YTD Sales by Year</h2>
            <div className="h-96 w-full">
              <YTDCoilChart filters={filters} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}