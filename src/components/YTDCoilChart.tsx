'use client'

import { useEffect, useRef, useState } from 'react'
import * as echarts from 'echarts'
import { fetchYearlySalesData } from '@/lib/csvDataSource'

interface YTDCoilChartProps {
  filters: {
    year: string
    customer: string
    category: string
  }
}

interface YTDData {
  year: string
  amount: number
}

export default function YTDCoilChart({ filters }: YTDCoilChartProps) {
  const chartRef = useRef<HTMLDivElement>(null)
  const [data, setData] = useState<YTDData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      
      try {
        // Fetch data from CSV with coil filter
        const coilFilters = { ...filters, category: 'Coil' }
        const realData = await fetchYearlySalesData(coilFilters)
        
        // Convert to array and sort by year, convert to millions
        const processedData = realData
          .sort((a, b) => a.year.localeCompare(b.year))
          .map(item => ({
            year: item.year,
            amount: item.amount / 1000000 // Convert to millions
          }))

        setData(processedData)
      } catch (error) {
        console.error('Error processing YTD coil data:', error)
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
        name: 'Coil YTD Sales (Millions)',
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
        name: 'Coil YTD Sales',
        type: 'bar',
        data: amounts,
        itemStyle: {
          color: '#f97316' // Orange color for coil
        },
        emphasis: {
          itemStyle: {
            color: '#ea580c'
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