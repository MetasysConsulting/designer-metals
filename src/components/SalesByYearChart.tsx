'use client'

import { useEffect, useRef } from 'react'
import * as echarts from 'echarts'

interface SalesByYearChartProps {
  filters: {
    year: string
    customer: string
    category: string
  }
}

export default function SalesByYearChart({ filters }: SalesByYearChartProps) {
  const chartRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!chartRef.current) return

    const chart = echarts.init(chartRef.current)
    
    // Sample data matching the Power BI report
    const months = ['July', 'August', 'June', 'September', 'May', 'April', 'March', 'January', 'February']
    
    const categories = [
      { name: 'Carports', color: '#60a5fa' },
      { name: 'Carports Down Payment', color: '#1e40af' },
      { name: 'Coil', color: '#f97316' },
      { name: 'Contractor', color: '#a855f7' },
      { name: 'LuxGuard', color: '#7c3aed' },
      { name: 'Shed', color: '#eab308' },
      { name: 'Standard', color: '#14b8a6' },
      { name: 'Wholesale', color: '#22c55e' }
    ]

    // Sample data for each month and category
    const monthlyData = {
      'July': {
        'Coil': 1.50,
        'Carports': 0.25,
        'Contractor': 0.17,
        'LuxGuard': 0.13,
        'Wholesale': 0.06,
        'Shed': 0.01
      },
      'August': {
        'Coil': 0.94,
        'Carports': 0.22,
        'Wholesale': 0.22,
        'Contractor': 0.08,
        'LuxGuard': 0.04,
        'Shed': 0.03
      },
      'June': {
        'Coil': 0.57,
        'Contractor': 0.27,
        'Carports': 0.22,
        'Wholesale': 0.18,
        'LuxGuard': 0.14,
        'Shed': 0.06,
        'Carports Down Payment': 0.02
      },
      'September': {
        'Coil': 0.87,
        'Wholesale': 0.19,
        'Carports': 0.16,
        'Contractor': 0.08,
        'LuxGuard': 0.02
      },
      'May': {
        'Coil': 0.36,
        'Wholesale': 0.32,
        'Carports': 0.22,
        'Contractor': 0.16,
        'LuxGuard': 0.08,
        'Shed': 0.01
      },
      'April': {
        'Coil': 0.51,
        'Carports': 0.20,
        'Wholesale': 0.20,
        'Contractor': 0.11,
        'LuxGuard': 0.04,
        'Shed': 0.01
      },
      'March': {
        'Coil': 0.31,
        'Carports': 0.22,
        'Wholesale': 0.15,
        'Contractor': 0.07,
        'LuxGuard': 0.03,
        'Shed': 0.01
      },
      'January': {
        'Coil': 0.32,
        'Carports': 0.17,
        'Wholesale': 0.15,
        'Contractor': 0.09,
        'LuxGuard': 0.04,
        'Shed': 0.01
      },
      'February': {
        'Coil': 0.15,
        'Wholesale': 0.10,
        'Carports': 0.06,
        'Contractor': 0.06
      }
    }

    // Prepare series data for each category
    const series = categories.map(category => ({
      name: category.name,
      type: 'bar',
      data: months.map(month => monthlyData[month as keyof typeof monthlyData][category.name as keyof typeof monthlyData[typeof month]] || 0),
      itemStyle: {
        color: category.color
      }
    }))

    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        formatter: function(params: any) {
          let result = `<strong>${params[0].axisValue}</strong><br/>`
          params.forEach((param: any) => {
            if (param.value > 0) {
              result += `${param.seriesName}: $${param.value}M<br/>`
            }
          })
          return result
        }
      },
      legend: {
        data: categories.map(cat => cat.name),
        top: 10,
        textStyle: {
          fontSize: 10
        },
        itemWidth: 12,
        itemHeight: 8
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: '15%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: months,
        axisLabel: {
          color: '#6b7280',
          fontSize: 11,
          rotate: 45
        },
        axisLine: {
          lineStyle: {
            color: '#e5e7eb'
          }
        }
      },
      yAxis: {
        type: 'value',
        name: 'Sales',
        nameLocation: 'middle',
        nameGap: 50,
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
      series: series
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
