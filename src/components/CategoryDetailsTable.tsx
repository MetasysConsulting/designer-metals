'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface CategoryDetail {
  category: string
  monthlyData: { [key: string]: number }
  total: number
}

export default function CategoryDetailsTable({ filters }: { filters: any }) {
  const [data, setData] = useState<CategoryDetail[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [grandTotal, setGrandTotal] = useState(0)

  useEffect(() => {
    fetchCategoryDetails()
  }, [filters])

  const fetchCategoryDetails = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Check if Supabase is properly configured
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://placeholder.supabase.co') {
        console.warn('Supabase not configured, returning empty data for category details')
        setData([])
        setGrandTotal(0)
        return
      }

      let query = supabase
        .from('ARINV')
        .select('TOTAL, INV_DATE, TREE_DESCR')
        .not('TOTAL', 'is', null)
        .not('INV_DATE', 'is', null)
        .not('TREE_DESCR', 'is', null)
        .not('TREE_DESCR', 'in', ['Employee Appreciation', 'Shipped To'])

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
        console.error('Error fetching category details:', error)
        throw new Error(`Failed to fetch category details: ${error.message}`)
      }

      console.log('Category details data fetched successfully:', rawData?.length, 'records')

      // Group by category and month
      const categoryData: { [key: string]: { [key: string]: number } } = {}

      rawData?.forEach(record => {
        if (record.INV_DATE && record.TOTAL && record.TREE_DESCR) {
          const date = new Date(record.INV_DATE)
          if (!isNaN(date.getTime())) {
            const category = record.TREE_DESCR
            const month = date.toLocaleString('default', { month: 'long' })
            const total = parseFloat(record.TOTAL) || 0

            if (!categoryData[category]) {
              categoryData[category] = {}
            }
            categoryData[category][month] = (categoryData[category][month] || 0) + total
          }
        }
      })

      // Convert to array format
      const months = ['January', 'February', 'March', 'April', 'May', 'June',
                      'July', 'August', 'September', 'October', 'November', 'December']

      const transformedData = Object.entries(categoryData).map(([category, monthlyData]) => {
        const total = Object.values(monthlyData).reduce((sum, amount) => sum + amount, 0)
        return {
          category,
          monthlyData,
          total
        }
      }).sort((a, b) => b.total - a.total)

      // Calculate grand total
      const calculatedGrandTotal = transformedData.reduce((sum, item) => sum + item.total, 0)

      setData(transformedData)
      setGrandTotal(calculatedGrandTotal)
    } catch (err) {
      setError('Failed to load category details')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num)
  }

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-6 bg-gray-200 rounded mb-4"></div>
        <div className="space-y-3">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="h-4 bg-gray-200 rounded"></div>
          ))}
        </div>
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

  const months = ['January', 'February', 'March', 'April', 'May', 'June',
                  'July', 'August', 'September', 'October', 'November', 'December']

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
            {months.map(month => (
              <th key={month} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {month}
              </th>
            ))}
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((row, index) => (
            <tr key={row.category} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {row.category}
              </td>
              {months.map(month => (
                <td key={month} className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {row.monthlyData[month] ? formatCurrency(row.monthlyData[month]) : '-'}
                </td>
              ))}
              <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                {formatCurrency(row.total)}
              </td>
            </tr>
          ))}
          {/* Grand Total Row */}
          <tr className="bg-gray-100 font-bold">
            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
              Total
            </td>
            {months.map(month => {
              const monthTotal = data.reduce((sum, row) => sum + (row.monthlyData[month] || 0), 0)
              return (
                <td key={month} className="px-4 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                  {monthTotal > 0 ? formatCurrency(monthTotal) : '-'}
                </td>
              )
            })}
            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
              {formatCurrency(grandTotal)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}
