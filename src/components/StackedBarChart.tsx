'use client'

import { useState, useEffect } from 'react'
import ReactECharts from 'echarts-for-react'
import { supabase } from '@/lib/supabase'

interface StackedBarData {
  year: string
  categories: { [key: string]: number }
}

export default function StackedBarChart({ filters }: { filters: any }) {
  const [data, setData] = useState<StackedBarData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchStackedBarData()
  }, [filters])

  const fetchStackedBarData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Check if Supabase is properly configured
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://placeholder.supabase.co') {
        console.warn('Supabase not configured, returning empty data for stacked bar chart')
        setData([])
        return
      }

      let query = supabase
        .from('ARINV')
        .select('TOTAL, INV_DATE, TREE_DESCR')
        .not('TOTAL', 'is', null)
        .not('INV_DATE', 'is', null)
        .not('TREE_DESCR', 'is', null)
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
        console.error('Error fetching stacked bar data:', error)
        throw new Error(`Failed to fetch stacked bar data: ${error.message}`)
      }


      // Group by year and category
      const yearlyData: { [key: string]: { [key: string]: number } } = {}

      rawData?.forEach(record => {
        if (record.INV_DATE && record.TOTAL && record.TREE_DESCR) {
          const date = new Date(record.INV_DATE)
          if (!isNaN(date.getTime())) {
            const year = date.getFullYear().toString()
            const category = record.TREE_DESCR
            const total = parseFloat(record.TOTAL) || 0

            if (!yearlyData[year]) {
              yearlyData[year] = {}
            }
            yearlyData[year][category] = (yearlyData[year][category] || 0) + total
          }
        }
      })

      // Convert to array format
      const years = Object.keys(yearlyData).sort()
      const transformedData = years.map(year => ({
        year,
        categories: yearlyData[year]
      }))

      setData(transformedData)
    } catch (err) {
      setError('Failed to load stacked bar data')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Get all unique categories
  const allCategories = [...new Set(
    data.flatMap(item => Object.keys(item.categories))
  )].sort()

  // Define colors for categories (matching Power BI colors)
  const categoryColors: { [key: string]: string } = {
    'Coil': '#ff7f0e',
    'Shed': '#ffbb78',
    'Contractor': '#9467bd',
    'Carports': '#1f77b4',
    'Standard': '#17becf',
    'LuxGuard': '#2ca02c',
    'Wholesale': '#d62728',
    'Carports Down P...': '#8c564b',
  }

  const option = {
    title: {
      text: 'Sales by Category and Year',
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
        let result = `${params[0].name}<br/>`
        params.forEach((param: any) => {
          const value = param.value
          result += `${param.marker} ${param.seriesName}: $${(value / 1000000).toFixed(1)}M<br/>`
        })
        return result
      }
    },
    legend: {
      data: allCategories,
      top: 40,
      textStyle: {
        fontSize: 12
      }
    },
    grid: {
      left: '8%',
      right: '4%',
      bottom: '8%',
      top: '20%',
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
        color: '#6b7280'
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
      nameGap: 60,
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
        fontSize: 12,
        margin: 8
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
    series: allCategories.map(category => ({
      name: category,
      type: 'bar',
      data: data.map(item => item.categories[category] || 0),
      itemStyle: {
        color: categoryColors[category] || '#1f77b4'
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }))
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
