'use client'

import { useEffect, useRef, useState } from 'react'
import * as echarts from 'echarts'
import { createClient } from '@supabase/supabase-js'

interface MonthlySalesChartProps {
  filters: {
    year: string
    customer: string
    category: string
  }
}

interface MonthlyData {
  month: string
  year: string
  amount: number
}

export default function MonthlySalesChart({ filters }: MonthlySalesChartProps) {
  const chartRef = useRef<HTMLDivElement>(null)
  const [data, setData] = useState<MonthlyData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      
      // Check if Supabase is configured
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://placeholder.supabase.co') {
        console.warn('Supabase not configured, returning empty data for monthly sales chart')
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
          console.error('Error fetching monthly sales data:', error)
          setData([])
          setLoading(false)
          return
        }

        // Process data by month and year
        const monthlyData: { [key: string]: { [key: string]: number } } = {}
        
        records?.forEach(record => {
          if (record.INV_DATE) {
            const date = new Date(record.INV_DATE)
            const month = date.toLocaleDateString('en-US', { month: 'long' })
            const year = date.getFullYear().toString()
            const amount = parseFloat(record.TOTAL || '0') || 0
            
            if (!monthlyData[month]) {
              monthlyData[month] = {}
            }
            
            if (monthlyData[month][year]) {
              monthlyData[month][year] += amount
            } else {
              monthlyData[month][year] = amount
            }
          }
        })

        // Convert to array format
        const processedData: MonthlyData[] = []
        Object.keys(monthlyData).forEach(month => {
          Object.keys(monthlyData[month]).forEach(year => {
            processedData.push({
              month,
              year,
              amount: monthlyData[month][year] / 1000 // Convert to thousands
            })
          })
        })

        setData(processedData)
      } catch (error) {
        console.error('Error processing monthly sales data:', error)
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
    
    // Get unique months and years
    const months = [...new Set(data.map(item => item.month))]
    const years = [...new Set(data.map(item => item.year))].sort()
    
    // Generate colors for each year
    const colors = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf']

    // Prepare series data for each year
    const series = years.map((year, index) => ({
      name: year,
      type: 'bar',
      data: months.map(month => {
        const item = data.find(d => d.month === month && d.year === year)
        return item ? item.amount : 0
      }),
      itemStyle: {
        color: colors[index % colors.length]
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
              result += `${param.seriesName}: $${(param.value / 1000).toFixed(0)}K<br/>`
            }
          })
          return result
        }
      },
      legend: {
        data: years,
        top: 'top',
        textStyle: {
          color: '#6b7280',
          fontSize: 11
        }
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
        name: 'Total Sales (Thousands)',
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
            return `$${value}K`
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