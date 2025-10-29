'use client'

import { useState, useEffect } from 'react'
import { clientCSVDataSource } from '@/utils/clientCSVDataSource'

interface MonthlySalesDataTableProps {
  filters: {
    year: string
    customer: string
    category: string
  }
}

interface MonthlyTableRow {
  year: string
  ytdSales: number
  totalSales: number
  invoiceCount: number
  avgRevenuePerInvoice: number
  yoyGrowth: number
}

export default function MonthlySalesDataTable({ filters }: MonthlySalesDataTableProps) {
  const [data, setData] = useState<MonthlyTableRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMonthlyTableData()
  }, [filters])

  const fetchMonthlyTableData = async () => {
    try {
      setLoading(true)
      
      // Check if Supabase is properly configured
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://placeholder.supabase.co') {
        console.warn('Supabase not configured, returning sample data for monthly table')
        setData([
          {
            year: '2020',
            ytdSales: 17690.34,
            totalSales: 17690.34,
            invoiceCount: 13,
            avgRevenuePerInvoice: 1360.80,
            yoyGrowth: 0
          },
          {
            year: '2021',
            ytdSales: 1275015.29,
            totalSales: 1275015.29,
            invoiceCount: 414,
            avgRevenuePerInvoice: 3079.75,
            yoyGrowth: 7107.41
          },
          {
            year: '2022',
            ytdSales: 2135066.03,
            totalSales: 2135066.03,
            invoiceCount: 753,
            avgRevenuePerInvoice: 2835.41,
            yoyGrowth: 67.45
          },
          {
            year: '2023',
            ytdSales: 5169309.16,
            totalSales: 5169309.16,
            invoiceCount: 1281,
            avgRevenuePerInvoice: 4035.37,
            yoyGrowth: 142.11
          },
          {
            year: '2024',
            ytdSales: 9140676.68,
            totalSales: 9140676.68,
            invoiceCount: 2769,
            avgRevenuePerInvoice: 3301.08,
            yoyGrowth: 76.83
          },
          {
            year: '2025',
            ytdSales: 11792435.17,
            totalSales: 11792435.17,
            invoiceCount: 3223,
            avgRevenuePerInvoice: 3658.84,
            yoyGrowth: 29.01
          }
        ])
        setLoading(false)
        return
      }

      // Get data from CSV (cached after first load)
      const records = await clientCSVDataSource.getFilteredData(filters)

      console.log('Monthly table data fetched successfully:', records?.length, 'records')

      if (!records || records.length === 0) {
        setData([])
        setLoading(false)
        return
      }

      // Group by year
      const yearData: { [key: string]: any[] } = {}
      records.forEach(record => {
        const date = new Date(record.INV_DATE)
        const year = date.getFullYear().toString()
        if (!yearData[year]) {
          yearData[year] = []
        }
        yearData[year].push(record)
      })

      // Calculate metrics for each year
      const tableData: MonthlyTableRow[] = []
      const years = Object.keys(yearData).sort((a, b) => parseInt(a) - parseInt(b))

      years.forEach((year, index) => {
        const yearRecords = yearData[year]
        const totalSales = yearRecords.reduce((sum, record) => {
          const total = parseFloat(record.TOTAL) || 0
          return sum + total
        }, 0)

        const invoiceCount = yearRecords.length
        const avgRevenuePerInvoice = invoiceCount > 0 ? totalSales / invoiceCount : 0

        // Calculate YoY Growth
        let yoyGrowth = 0
        if (index > 0) {
          const previousYear = years[index - 1]
          const previousYearData = yearData[previousYear]
          const previousYearSales = previousYearData.reduce((sum, record) => {
            const total = parseFloat(record.TOTAL) || 0
            return sum + total
          }, 0)
          
          if (previousYearSales > 0) {
            yoyGrowth = ((totalSales - previousYearSales) / previousYearSales) * 100
          }
        }

        tableData.push({
          year,
          ytdSales: totalSales,
          totalSales,
          invoiceCount,
          avgRevenuePerInvoice,
          yoyGrowth
        })
      })

      // Add total row
      const totalYtdSales = tableData.reduce((sum, row) => sum + row.ytdSales, 0)
      const totalSales = tableData.reduce((sum, row) => sum + row.totalSales, 0)
      const totalInvoiceCount = tableData.reduce((sum, row) => sum + row.invoiceCount, 0)
      const totalAvgRevenuePerInvoice = totalInvoiceCount > 0 ? totalSales / totalInvoiceCount : 0
      const overallYoyGrowth = tableData.length > 0 ? tableData[tableData.length - 1].yoyGrowth : 0

      tableData.push({
        year: 'Total',
        ytdSales: totalYtdSales,
        totalSales: totalSales,
        invoiceCount: totalInvoiceCount,
        avgRevenuePerInvoice: totalAvgRevenuePerInvoice,
        yoyGrowth: overallYoyGrowth
      })

      setData(tableData)

    } catch (error) {
      console.error('Error calculating monthly table data:', error)
      setData([])
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

  const formatPercentage = (num: number) => {
    return `${num.toFixed(2)}%`
  }

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="space-y-4">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="text-left py-3 px-4 font-semibold text-gray-700 border-r border-gray-200">Year</th>
            <th className="text-right py-3 px-4 font-semibold text-gray-700 border-r border-gray-200">YTD Sales</th>
            <th className="text-right py-3 px-4 font-semibold text-gray-700 border-r border-gray-200">Total Sales</th>
            <th className="text-right py-3 px-4 font-semibold text-gray-700 border-r border-gray-200">Invoice Count</th>
            <th className="text-right py-3 px-4 font-semibold text-gray-700 border-r border-gray-200">Avg Revenue per Invoice</th>
            <th className="text-right py-3 px-4 font-semibold text-gray-700">YoY Growth %</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr 
              key={row.year}
              className={`border-b border-gray-100 hover:bg-gray-50 ${
                row.year === 'Total' ? 'bg-blue-50 font-semibold' : ''
              }`}
            >
              <td className="py-3 px-4 border-r border-gray-200">
                <span className={`font-medium ${row.year === 'Total' ? 'text-blue-900' : 'text-gray-900'}`}>
                  {row.year}
                </span>
              </td>
              <td className="py-3 px-4 text-right border-r border-gray-200">
                <span className={`${row.year === 'Total' ? 'text-blue-900 font-semibold' : 'text-gray-900'}`}>
                  {formatCurrency(row.ytdSales)}
                </span>
              </td>
              <td className="py-3 px-4 text-right border-r border-gray-200">
                <span className={`${row.year === 'Total' ? 'text-blue-900 font-semibold' : 'text-gray-900'}`}>
                  {formatCurrency(row.totalSales)}
                </span>
              </td>
              <td className="py-3 px-4 text-right border-r border-gray-200">
                <span className={`${row.year === 'Total' ? 'text-blue-900 font-semibold' : 'text-gray-900'}`}>
                  {formatNumber(row.invoiceCount)}
                </span>
              </td>
              <td className="py-3 px-4 text-right border-r border-gray-200">
                <span className={`${row.year === 'Total' ? 'text-blue-900 font-semibold' : 'text-gray-900'}`}>
                  {formatCurrency(row.avgRevenuePerInvoice)}
                </span>
              </td>
              <td className="py-3 px-4 text-right">
                <span className={`${row.year === 'Total' ? 'text-blue-900 font-semibold' : 'text-gray-900'}`}>
                  {row.yoyGrowth > 0 ? formatPercentage(row.yoyGrowth) : '-'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
