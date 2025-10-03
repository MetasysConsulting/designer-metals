'use client'

import { useState, useEffect } from 'react'
import ReactECharts from 'echarts-for-react'
import { supabase } from '@/lib/supabase'

interface CategoryBarData {
  category: string
  amount: number
}

export default function CategoryBarChart({ filters }: { filters: any }) {
  const [data, setData] = useState<CategoryBarData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchCategoryBarData()
  }, [filters])

  const fetchCategoryBarData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Check if Supabase is properly configured
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://placeholder.supabase.co') {
        console.warn('Supabase not configured, returning empty data for category bar chart')
        setData([])
        return
      }

      let query = supabase
        .from('ARINV')
        .select('TOTAL, TREE_DESCR')
        .not('TOTAL', 'is', null)
        .not('TREE_DESCR', 'is', null)

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
        console.error('Error fetching category bar data:', error)
        throw new Error(`Failed to fetch category bar data: ${error.message}`)
      }

      console.log('Category bar data fetched successfully:', rawData?.length, 'records')

      // Group by category and sum totals
      const categoryData: { [key: string]: number } = {}

      rawData?.forEach(record => {
        if (record.TREE_DESCR && record.TOTAL) {
          const category = record.TREE_DESCR
          const total = parseFloat(record.TOTAL) || 0
          categoryData[category] = (categoryData[category] || 0) + total
        }
      })

      // Convert to array and sort by amount (descending)
      const transformedData = Object.entries(categoryData)
        .map(([category, amount]) => ({ category, amount }))
        .sort((a, b) => b.amount - a.amount)

      setData(transformedData)
    } catch (err) {
      setError('Failed to load category bar data')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const option = {
    title: {
      text: 'Sales by Category',
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
        type: 'shadow'
      },
      backgroundColor: '#ffffff',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      textStyle: {
        color: '#374151'
      },
      formatter: function(params: any) {
        const value = params[0].value
        return `${params[0].name}<br/><strong>Amount: $${(value / 1000000).toFixed(1)}M</strong>`
      }
    },
    grid: {
      left: '25%',
      right: '10%',
      bottom: '8%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      name: 'USD($)',
      nameLocation: 'middle',
      nameGap: 30,
      nameTextStyle: {
        color: '#6b7280',
        fontSize: 14,
        fontWeight: 'bold'
      },
      axisLabel: {
        formatter: function(value: number) {
          return `${(value / 1000000).toFixed(0)}M`
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
    yAxis: {
      type: 'category',
      data: data.map(item => item.category),
      name: 'Category',
      nameLocation: 'start',
      nameGap: 20,
      nameTextStyle: {
        color: '#6b7280',
        fontSize: 12,
        fontWeight: 'bold'
      },
      axisLabel: {
        color: '#6b7280',
        fontSize: 10,
        margin: 12,
        width: 80,
        overflow: 'truncate'
      },
      axisLine: {
        lineStyle: {
          color: '#e5e7eb'
        }
      }
    },
    series: [
      {
        name: 'Sales',
        type: 'bar',
        data: data.map(item => item.amount),
        itemStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 1,
            y2: 0,
            colorStops: [
              { offset: 0, color: '#fbbf24' },
              { offset: 1, color: '#f59e0b' }
            ]
          }
        },
        label: {
          show: true,
          position: 'right',
          formatter: function(params: any) {
            return `${(params.value / 1000000).toFixed(1)}M`
          },
          color: '#374151',
          fontSize: 11
        },
        emphasis: {
          itemStyle: {
            color: '#d97706'
          }
        }
      }
    ]
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600"></div>
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
