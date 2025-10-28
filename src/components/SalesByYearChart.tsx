'use client'

import { useEffect, useRef, useState } from 'react'
import * as echarts from 'echarts'
import { createClient } from '@supabase/supabase-js'

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
      
      // Check if Supabase is configured
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://placeholder.supabase.co') {
        console.warn('Supabase not configured, returning empty data for sales by year chart')
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
          .not('TREE_DESCR', 'eq', 'Employee Appreciation')
          .not('TREE_DESCR', 'eq', 'Shipped To')

        // Apply filters
        if (filters.year && filters.year !== 'All') {
          const startDate = `${filters.year}-01-01`
          const endDate = `${filters.year}-12-31`
          query = query.gte('INV_DATE', startDate).lte('INV_DATE', endDate)
        }

        if (filters.customer && filters.customer !== 'All') {
          query = query.eq('NAME', filters.customer)
        }

        if (filters.category && filters.category !== 'All') {
          query = query.eq('TREE_DESCR', filters.category)
        }

        const { data: records, error } = await query

        if (error) {
          console.error('Error fetching sales data:', error)
          setData([])
          setLoading(false)
          return
        }

        // Process data by month
        const monthlyData: { [key: string]: number } = {}
        
        records?.forEach(record => {
          if (record.INV_DATE) {
            const date = new Date(record.INV_DATE)
            const month = date.toLocaleDateString('en-US', { month: 'long' })
            const amount = parseFloat(record.TOTAL || '0') || 0
            
            if (monthlyData[month]) {
              monthlyData[month] += amount
            } else {
              monthlyData[month] = amount
            }
          }
        })

        // Convert to array and sort by month
        const monthOrder = ['January', 'February', 'March', 'April', 'May', 'June', 
                           'July', 'August', 'September', 'October', 'November', 'December']
        
        const processedData = monthOrder
          .filter(month => monthlyData[month] > 0)
          .map(month => ({
            month,
            amount: monthlyData[month] / 1000000 // Convert to millions
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