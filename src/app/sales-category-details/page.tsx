'use client'

import { useState, useCallback, useEffect } from 'react'
import { loadFilters } from '@/utils/filterState'
import DashboardHeader from '@/components/DashboardHeader'
import CategoryBarChart from '@/components/CategoryBarChart'
import CategoryLineChart from '@/components/CategoryLineChart'
import CategoryDetailsTable from '@/components/CategoryDetailsTable'

export default function SalesCategoryDetails() {
  const [filters, setFilters] = useState(loadFilters())

  // Sync filters from localStorage on mount
  useEffect(() => {
    const savedFilters = loadFilters()
    console.log('Sales Category Details - Loading saved filters:', savedFilters)
    setFilters(savedFilters)
  }, [])

  const handleFiltersChange = useCallback((newFilters: any) => {
    console.log('Sales Category Details - Filters updated:', newFilters)
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
      link.download = `Designer-Metals-Sales-Category-Details-${new Date().toISOString().split('T')[0]}.png`
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
    
    const subject = encodeURIComponent('Designer Metals - Sales by Category Details Report')
    const body = encodeURIComponent(`
Dear Team,

Please find the Sales by Category Details Report for Designer Metals.

Report Details:
• Generated: ${currentDate}
• Applied Filters: 
  - Year: ${filters.year}
  - Customer: ${filters.customer}
  - Category: ${filters.category}

This comprehensive report includes:
• Category performance cards
• Sales by category bar chart
• Amount over time line chart
• Detailed monthly breakdown table
• Category-specific insights

The dashboard provides real-time data from our Supabase database with detailed category analysis.

For any questions or additional analysis, please contact the Analytics Team.

Best regards,
Designer Metals Analytics Team
    `)
    
    window.open(`mailto:?subject=${subject}&body=${body}`)
  }

  // Category cards data
  const categories = [
    'Carports', 'Carports Down Payment', 'Coil', 'Contractor', 
    'Customers', 'LuxGuard', 'Shed', 
    'Standard', 'Wholesale'
  ]

  return (
    <div className="w-full min-h-screen bg-gray-50">
      {/* Header with Logo, Filters, and Export Options */}
      <DashboardHeader pageName="Sales by Category Details" onFiltersChange={handleFiltersChange} />

      {/* Main Content */}
      <div className="p-8">
        {/* Page Title */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Sales by Category Details</h1>
          <p className="text-lg text-gray-600 mt-2">Comprehensive category performance analysis and detailed insights</p>
        </div>

        {/* Category Cards - Horizontal Train */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Category Overview</h2>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {categories.map((category) => (
              <div
                key={category}
                className="bg-white rounded-lg shadow-sm border border-gray-200 px-4 py-3 text-center hover:shadow-md transition-shadow cursor-pointer flex-shrink-0 whitespace-nowrap"
              >
                <div className="text-sm font-medium text-gray-800">
                  {category}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
          {/* Horizontal Bar Chart - Left side */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">Sales by Category</h2>
              <div className="h-80 w-full">
                <CategoryBarChart filters={filters} />
              </div>
            </div>
          </div>
          
          {/* Line Chart - Right side */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">Amount Over Time</h2>
              <div className="h-80 w-full">
                <CategoryLineChart filters={filters} />
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Data Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Category Performance Details</h2>
            <div className="overflow-x-auto">
              <CategoryDetailsTable filters={filters} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
