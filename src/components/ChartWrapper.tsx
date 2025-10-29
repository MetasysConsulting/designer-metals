'use client'

import { useEffect, useRef } from 'react'

interface ChartWrapperProps {
  children: React.ReactNode
  className?: string
}

export default function ChartWrapper({ children, className = '' }: ChartWrapperProps) {
  const chartRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const beforePrintHandler = () => {
      // Force resize all chart instances before printing
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
    }

    const afterPrintHandler = () => {
      // Resize charts back to normal display after printing
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

    // Listen for print events
    window.addEventListener('beforeprint', beforePrintHandler)
    window.addEventListener('afterprint', afterPrintHandler)

    return () => {
      window.removeEventListener('beforeprint', beforePrintHandler)
      window.removeEventListener('afterprint', afterPrintHandler)
    }
  }, [])

  return (
    <div ref={chartRef} className={`chart-container ${className}`}>
      {children}
    </div>
  )
}
