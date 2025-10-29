'use client'

import { useState, useEffect } from 'react'
import ReactECharts from 'echarts-for-react'
import { supabase } from '@/lib/supabase'

interface LineData {
  year: string
  amount: number
}

export default function CategoryLineChart({ filters }: { filters: any }) {
  const [data, setData] = useState<LineData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchLineData()
  }, [filters])

  const fetchLineData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Check if Supabase is properly configured
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://placeholder.supabase.co') {
        console.warn('Supabase not configured, returning empty data for line chart')
        setData([])
        return
      }

      let query = supabase
        .from('ARINV')
        .select('TOTAL, INV_DATE')
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

      const { data: rawData, error } = await query

      if (error) {
        console.error('Error fetching line chart data:', error)
        throw new Error(`Failed to fetch line chart data: ${error.message}`)
      }


      // Group by year and sum totals
      const yearlyData: { [key: string]: number } = {}

      rawData?.forEach(record => {
        if (record.INV_DATE && record.TOTAL) {
          const date = new Date(record.INV_DATE)
          if (!isNaN(date.getTime())) {
            const year = date.getFullYear().toString()
            const total = parseFloat(record.TOTAL) || 0
            yearlyData[year] = (yearlyData[year] || 0) + total
          }
        }
      })

      // Convert to array and sort by year
      const transformedData = Object.entries(yearlyData)
        .map(([year, amount]) => ({ year, amount }))
        .sort((a, b) => a.year.localeCompare(b.year))

      setData(transformedData)
    } catch (err) {
      setError('Failed to load line chart data')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const option = {
    title: {
      text: 'Amount Over Time',
      left: 'center',
      textStyle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1f2937'
      }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      },
      backgroundColor: '#ffffff',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      textStyle: {
        color: '#374151'
      },
      formatter: function(params: any) {
        const value = params[0].value
        return `${params[0].name}<br/><strong>Amount: $${(value / 1000000).toFixed(2)}M</strong>`
      }
    },
    grid: {
      left: '8%',
      right: '4%',
      bottom: '8%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: data.map(item => item.year),
      name: 'Year',
      nameLocation: 'middle',
      nameGap: 30,
      nameTextStyle: {
        color: '#6b7280',
        fontSize: 14,
        fontWeight: 'bold'
      },
      axisLabel: {
        color: '#6b7280',
        fontSize: 12
      },
      axisLine: {
        lineStyle: {
          color: '#e5e7eb'
        }
      }
    },
    yAxis: {
      type: 'value',
      name: 'AMOUNT($)',
      nameLocation: 'middle',
      nameGap: 50,
      nameTextStyle: {
        color: '#6b7280',
        fontSize: 14,
        fontWeight: 'bold'
      },
      axisLabel: {
        formatter: function(value: number) {
          return `${(value / 1000000).toFixed(1)}M`
        },
        color: '#6b7280',
        fontSize: 12
      },
      axisLine: {
        lineStyle: {
          color: '#e5e7eb'
        }
      },
      splitLine: {
        lineStyle: {
          color: '#f3f4f6'
        }
      }
    },
    series: [
      {
        name: 'Amount',
        type: 'line',
        data: data.map(item => item.amount),
        smooth: true,
        lineStyle: {
          color: '#3b82f6',
          width: 3
        },
        itemStyle: {
          color: '#3b82f6',
          borderWidth: 2,
          borderColor: '#ffffff'
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(59, 130, 246, 0.3)' },
              { offset: 1, color: 'rgba(59, 130, 246, 0.05)' }
            ]
          }
        },
        emphasis: {
          itemStyle: {
            color: '#1d4ed8',
            borderWidth: 3,
            shadowBlur: 10,
            shadowColor: 'rgba(59, 130, 246, 0.5)'
          }
        }
      }
    ]
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error}</p>
      </div>
    )
  }

  return (
    <div className="w-full h-full">
      <ReactECharts 
        option={option} 
        style={{ height: '100%', width: '100%' }}
        opts={{ renderer: 'canvas' }}
      />
    </div>
  )
}
