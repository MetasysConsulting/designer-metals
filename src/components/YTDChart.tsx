'use client'

import { useState, useEffect } from 'react'
import ReactECharts from 'echarts-for-react'
import { fetchYearlySalesData } from '@/lib/arinv'
import ChartWrapper from './ChartWrapper'

interface YTDData {
  year: string
  amount: number
}

export default function YTDChart({ filters }: { filters: any }) {
  const [data, setData] = useState<YTDData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchYTDData()
  }, [filters])

  const fetchYTDData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const realData = await fetchYearlySalesData(filters)
      setData(realData)
    } catch (err) {
      setError('Failed to load YTD data')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const option = {
    title: {
      text: 'YTD Sales by Year',
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
        return `${params[0].name}<br/><strong>YTD Sales: $${(value / 1000000).toFixed(1)}M</strong>`
      }
    },
    grid: {
      left: '15%',
      right: '4%',
      bottom: '3%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      name: 'YTD Sales',
      nameLocation: 'middle',
      nameGap: 30,
      nameTextStyle: {
        color: '#6b7280',
        fontSize: 12
      },
      axisLabel: {
        formatter: function(value: number) {
          return `${(value / 1000000).toFixed(0)}M`
        },
        color: '#6b7280'
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
      data: data.map(item => item.year),
      axisLabel: {
        color: '#6b7280'
      },
      axisLine: {
        lineStyle: {
          color: '#e5e7eb'
        }
      }
    },
    series: [
      {
        name: 'YTD Sales',
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
    <ChartWrapper className="w-full h-full">
      <ReactECharts 
        option={option} 
        style={{ height: '100%', width: '100%' }}
        opts={{ renderer: 'canvas' }}
      />
    </ChartWrapper>
  )
}
