'use client'

import { useEffect, useRef, useState } from 'react'
import * as echarts from 'echarts'
import { createClient } from '@supabase/supabase-js'

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
      
      // Check if Supabase is configured
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://placeholder.supabase.co') {
        console.warn('Supabase not configured, returning empty data for YTD coil chart')
        setData([])
        setLoading(false)
        return
      }

      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      )

      try {
        let query = supabase
          .from('ARINV')
          .select('TOTAL, INV_DATE, NAME, TREE_DESCR')
          .not('TOTAL', 'is', null)
          .not('INV_DATE', 'is', null)
          .eq('TREE_DESCR', 'Coil') // Only coil products
          .not('TREE_DESCR', 'eq', 'Employee Appreciation')
          .not('TREE_DESCR', 'eq', 'Shipped To')

        // Apply filters
        if (filters.customer && filters.customer !== 'All') {
          query = query.eq('NAME', filters.customer)
        }

        const { data: records, error } = await query

        if (error) {
          console.error('Error fetching YTD coil data:', error)
          setData([])
          setLoading(false)
          return
        }

        // Process data by year for YTD (year-to-date)
        const yearlyData: { [key: string]: number } = {}
        
        records?.forEach(record => {
          if (record.INV_DATE) {
            const date = new Date(record.INV_DATE)
            const year = date.getFullYear().toString()
            const amount = parseFloat(record.TOTAL || '0') || 0
            
            if (yearlyData[year]) {
              yearlyData[year] += amount
            } else {
              yearlyData[year] = amount
            }
          }
        })

        // Convert to array and sort by year
        const processedData = Object.keys(yearlyData)
          .sort()
          .map(year => ({
            year,
            amount: yearlyData[year] / 1000000 // Convert to millions
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