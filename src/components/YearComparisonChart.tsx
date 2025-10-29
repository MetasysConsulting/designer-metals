'use client'

import { useEffect, useRef, useState } from 'react'
import * as echarts from 'echarts'
import { fetchYearlySalesData } from '@/lib/csvDataSource'

interface YearComparisonChartProps {
  filters: {
    year: string
    customer: string
    category: string
  }
}

interface YearlyData {
  year: string
  amount: number
}

export default function YearComparisonChart({ filters }: YearComparisonChartProps) {
  const chartRef = useRef<HTMLDivElement>(null)
  const [data, setData] = useState<YearlyData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      
      try {
        // Fetch data from CSV
        const realData = await fetchYearlySalesData(filters)
        
        // Convert to array and sort by year, convert to millions
        const processedData = realData
          .sort((a, b) => a.year.localeCompare(b.year))
          .map(item => ({
            year: item.year,
            amount: item.amount / 1000000 // Convert to millions
          }))

        setData(processedData)
      } catch (error) {
        console.error('Error processing year comparison data:', error)
        setData([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [filters])

  useEffect(() => {
    if (!chartRef.current || loading) return

    const chart = echarts.init(chartRef.current)
    
    const years = data.map(item => item.year)
    const amounts = data.map(item => item.amount)

    // Generate colors for each year
    const colors = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf']

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
      yAxis: {
        type: 'value',
        name: 'Sales (Millions)',
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
            return `$${value}M`
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
      series: [{
        name: 'Sales',
        type: 'bar',
        data: amounts,
        itemStyle: {
          color: function(params: any) {
            return colors[params.dataIndex % colors.length]
          }
        },
        emphasis: {
          itemStyle: {
            opacity: 0.8
          }
        }
      }]
    }

    chart.setOption(option)

    return () => {
      chart.dispose()
    }
  }, [data, loading])

  if (loading) {
    return (
      <div className="w-full h-96 flex items-center justify-center">
        <div className="text-gray-500">Loading chart data...</div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div ref={chartRef} className="w-full h-96"></div>
    </div>
  )
}