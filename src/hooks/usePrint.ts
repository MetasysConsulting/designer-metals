'use client'

import { useReactToPrint } from 'react-to-print'
import { useRef } from 'react'

export function usePrint() {
  const componentRef = useRef<HTMLDivElement>(null)
  
  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: 'Designer Metals Dashboard',
    removeAfterPrint: false,
    onBeforeGetContent: () => {
      // Ensure the component is ready
      if (!componentRef.current) {
        console.error('Print component not found')
        return Promise.resolve()
      }
      
      // Force chart resizing before print
      const chartCanvases = document.querySelectorAll('canvas')
      chartCanvases.forEach(canvas => {
        const chartInstance = (canvas as any).__chartjs__ || (canvas as any).chart
        if (chartInstance && typeof chartInstance.resize === 'function') {
          chartInstance.resize()
        }
      })

      // Force ECharts resize if available
      if (typeof window !== 'undefined' && (window as any).echarts) {
        const echartsInstances = (window as any).echarts.getInstanceByDom
        if (echartsInstances) {
          const containers = document.querySelectorAll('.echarts-for-react')
          containers.forEach(container => {
            const instance = echartsInstances(container)
            if (instance && typeof instance.resize === 'function') {
              instance.resize()
            }
          })
        }
      }
      
      return Promise.resolve()
    },
    pageStyle: `
      @page {
        size: A4 landscape;
        margin: 0.5in;
      }
      
      @media print {
        body {
          margin: 0;
          padding: 0;
          background: white !important;
          color: black !important;
        }
        
        .printable-dashboard {
          background: white !important;
          color: black !important;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
          line-height: 1.4 !important;
          padding: 0 !important;
          margin: 0 !important;
          max-width: 100% !important;
        }
        
        .printable-dashboard * {
          box-sizing: border-box !important;
        }
        
        .printable-dashboard h1,
        .printable-dashboard h2,
        .printable-dashboard h3 {
          margin: 0 0 16px 0 !important;
          font-weight: 600 !important;
          color: #1f2937 !important;
        }
        
        .printable-dashboard h1 {
          font-size: 24px !important;
        }
        
        .printable-dashboard h2 {
          font-size: 20px !important;
        }
        
        .printable-dashboard h3 {
          font-size: 18px !important;
        }
        
        .printable-dashboard p {
          margin: 0 0 12px 0 !important;
          color: #6b7280 !important;
        }
        
        .printable-dashboard .chart-container {
          width: 100% !important;
          height: 300px !important;
          margin: 16px 0 !important;
          page-break-inside: avoid !important;
          break-inside: avoid !important;
        }
        
        .printable-dashboard .chart-container canvas {
          width: 100% !important;
          height: 100% !important;
          max-width: 100% !important;
          object-fit: contain !important;
        }
        
        .printable-dashboard .grid {
          display: grid !important;
          gap: 16px !important;
          margin: 16px 0 !important;
        }
        
        .printable-dashboard .grid-cols-2 {
          grid-template-columns: 1fr 1fr !important;
        }
        
        .printable-dashboard .bg-white {
          background: white !important;
          border: 1px solid #e5e7eb !important;
          border-radius: 8px !important;
          padding: 16px !important;
          margin: 8px 0 !important;
          page-break-inside: avoid !important;
          break-inside: avoid !important;
        }
        
        .printable-dashboard table {
          width: 100% !important;
          border-collapse: collapse !important;
          margin: 16px 0 !important;
          page-break-inside: avoid !important;
          break-inside: avoid !important;
        }
        
        .printable-dashboard th,
        .printable-dashboard td {
          border: 1px solid #d1d5db !important;
          padding: 8px 12px !important;
          text-align: left !important;
          font-size: 14px !important;
        }
        
        .printable-dashboard th {
          background-color: #f9fafb !important;
          font-weight: 600 !important;
          color: #374151 !important;
        }
        
        .printable-dashboard td {
          color: #6b7280 !important;
        }
        
        .printable-dashboard .font-bold {
          font-weight: 700 !important;
        }
        
        .printable-dashboard .font-semibold {
          font-weight: 600 !important;
        }
        
        .printable-dashboard .text-gray-900 {
          color: #111827 !important;
        }
        
        .printable-dashboard .text-gray-800 {
          color: #1f2937 !important;
        }
        
        .printable-dashboard .text-gray-700 {
          color: #374151 !important;
        }
        
        .printable-dashboard .text-gray-600 {
          color: #4b5563 !important;
        }
        
        .printable-dashboard .text-gray-500 {
          color: #6b7280 !important;
        }
        
        .printable-dashboard .text-sm {
          font-size: 14px !important;
        }
        
        .printable-dashboard .text-lg {
          font-size: 18px !important;
        }
        
        .printable-dashboard .text-xl {
          font-size: 20px !important;
        }
        
        .printable-dashboard .text-2xl {
          font-size: 24px !important;
        }
        
        .printable-dashboard .text-3xl {
          font-size: 30px !important;
        }
        
        .printable-dashboard .text-4xl {
          font-size: 36px !important;
        }
        
        /* Hide elements that shouldn't print */
        .printable-dashboard .no-print,
        .printable-dashboard button,
        .printable-dashboard .export-buttons {
          display: none !important;
        }
        
        /* Ensure proper spacing */
        .printable-dashboard .space-y-4 > * + * {
          margin-top: 16px !important;
        }
        
        .printable-dashboard .space-y-6 > * + * {
          margin-top: 24px !important;
        }
        
        .printable-dashboard .space-y-8 > * + * {
          margin-top: 32px !important;
        }
        
        /* Force chart responsiveness */
        .printable-dashboard .echarts-for-react {
          width: 100% !important;
          height: 100% !important;
        }
        
        .printable-dashboard .echarts-for-react canvas {
          width: 100% !important;
          height: 100% !important;
          max-width: 100% !important;
        }
      }
    `,
    onAfterPrint: () => {
      // Resize charts back to normal after printing
      const chartCanvases = document.querySelectorAll('canvas')
      chartCanvases.forEach(canvas => {
        const chartInstance = (canvas as any).__chartjs__ || (canvas as any).chart
        if (chartInstance && typeof chartInstance.resize === 'function') {
          chartInstance.resize()
        }
      })

      // Resize ECharts back
      if (typeof window !== 'undefined' && (window as any).echarts) {
        const echartsInstances = (window as any).echarts.getInstanceByDom
        if (echartsInstances) {
          const containers = document.querySelectorAll('.echarts-for-react')
          containers.forEach(container => {
            const instance = echartsInstances(container)
            if (instance && typeof instance.resize === 'function') {
              instance.resize()
            }
          })
        }
      }
    }
  })

  return { componentRef, handlePrint }
}
