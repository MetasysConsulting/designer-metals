'use client'

import { useState, useCallback, useEffect } from 'react'
import { loadFilters } from '@/utils/filterState'
import DashboardHeader from '@/components/DashboardHeader'
import CategoryChart from '@/components/CategoryChart'
import StackedBarChart from '@/components/StackedBarChart'

export default function SalesCategory() {
  const [filters, setFilters] = useState(loadFilters())

  // Sync filters from localStorage on mount
  useEffect(() => {
    const savedFilters = loadFilters()
    console.log('Sales Category - Loading saved filters:', savedFilters)
    setFilters(savedFilters)
  }, [])

  const handleFiltersChange = useCallback((newFilters: any) => {
    console.log('Sales Category - Filters updated:', newFilters)
    setFilters(newFilters)
  }, [])

  // Export functions
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
      link.download = `Designer-Metals-Sales-Category-${new Date().toISOString().split('T')[0]}.png`
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
    
    const subject = encodeURIComponent('Designer Metals - Sales by Category Report')
    const body = encodeURIComponent(`
Dear Team,

Please find the Sales by Category Report for Designer Metals.

Report Details:
• Generated: ${currentDate}
• Applied Filters: 
  - Year: ${filters.year}
  - Customer: ${filters.customer}
  - Category: ${filters.category}

This report contains comprehensive category analysis including:
• Sales performance by category and year
• Category distribution insights
• Interactive month selection
• Detailed category breakdowns

The dashboard provides real-time data from our Supabase database and includes interactive charts and category analysis.

For any questions or additional analysis, please contact the Analytics Team.

Best regards,
Designer Metals Analytics Team
    `)
    
    window.open(`mailto:?subject=${subject}&body=${body}`)
  }

  return (
    <div className="w-full min-h-screen bg-gray-50">
      {/* Header with Logo, Filters, and Export Options */}
      <DashboardHeader pageName="Sales by Category" onFiltersChange={handleFiltersChange} />

      {/* Main Content */}
      <div className="p-8">
        {/* Page Title */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">SALES BY CATEGORY</h1>
          <p className="text-lg text-gray-600 mt-2">Category performance analysis and distribution insights</p>
        </div>

        {/* Month Selection Grid - Above charts like Power BI */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Month Selection</h2>
          <div className="grid grid-cols-6 gap-4">
            {['January', 'February', 'March', 'April', 'May', 'June', 
              'July', 'August', 'September', 'October', 'November', 'December', '(Blank)'].map((month) => (
              <button
                key={month}
                className="px-4 py-3 bg-gray-100 hover:bg-blue-100 border border-gray-300 hover:border-blue-400 rounded-lg text-sm font-medium text-gray-700 hover:text-blue-700 transition-all duration-200"
              >
                {month}
              </button>
            ))}
          </div>
        </div>

        {/* Charts Section - Clustered Column and Donut Chart */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
          {/* Clustered Column Chart - Left side */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">Sales by Category and Year</h2>
              <div className="h-80 w-full">
                <StackedBarChart filters={filters} />
              </div>
            </div>
          </div>
          
          {/* Donut Chart - Right side */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">Category Distribution</h2>
              <div className="h-96 w-full flex items-center justify-center">
                <div className="w-full h-full">
                  <CategoryChart filters={filters} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
