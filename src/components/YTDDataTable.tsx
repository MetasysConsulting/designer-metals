'use client'

import { useState, useEffect } from 'react'
import { clientCSVDataSource } from '@/utils/clientCSVDataSource'

interface YTDDataTableProps {
  filters: {
    year: string
    customer: string
    category: string
  }
}

interface YTDTableRow {
  year: string
  ytdSales: number
  yoyGrowth: number
  invoiceCount: number
  avgRevenuePerMonth: number
  categoryContribution: number
}

export default function YTDDataTable({ filters }: YTDDataTableProps) {
  const [data, setData] = useState<YTDTableRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchYTDTableData()
  }, [filters])

  const fetchYTDTableData = async () => {
    try {
      setLoading(true)
      
      // Check if Supabase is properly configured
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://placeholder.supabase.co') {
        console.warn('Supabase not configured, returning sample data for YTD table')
        setData([
          {
            year: '2025',
            ytdSales: 11792435.17,
            yoyGrowth: 29.01,
            invoiceCount: 3223,
            avgRevenuePerMonth: 1179243.52,
            categoryContribution: 1.00
          },
          {
            year: '2024',
            ytdSales: 9140676.68,
            yoyGrowth: 76.83,
            invoiceCount: 2769,
            avgRevenuePerMonth: 914067.67,
            categoryContribution: 1.00
          },
          {
            year: '2023',
            ytdSales: 5169309.16,
            yoyGrowth: 142.11,
            invoiceCount: 1281,
            avgRevenuePerMonth: 516930.92,
            categoryContribution: 1.00
          },
          {
            year: '2022',
            ytdSales: 2135066.03,
            yoyGrowth: 67.45,
            invoiceCount: 753,
            avgRevenuePerMonth: 213506.60,
            categoryContribution: 1.00
          },
          {
            year: '2021',
            ytdSales: 1275015.29,
            yoyGrowth: 7107.41,
            invoiceCount: 414,
            avgRevenuePerMonth: 127501.53,
            categoryContribution: 1.00
          },
          {
            year: '2020',
            ytdSales: 17690.34,
            yoyGrowth: 0,
            invoiceCount: 13,
            avgRevenuePerMonth: 1769.03,
            categoryContribution: 1.00
          }
        ])
        setLoading(false)
        return
      }

      // Get data from CSV (cached after first load)
      const records = await clientCSVDataSource.getFilteredData(filters)
      
      console.log('YTD table data from CSV:', records.length, 'records')

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
      const tableData: YTDTableRow[] = []
      const years = Object.keys(yearData).sort((a, b) => parseInt(b) - parseInt(a))

      years.forEach((year, index) => {
        const yearRecords = yearData[year]
        const ytdSales = yearRecords.reduce((sum, record) => {
          const total = parseFloat(record.TOTAL) || 0
          return sum + total
        }, 0)

        const invoiceCount = yearRecords.length
        const avgRevenuePerMonth = ytdSales / 12

        // Calculate YoY Growth
        let yoyGrowth = 0
        if (index < years.length - 1) {
          const previousYear = years[index + 1]
          const previousYearData = yearData[previousYear]
          const previousYearSales = previousYearData.reduce((sum, record) => {
            const total = parseFloat(record.TOTAL) || 0
            return sum + total
          }, 0)
          
          if (previousYearSales > 0) {
            yoyGrowth = ((ytdSales - previousYearSales) / previousYearSales) * 100
          }
        }

        tableData.push({
          year,
          ytdSales,
          yoyGrowth,
          invoiceCount,
          avgRevenuePerMonth,
          categoryContribution: 1.00
        })
      })

      // Add total row
      const totalYtdSales = tableData.reduce((sum, row) => sum + row.ytdSales, 0)
      const totalInvoiceCount = tableData.reduce((sum, row) => sum + row.invoiceCount, 0)
      const totalAvgRevenuePerMonth = totalYtdSales / 12
      const overallYoyGrowth = tableData.length > 0 ? tableData[0].yoyGrowth : 0

      tableData.push({
        year: 'Total',
        ytdSales: totalYtdSales,
        yoyGrowth: overallYoyGrowth,
        invoiceCount: totalInvoiceCount,
        avgRevenuePerMonth: totalAvgRevenuePerMonth,
        categoryContribution: 1.00
      })

      setData(tableData)

    } catch (error) {
      console.error('Error calculating YTD table data:', error)
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
            <th className="text-right py-3 px-4 font-semibold text-gray-700 border-r border-gray-200">YoY Growth %</th>
            <th className="text-right py-3 px-4 font-semibold text-gray-700 border-r border-gray-200">Invoice Count</th>
            <th className="text-right py-3 px-4 font-semibold text-gray-700 border-r border-gray-200">Avg Revenue per Month</th>
            <th className="text-right py-3 px-4 font-semibold text-gray-700">Category Contribution %</th>
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
                  {row.yoyGrowth > 0 ? formatPercentage(row.yoyGrowth) : '-'}
                </span>
              </td>
              <td className="py-3 px-4 text-right border-r border-gray-200">
                <span className={`${row.year === 'Total' ? 'text-blue-900 font-semibold' : 'text-gray-900'}`}>
                  {formatNumber(row.invoiceCount)}
                </span>
              </td>
              <td className="py-3 px-4 text-right border-r border-gray-200">
                <span className={`${row.year === 'Total' ? 'text-blue-900 font-semibold' : 'text-gray-900'}`}>
                  {formatCurrency(row.avgRevenuePerMonth)}
                </span>
              </td>
              <td className="py-3 px-4 text-right">
                <span className={`${row.year === 'Total' ? 'text-blue-900 font-semibold' : 'text-gray-900'}`}>
                  {row.categoryContribution.toFixed(2)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
