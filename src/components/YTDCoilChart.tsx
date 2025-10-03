'use client'

import { useEffect, useRef } from 'react'
import * as echarts from 'echarts'

interface YTDCoilChartProps {
  filters: {
    year: string
    customer: string
    category: string
  }
}

export default function YTDCoilChart({ filters }: YTDCoilChartProps) {
  const chartRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!chartRef.current) return

    const chart = echarts.init(chartRef.current)
    
    // Sample data matching the Power BI report
    const years = ['2021', '2022', '2023', '2024', '2025']
    const salesData = [0.0, 0.1, 2.7, 3.9, 5.5] // YTD sales in millions

    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        formatter: function(params: any) {
          return `<strong>${params[0].axisValue}</strong><br/>Coil YTD Sales: $${params[0].value}M`
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'value',
        name: 'Coil YTD Sales',
        nameLocation: 'middle',
        nameGap: 30,
        nameTextStyle: {
          color: '#6b7280',
          fontSize: 12,
          fontWeight: 'bold'
        },
        axisLabel: {
          color: '#6b7280',
          fontSize: 11,
          formatter: function(value: number) {
            return `${value}M`
          }
        },
        axisLine: {
          lineStyle: {
            color: '#e5e7eb'
          }
        },
        splitLine: {
          lineStyle: {
            color: '#f3f4f6',
            type: 'dashed'
          }
        }
      },
      yAxis: {
        type: 'category',
        data: years,
        axisLabel: {
          color: '#6b7280',
          fontSize: 11
        },
        axisLine: {
          lineStyle: {
            color: '#e5e7eb'
          }
        }
      },
      series: [
        {
          name: 'Coil YTD Sales',
          type: 'bar',
          data: salesData,
          itemStyle: {
            color: '#fbbf24' // Yellow/gold color to match Power BI report
          },
          barWidth: '60%',
          label: {
            show: true,
            position: 'right',
            formatter: function(params: any) {
              return `${params.value}M`
            },
            color: '#374151',
            fontSize: 11
          }
        }
      ]
    }

    chart.setOption(option)

    const handleResize = () => {
      chart.resize()
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      chart.dispose()
    }

  }, [filters])

  return (
    <div 
      ref={chartRef} 
      style={{ width: '100%', height: '100%' }}
    />
  )
}
