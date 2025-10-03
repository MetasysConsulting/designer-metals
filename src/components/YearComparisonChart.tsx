'use client'

import { useEffect, useRef } from 'react'
import * as echarts from 'echarts'

interface YearComparisonChartProps {
  filters: {
    year: string
    customer: string
    category: string
  }
}

export default function YearComparisonChart({ filters }: YearComparisonChartProps) {
  const chartRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!chartRef.current) return

    const chart = echarts.init(chartRef.current)
    
    // Sample data matching the Power BI report
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    
    const years = [
      { name: '2020', color: '#1f77b4' }, // Blue
      { name: '2021', color: '#1e3a8a' }, // Dark Blue
      { name: '2022', color: '#f97316' }, // Orange
      { name: '2023', color: '#a855f7' }, // Purple
      { name: '2024', color: '#ec4899' }, // Pink
      { name: '2025', color: '#7c3aed' }   // Dark Purple
    ]

    // Sample data for each month and year (in millions)
    const monthlyData = {
      '2020': [0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00],
      '2021': [0.05, 0.00, 0.04, 0.07, 0.06, 0.09, 0.06, 0.00, 0.01, 0.09, 0.00, 0.00],
      '2022': [0.14, 0.22, 0.27, 0.13, 0.11, 0.16, 0.19, 0.20, 0.22, 0.26, 0.19, 0.28],
      '2023': [0.55, 0.57, 0.48, 0.39, 0.22, 0.36, 0.54, 0.46, 0.45, 0.51, 0.57, 0.38],
      '2024': [0.65, 0.57, 0.51, 0.60, 1.01, 0.72, 0.96, 0.93, 0.92, 0.71, 0.77, 0.82],
      '2025': [0.79, 0.89, 1.22, 1.24, 1.46, 2.87, 1.46, 1.46, 1.46, 1.46, 1.46, 1.46]
    }

    // Prepare series data for each year
    const series = years.map(year => ({
      name: year.name,
      type: 'line',
      data: monthlyData[year.name as keyof typeof monthlyData],
      itemStyle: {
        color: year.color
      },
      lineStyle: {
        color: year.color,
        width: 2
      },
      symbol: 'circle',
      symbolSize: 4,
      smooth: false
    }))

    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          crossStyle: {
            color: '#999'
          }
        },
        formatter: function(params: any) {
          let result = `<strong>${params[0].axisValue}</strong><br/>`
          params.forEach((param: any) => {
            result += `${param.seriesName}: $${param.value}M<br/>`
          })
          return result
        }
      },
      legend: {
        data: years.map(year => year.name),
        top: 10,
        textStyle: {
          fontSize: 12
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
