import { useReactToPrint } from 'react-to-print'
import { useRef } from 'react'

export function useA4Print() {
  const componentRef = useRef<HTMLDivElement>(null)
  
  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: 'Designer Metals Dashboard',
    pageStyle: `
      @page {
        size: A4;
        margin: 0;
      }
      
      @media print {
        body {
          margin: 0 !important;
          padding: 0 !important;
          background: white !important;
          color: black !important;
        }
        
        .a4-print-layout {
          width: 210mm !important;
          height: 297mm !important;
          margin: 0 !important;
          padding: 10mm !important;
          background: white !important;
          color: black !important;
          font-size: 12px !important;
          box-sizing: border-box !important;
        }
        
        .a4-print-layout * {
          -webkit-print-color-adjust: exact !important;
          color-adjust: exact !important;
          print-color-adjust: exact !important;
          box-sizing: border-box !important;
        }
        
        .a4-print-layout h1 {
          font-size: 24px !important;
          font-weight: bold !important;
          color: #1a1a1a !important;
          margin: 0 0 8px 0 !important;
          text-align: center !important;
        }
        
        .a4-print-layout h2 {
          font-size: 16px !important;
          font-weight: bold !important;
          color: #333 !important;
          margin: 0 0 6px 0 !important;
        }
        
        .a4-print-layout h3 {
          font-size: 14px !important;
          font-weight: bold !important;
          color: #555 !important;
          margin: 0 0 4px 0 !important;
        }
        
        .a4-print-layout p {
          font-size: 12px !important;
          color: #666 !important;
          margin: 0 0 4px 0 !important;
        }
        
        .a4-print-layout .header {
          text-align: center !important;
          margin-bottom: 8mm !important;
          border-bottom: 2px solid #333 !important;
          padding-bottom: 4mm !important;
        }
        
        .a4-print-layout .logo {
          height: 40px !important;
          margin-bottom: 4px !important;
        }
        
        .a4-print-layout .charts-grid {
          display: grid !important;
          grid-template-columns: 1fr 1fr !important;
          gap: 6mm !important;
          margin-bottom: 8mm !important;
          height: 80mm !important;
        }
        
        .a4-print-layout .chart-container {
          background: white !important;
          border: 1px solid #ddd !important;
          border-radius: 4px !important;
          padding: 4mm !important;
          height: 100% !important;
          display: flex !important;
          flex-direction: column !important;
          page-break-inside: avoid !important;
          break-inside: avoid !important;
        }
        
        .a4-print-layout .chart-title {
          font-size: 14px !important;
          font-weight: bold !important;
          color: #333 !important;
          margin-bottom: 4mm !important;
          text-align: center !important;
        }
        
        .a4-print-layout .chart-wrapper {
          flex: 1 !important;
          height: 60mm !important;
          min-height: 60mm !important;
          max-height: 60mm !important;
        }
        
        .a4-print-layout .table-container {
          background: white !important;
          border: 1px solid #ddd !important;
          border-radius: 4px !important;
          padding: 4mm !important;
          height: 120mm !important;
          overflow: hidden !important;
          page-break-inside: avoid !important;
          break-inside: avoid !important;
        }
        
        .a4-print-layout .table-title {
          font-size: 14px !important;
          font-weight: bold !important;
          color: #333 !important;
          margin-bottom: 4mm !important;
          text-align: center !important;
        }
        
        .a4-print-layout table {
          width: 100% !important;
          border-collapse: collapse !important;
          font-size: 10px !important;
          height: 100% !important;
        }
        
        .a4-print-layout th {
          background-color: #f5f5f5 !important;
          border: 1px solid #ddd !important;
          padding: 2mm !important;
          text-align: left !important;
          font-weight: bold !important;
          font-size: 10px !important;
        }
        
        .a4-print-layout td {
          border: 1px solid #ddd !important;
          padding: 1.5mm !important;
          font-size: 9px !important;
        }
        
        .a4-print-layout .chart-container canvas {
          width: 100% !important;
          height: 100% !important;
          max-width: 100% !important;
          max-height: 100% !important;
        }
        
        .a4-print-layout .echarts-for-react {
          width: 100% !important;
          height: 100% !important;
        }
        
        .a4-print-layout .echarts-for-react canvas {
          width: 100% !important;
          height: 100% !important;
          max-width: 100% !important;
          max-height: 100% !important;
        }
      }
    `,
    onBeforeGetContent: () => {
      console.log('A4 Print: Before get content')
      console.log('Component ref:', componentRef.current)
      
      if (!componentRef.current) {
        console.error('A4 Print: Component ref is null')
        return Promise.resolve()
      }
      
      // Force chart resizing before print
      const chartCanvases = document.querySelectorAll('canvas')
      console.log('Found canvas elements:', chartCanvases.length)
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

  return { componentRef, handleA4Print: handlePrint }
}
