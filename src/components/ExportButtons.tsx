'use client'

import { useRouter } from 'next/navigation'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { captureAllPagesAutomatically } from '@/utils/realAutoPDF'

interface ExportButtonsProps {
  pageName: string
  onExportChart?: () => void
}

export default function ExportButtons({ pageName, onExportChart }: ExportButtonsProps) {
  const router = useRouter()

  // Export Full Report - All pages to ONE PDF
  const handleFullReport = async () => {
    await captureAllPagesAutomatically(router)
  }

  // Export Current Chart - Entire current page to PDF
  const handleExportChart = async () => {
    try {
      
      // Hide buttons temporarily
      const buttons = document.querySelectorAll('button')
      buttons.forEach(btn => {
        if (btn instanceof HTMLElement) {
          btn.style.visibility = 'hidden'
        }
      })

      await new Promise(resolve => setTimeout(resolve, 100))

      // Add CSS to convert oklch colors to RGB before capture
      const colorFixStyle = document.createElement('style')
      colorFixStyle.id = 'color-fix-style'
      colorFixStyle.textContent = `
        * {
          color: inherit !important;
          background-color: inherit !important;
          border-color: inherit !important;
        }
        .bg-gray-50 { background-color: #f9fafb !important; }
        .bg-gray-100 { background-color: #f3f4f6 !important; }
        .bg-gray-800 { background-color: #1f2937 !important; }
        .bg-white { background-color: #ffffff !important; }
        .text-gray-900 { color: #111827 !important; }
        .text-gray-800 { color: #1f2937 !important; }
        .text-gray-700 { color: #374151 !important; }
        .text-gray-600 { color: #4b5563 !important; }
        .text-gray-500 { color: #6b7280 !important; }
        .text-gray-400 { color: #9ca3af !important; }
        .text-gray-300 { color: #d1d5db !important; }
        .text-white { color: #ffffff !important; }
        .border-gray-200 { border-color: #e5e7eb !important; }
        .border-gray-300 { border-color: #d1d5db !important; }
        .bg-blue-600 { background-color: #2563eb !important; }
        .bg-blue-700 { background-color: #1d4ed8 !important; }
        .bg-green-600 { background-color: #16a34a !important; }
        .bg-purple-600 { background-color: #9333ea !important; }
        .bg-teal-600 { background-color: #0d9488 !important; }
        .bg-teal-700 { background-color: #0f766e !important; }
        .text-blue-600 { color: #2563eb !important; }
        .text-green-600 { color: #16a34a !important; }
        .text-teal-600 { color: #0d9488 !important; }
      `
      document.head.appendChild(colorFixStyle)

      await new Promise(resolve => setTimeout(resolve, 200))

      // Capture the ENTIRE current page (all charts and content)
      const dashboardElement = document.querySelector('.min-h-screen') as HTMLElement
      if (!dashboardElement) {
        alert('Page content not found')
        return
      }

      console.log('Capturing entire page:', dashboardElement)

      const canvas = await html2canvas(dashboardElement, {
        scale: 1.5,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: dashboardElement.scrollWidth,
        height: dashboardElement.scrollHeight,
        scrollX: 0,
        scrollY: 0
      })

      // Remove color fix style
      const styleToRemove = document.getElementById('color-fix-style')
      if (styleToRemove) {
        document.head.removeChild(styleToRemove)
      }

      // Restore buttons
      buttons.forEach(btn => {
        if (btn instanceof HTMLElement) {
          btn.style.visibility = 'visible'
        }
      })

      // Convert to PDF
      const imgData = canvas.toDataURL('image/png', 1.0)
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      })

      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      const imgWidth = canvas.width
      const imgHeight = canvas.height
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight)
      const finalWidth = imgWidth * ratio
      const finalHeight = imgHeight * ratio
      const x = (pdfWidth - finalWidth) / 2
      const y = (pdfHeight - finalHeight) / 2

      pdf.addImage(imgData, 'PNG', x, y, finalWidth, finalHeight)
      pdf.save(`${pageName.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`)
      
      console.log('Current page exported to PDF successfully')

    } catch (error) {
      console.error('Page export to PDF failed:', error)
      alert('Page export to PDF failed. Please try again.')
      
      // Restore buttons in case of error
      const buttons = document.querySelectorAll('button')
      buttons.forEach(btn => {
        if (btn instanceof HTMLElement) {
          btn.style.visibility = 'visible'
        }
      })
    }
  }

  // Download Image - Current page as PNG
  const handleDownloadImage = async () => {
    try {
      console.log(`Downloading current page as image: ${pageName}`)
      
      // Hide buttons temporarily
      const buttons = document.querySelectorAll('button')
      buttons.forEach(btn => {
        if (btn instanceof HTMLElement) {
          btn.style.visibility = 'hidden'
        }
      })

      await new Promise(resolve => setTimeout(resolve, 100))

      // Add CSS to convert oklch colors to RGB before capture
      const colorFixStyle = document.createElement('style')
      colorFixStyle.id = 'color-fix-style'
      colorFixStyle.textContent = `
        * {
          color: inherit !important;
          background-color: inherit !important;
          border-color: inherit !important;
        }
        .bg-gray-50 { background-color: #f9fafb !important; }
        .bg-gray-100 { background-color: #f3f4f6 !important; }
        .bg-gray-800 { background-color: #1f2937 !important; }
        .bg-white { background-color: #ffffff !important; }
        .text-gray-900 { color: #111827 !important; }
        .text-gray-800 { color: #1f2937 !important; }
        .text-gray-700 { color: #374151 !important; }
        .text-gray-600 { color: #4b5563 !important; }
        .text-gray-500 { color: #6b7280 !important; }
        .text-gray-400 { color: #9ca3af !important; }
        .text-gray-300 { color: #d1d5db !important; }
        .text-white { color: #ffffff !important; }
        .border-gray-200 { border-color: #e5e7eb !important; }
        .border-gray-300 { border-color: #d1d5db !important; }
        .bg-blue-600 { background-color: #2563eb !important; }
        .bg-blue-700 { background-color: #1d4ed8 !important; }
        .bg-green-600 { background-color: #16a34a !important; }
        .bg-purple-600 { background-color: #9333ea !important; }
        .bg-teal-600 { background-color: #0d9488 !important; }
        .bg-teal-700 { background-color: #0f766e !important; }
        .text-blue-600 { color: #2563eb !important; }
        .text-green-600 { color: #16a34a !important; }
        .text-teal-600 { color: #0d9488 !important; }
      `
      document.head.appendChild(colorFixStyle)

      await new Promise(resolve => setTimeout(resolve, 200))

      // Capture the entire page
      const dashboardElement = document.querySelector('.min-h-screen') as HTMLElement
      if (!dashboardElement) {
        alert('Page content not found')
        return
      }

      const canvas = await html2canvas(dashboardElement, {
        scale: 1.5,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: dashboardElement.scrollWidth,
        height: dashboardElement.scrollHeight,
        scrollX: 0,
        scrollY: 0
      })

      // Remove color fix style
      const styleToRemove = document.getElementById('color-fix-style')
      if (styleToRemove) {
        document.head.removeChild(styleToRemove)
      }

      // Restore buttons
      buttons.forEach(btn => {
        if (btn instanceof HTMLElement) {
          btn.style.visibility = 'visible'
        }
      })

      // Convert to blob and download as PNG
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          link.download = `${pageName.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.png`
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          URL.revokeObjectURL(url)
          console.log('Image downloaded successfully')
        }
      }, 'image/png', 1.0)

    } catch (error) {
      console.error('Image download failed:', error)
      alert('Image download failed. Please try again.')
      
      // Restore buttons in case of error
      const buttons = document.querySelectorAll('button')
      buttons.forEach(btn => {
        if (btn instanceof HTMLElement) {
          btn.style.visibility = 'visible'
        }
      })
    }
  }

  return (
    <div className="flex items-center gap-3">
      {/* Button 1: Export Full Report - All pages to ONE PDF */}
      <button
        onClick={handleFullReport}
        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center gap-2 text-sm"
        title="Export all dashboard pages to one PDF file"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Export Full Report
      </button>
      
      {/* Button 2: Export Current Chart - Entire current page to PDF */}
      <button
        onClick={handleExportChart}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2 text-sm"
        title="Export entire current page (all charts) to PDF file"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        Export Current Chart
      </button>
      
      {/* Button 3: Download Image - Current page as PNG */}
      <button
        onClick={handleDownloadImage}
        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2 text-sm"
        title="Download current page as PNG image"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        Download Image
      </button>
    </div>
  )
}
