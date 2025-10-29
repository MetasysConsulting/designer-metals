'use client'

import { useState, useCallback } from 'react'
import html2canvas from 'html2canvas'
import { printDashboard as printDashboardUtil } from '@/utils/printDashboard'
import SalesChart from '@/components/SalesChart'
import CategoryChart from '@/components/CategoryChart'
import YTDChart from '@/components/YTDChart'
import KPICards from '@/components/KPICards'
import { LogoutLink } from '@kinde-oss/kinde-auth-nextjs/components'
import FilterBar from '@/components/FilterBar'
import SalesDetailsTable from '@/components/SalesDetailsTable'

export default function SalesOverview() {
  const [filters, setFilters] = useState({
    year: 'All',
    customer: 'All',
    category: 'All'
  })

  const handleFiltersChange = useCallback((newFilters: any) => {
    setFilters(newFilters)
  }, [])

  const printDashboard = () => printDashboardUtil('Designer Metals Dashboard')

  const exportToImage = async () => {
    try {
      const buttons = document.querySelectorAll('button')
      buttons.forEach(btn => { if (btn instanceof HTMLElement) btn.style.visibility = 'hidden' })
      await new Promise(r => setTimeout(r, 100))
      const canvas = await html2canvas(document.body, { scale: 2, useCORS: true, allowTaint: true, backgroundColor: '#ffffff', logging: false, windowWidth: window.innerWidth, windowHeight: window.innerHeight })
      buttons.forEach(btn => { if (btn instanceof HTMLElement) btn.style.visibility = 'visible' })
      canvas.toBlob((blob) => { if (blob) { const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = `designer-metals-dashboard-${new Date().toISOString().split('T')[0]}.png`; document.body.appendChild(link); link.click(); document.body.removeChild(link); URL.revokeObjectURL(url) } }, 'image/png', 1.0)
    } catch (e) { console.error('Image export failed:', e) }
  }

  return (
    <div className="w-full min-h-screen bg-gray-50">
      <div className="w-full bg-gray-50 py-6 px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <img src="/Designer Metals Logo.png" alt="Designer Metals Logo" className="h-24 object-contain" />
          </div>
          <div className="flex items-center gap-8">
            <FilterBar onFiltersChange={handleFiltersChange} />
            <div className="flex items-center gap-3">
              <button onClick={() => printDashboard()} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2 text-sm" title="Print Screenshot with Controls">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                Print
              </button>
              <button onClick={() => exportToImage()} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2 text-sm" title="Save as Image">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                Image
              </button>
              <LogoutLink className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-black transition-colors font-medium text-sm">Log out</LogoutLink>
            </div>
          </div>
        </div>
      </div>

      <div className="p-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Sales Dashboard Overview</h1>
          <p className="text-lg text-gray-600 mt-2">Comprehensive sales analytics and performance insights</p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">Total Sales - Monthly View</h2>
              <div className="h-80 w-full">
                <SalesChart filters={filters} />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">Total Sales</h2>
              <div className="h-80 w-full">
                <YTDChart filters={filters} />
              </div>
            </div>
          </div>
        </div>

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
  )
}


