'use client'

import { useState, useEffect } from 'react'
import ReactECharts from 'echarts-for-react'
import { fetchMonthlySalesData } from '@/lib/arinv'

interface SalesData {
  month: string
  amount: number
}

export default function SalesChart({ filters }: { filters: any }) {
  const [data, setData] = useState<SalesData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchSalesData()
  }, [filters])

  const fetchSalesData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Fetch real data from Supabase
      const realData = await fetchMonthlySalesData(filters)
      setData(realData)
    } catch (err) {
      setError('Failed to load sales data')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const option = {
    title: {
      text: 'Total Sales - Monthly View',
      left: 'center',
      textStyle: {
        fontSize: 20,
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
      left: '8%',
      right: '4%',
      bottom: '8%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: data.map(item => item.month),
      axisLabel: {
        rotate: 45,
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
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: '#fbbf24' },
              { offset: 1, color: '#f59e0b' }
            ]
          }
        },
        label: {
          show: true,
          position: 'top',
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