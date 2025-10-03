'use client'

import { useEffect, useRef } from 'react'
import * as echarts from 'echarts'

interface YearlyCoilChartProps {
  filters: {
    year: string
    customer: string
    category: string
  }
}

export default function YearlyCoilChart({ filters }: YearlyCoilChartProps) {
  const chartRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!chartRef.current) return

    const chart = echarts.init(chartRef.current)
    
    // Sample data matching the Power BI report
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    
    const years = [
      { name: '2021', color: '#1e3a8a' }, // Dark blue
      { name: '2022', color: '#f97316' }, // Orange
      { name: '2023', color: '#a855f7' }, // Purple
      { name: '2024', color: '#ec4899' }, // Pink
      { name: '2025', color: '#7c3aed' }   // Dark purple
    ]

    // Sample data for each month and year
    const monthlyData = {
      'January': {
        '2021': 0,
        '2022': 0,
        '2023': 0.39,
        '2024': 0.32,
        '2025': 0.22
      },
      'February': {
        '2021': 0,
        '2022': 0.01,
        '2023': 0.34,
        '2024': 0.15,
        '2025': 0
      },
      'March': {
        '2021': 0,
        '2022': 0,
        '2023': 0.31,
        '2024': 0.19,
        '2025': 0.31
      },
      'April': {
        '2021': 0,
        '2022': 0,
        '2023': 0.51,
        '2024': 0.29,
        '2025': 0.21
      },
      'May': {
        '2021': 0,
        '2022': 0.04,
        '2023': 0.48,
        '2024': 0.36,
        '2025': 0
      },
      'June': {
        '2021': 0,
        '2022': 0.11,
        '2023': 0.57,
        '2024': 0.32,
        '2025': 0
      },
      'July': {
        '2021': 0,
        '2022': 0,
        '2023': 1.50,
        '2024': 0.53,
        '2025': 0.29
      },
      'August': {
        '2021': 0,
        '2022': 0,
        '2023': 0.94,
        '2024': 0.55,
        '2025': 0.30
      },
      'September': {
        '2021': 0,
        '2022': 0.08,
        '2023': 0.87,
        '2024': 0.28,
        '2025': 0.21
      },
      'October': {
        '2021': 0,
        '2022': 0.01,
        '2023': 0.32,
        '2024': 0.24,
        '2025': 0
      },
      'November': {
        '2021': 0,
        '2022': 0.00,
        '2023': 0.30,
        '2024': 0.20,
        '2025': 0
      },
      'December': {
        '2021': 0,
        '2022': 0,
        '2023': 0.33,
        '2024': 0.18,
        '2025': 0
      }
    }

    // Prepare series data for each year
    const series = years.map(year => ({
      name: year.name,
      type: 'bar',
      data: months.map(month => monthlyData[month as keyof typeof monthlyData][year.name as keyof typeof monthlyData[typeof month]] || 0),
      itemStyle: {
        color: year.color
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
        name: 'Coil Sales',
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
