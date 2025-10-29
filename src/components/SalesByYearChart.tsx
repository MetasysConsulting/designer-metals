'use client'

import { useEffect, useRef, useState } from 'react'
import * as echarts from 'echarts'
import { fetchMonthlySalesData } from '@/lib/csvDataSource'

interface SalesByYearChartProps {
  filters: {
    year: string
    customer: string
    category: string
  }
}

interface MonthlyData {
  month: string
  amount: number
}

export default function SalesByYearChart({ filters }: SalesByYearChartProps) {
  const chartRef = useRef<HTMLDivElement>(null)
  const [data, setData] = useState<MonthlyData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      
      try {
        // Fetch data from CSV
        const realData = await fetchMonthlySalesData(filters)
        
        // Convert to array and sort by month, convert to millions
        const processedData = realData
          .map(item => ({
            month: item.month,
            amount: item.amount / 1000000 // Convert to millions
          }))

        setData(processedData)
      } catch (error) {
        console.error('Error processing sales data:', error)
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
    
    const months = data.map(item => item.month)
    const amounts = data.map(item => item.amount)

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
        data: months,
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
          color: '#3b82f6'
        },
        emphasis: {
          itemStyle: {
            color: '#1d4ed8'
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