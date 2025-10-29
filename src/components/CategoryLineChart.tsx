'use client'

import { useState, useEffect } from 'react'
import ReactECharts from 'echarts-for-react'
import { fetchYearlySalesData } from '@/lib/csvDataSource'

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
      
      // Fetch data from CSV
      const realData = await fetchYearlySalesData(filters)
      
      setData(realData)
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
