'use client'

import { useEffect, useRef } from 'react'
import * as echarts from 'echarts'

interface IndividualSalesChartProps {
  category: string
  filters: {
    year: string
    customer: string
    category: string
  }
  data: {
    year: string
    sales: number
  }[]
}

export default function IndividualSalesChart({ category, filters, data }: IndividualSalesChartProps) {
  const chartRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!chartRef.current) return

    const chart = echarts.init(chartRef.current)
    
    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        formatter: function(params: any) {
          return `<strong>${params[0].axisValue}</strong><br/>Sales: $${params[0].value}M`
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
        name: 'Sales (M)',
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
        data: data.map(item => item.year),
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
          name: 'Sales',
          type: 'bar',
          data: data.map(item => item.sales),
          itemStyle: {
            color: '#fbbf24' // Yellow color to match Power BI report
          },
          barWidth: '60%'
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

  }, [data, filters])

  return (
    <div 
      ref={chartRef} 
      style={{ width: '100%', height: '100%' }}
    />
  )
}
