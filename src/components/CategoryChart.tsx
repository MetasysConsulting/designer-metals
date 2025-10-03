'use client'

import { useState, useEffect } from 'react'
import ReactECharts from 'echarts-for-react'
import { fetchCategorySalesData } from '@/lib/arinv'

interface CategoryData {
  name: string
  value: number
}

export default function CategoryChart({ filters }: { filters: any }) {
  const [data, setData] = useState<CategoryData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchCategoryData()
  }, [filters])

  const fetchCategoryData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Fetch real data from Supabase
      const realData = await fetchCategorySalesData(filters)
      setData(realData)
    } catch (err) {
      setError('Failed to load category data')
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
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1f2937'
      }
    },
    tooltip: {
      trigger: 'item',
      backgroundColor: '#ffffff',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      textStyle: {
        color: '#374151'
      },
      formatter: function(params: any) {
        const value = params.value
        const percent = params.percent
        return `${params.name}<br/><strong>Amount: $${(value / 1000000).toFixed(1)}M</strong><br/>Percentage: ${percent}%`
      }
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      top: 'middle',
      textStyle: {
        color: '#6b7280',
        fontSize: 11
      }
    },
    series: [
      {
        name: 'Sales by Category',
        type: 'pie',
        radius: ['35%', '65%'],
        center: ['65%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 8,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold',
            color: '#1f2937'
          }
        },
        labelLine: {
          show: false
        },
        data: data.map((item, index) => ({
          value: item.value,
          name: item.name,
          itemStyle: {
            color: [
              '#3b82f6', // Blue
              '#10b981', // Green
              '#f59e0b', // Amber
              '#ef4444', // Red
              '#8b5cf6', // Purple
              '#06b6d4', // Cyan
              '#f97316', // Orange
              '#84cc16'  // Lime
            ][index % 8]
          }
        }))
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
