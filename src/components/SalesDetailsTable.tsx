'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface SalesDetail {
  category: string
  invoice: string
  date: string
  subtotal: number
  taxAmount: number
  total: number
  totalPaid: number
  customerName: string
  description: string
}

export default function SalesDetailsTable({ filters }: { filters: any }) {
  const [data, setData] = useState<SalesDetail[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totals, setTotals] = useState({
    subtotal: 0,
    taxAmount: 0,
    total: 0,
    totalPaid: 0
  })

  useEffect(() => {
    fetchSalesDetails()
  }, [filters])

  const fetchSalesDetails = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Check if Supabase is properly configured
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://placeholder.supabase.co') {
        console.warn('Supabase not configured, returning empty data for sales details')
        setData([])
        setTotals({ subtotal: 0, taxAmount: 0, total: 0, totalPaid: 0 })
        return
      }

      let query = supabase
        .from('ARINV')
        .select('TREE_DESCR, INVOICE, INV_DATE, SUBTOTAL, TAX, TOTAL, TOTAL_PAID, NAME, DESCR')
        .not('TOTAL', 'is', null)
        .not('INV_DATE', 'is', null)
        .not('TREE_DESCR', 'in', ['Employee Appreciation', 'Shipped To'])
        .order('INV_DATE', { ascending: false })
        .limit(100) // Limit for performance

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
        console.error('Error fetching sales details:', error)
        throw new Error(`Failed to fetch sales details: ${error.message}`)
      }

      console.log('Sales details data fetched successfully:', rawData?.length, 'records')

      // Transform data
      const transformedData: SalesDetail[] = rawData?.map(record => ({
        category: record.TREE_DESCR || 'N/A',
        invoice: record.INVOICE || 'N/A',
        date: record.INV_DATE ? new Date(record.INV_DATE).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }) : 'N/A',
        subtotal: parseFloat(record.SUBTOTAL) || 0,
        taxAmount: parseFloat(record.TAX) || 0,
        total: parseFloat(record.TOTAL) || 0,
        totalPaid: parseFloat(record.TOTAL_PAID) || 0,
        customerName: record.NAME || 'N/A',
        description: record.DESCR || ''
      })) || []

      // Calculate totals
      const calculatedTotals = transformedData.reduce((acc, item) => ({
        subtotal: acc.subtotal + item.subtotal,
        taxAmount: acc.taxAmount + item.taxAmount,
        total: acc.total + item.total,
        totalPaid: acc.totalPaid + item.totalPaid
      }), { subtotal: 0, taxAmount: 0, total: 0, totalPaid: 0 })

      setData(transformedData)
      setTotals(calculatedTotals)
    } catch (err) {
      setError('Failed to load sales details')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
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

  return (
    <div className="overflow-x-auto max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50 sticky top-0 z-10">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CATEGORY</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">INVOICE</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">DATE</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SUBTOTAL</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">TAX AMOUNT</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">TOTAL</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">TOTAL PAID</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CUSTOMER NAME</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">DESCRIPTION</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((row, index) => (
            <tr key={`${row.invoice}-${index}`} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {row.category}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {row.invoice}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {row.date}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {formatCurrency(row.subtotal)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {formatCurrency(row.taxAmount)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {formatCurrency(row.total)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {formatCurrency(row.totalPaid)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {row.customerName}
              </td>
              <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                {row.description}
              </td>
            </tr>
          ))}
          {/* Total Row */}
          <tr className="bg-gray-50 font-semibold">
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
              Total
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              -
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              -
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {formatCurrency(totals.subtotal)}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {formatCurrency(totals.taxAmount)}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {formatCurrency(totals.total)}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {formatCurrency(totals.totalPaid)}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              -
            </td>
            <td className="px-6 py-4 text-sm text-gray-900">
              -
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}
