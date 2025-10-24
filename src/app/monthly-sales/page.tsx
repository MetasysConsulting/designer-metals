'use client'

import { useState, useCallback, useEffect } from 'react'
import { loadFilters } from '@/utils/filterState'
import DashboardHeader from '@/components/DashboardHeader'
import MonthlySalesChart from '@/components/MonthlySalesChart'
import MonthlySalesDataTable from '@/components/MonthlySalesDataTable'

export default function MonthlySales() {
  const [filters, setFilters] = useState(loadFilters())

  // Sync filters from localStorage on mount
  useEffect(() => {
    const savedFilters = loadFilters()
    console.log('Monthly Sales - Loading saved filters:', savedFilters)
    setFilters(savedFilters)
  }, [])

  const handleFiltersChange = useCallback((newFilters: any) => {
    console.log('Monthly Sales - Filters updated:', newFilters)
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
      link.download = `Designer-Metals-Monthly-Sales-${new Date().toISOString().split('T')[0]}.png`
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
    
    const subject = encodeURIComponent('Designer Metals - Monthly Sales Report')
    const body = encodeURIComponent(`
Dear Team,

Please find the Monthly Sales Report for Designer Metals.

Report Details:
• Generated: ${currentDate}
• Applied Filters: 
  - Year: ${filters.year}
  - Customer: ${filters.customer}
  - Category: ${filters.category}

This report contains comprehensive monthly sales analytics including:
• Total sales by month name and year (clustered bar chart)
• Yearly breakdown with YTD sales, total sales, and growth metrics
• Invoice count and average revenue per invoice analysis
• Year-over-year growth percentage tracking

The dashboard provides real-time data from our Supabase database and includes interactive charts and detailed tables.

For any questions or additional analysis, please contact the Analytics Team.

Best regards,
Designer Metals Analytics Team
    `)
    
    window.open(`mailto:?subject=${subject}&body=${body}`)
  }

  return (
    <div className="w-full min-h-screen bg-gray-50">
      {/* Header with Logo, Filters, and Export Options */}
      <DashboardHeader pageName="Monthly Sales" onFiltersChange={handleFiltersChange} />

      {/* Main Content */}
      <div className="p-8">
        {/* Page Title */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">MONTHLY SALES</h1>
          <p className="text-lg text-gray-600 mt-2">Total sales by month name and year analysis</p>
        </div>

        {/* Monthly Sales Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-8">
          <div className="p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Total Sales by Month Name and Year</h2>
            <div className="h-96 w-full">
              <MonthlySalesChart filters={filters} />
            </div>
          </div>
        </div>

        {/* Monthly Sales Data Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Monthly Sales Performance Details</h2>
            <div className="overflow-x-auto">
              <MonthlySalesDataTable filters={filters} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}