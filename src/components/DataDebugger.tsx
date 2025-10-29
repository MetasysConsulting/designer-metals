'use client'

import { useState, useEffect } from 'react'
import { verifyChartData, logChartComparison, ChartDataSummary } from '@/utils/dataVerification'

interface DataDebuggerProps {
  filters: any
  chartName: string
  chartData: any[]
}

export default function DataDebugger({ filters, chartName, chartData }: DataDebuggerProps) {
  const [dbSummary, setDbSummary] = useState<ChartDataSummary | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    verifyData()
  }, [filters])

  const verifyData = async () => {
    try {
      setLoading(true)
      setError(null)
      const summary = await verifyChartData(filters)
      setDbSummary(summary)
      
      // Log comparison to console
      logChartComparison(chartName, chartData, summary)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      console.error('Data verification error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
          <span className="text-blue-800">Verifying data...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
        <div className="text-red-800">
          <strong>Data Verification Error:</strong> {error}
        </div>
      </div>
    )
  }

  if (!dbSummary) return null

  // Calculate chart totals
  const chartTotal = chartData.reduce((sum, item) => {
    if (typeof item === 'object' && item.value !== undefined) {
      return sum + (item.value || 0)
    } else if (typeof item === 'object' && item.amount !== undefined) {
      return sum + (item.amount || 0)
    } else if (typeof item === 'number') {
      return sum + item
    }
    return sum
  }, 0)

  const difference = Math.abs(chartTotal - dbSummary.totalAmount)
  const percentageDiff = dbSummary.totalAmount > 0 ? (difference / dbSummary.totalAmount) * 100 : 0

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-800">🔍 Data Verification: {chartName}</h3>
        <button
          onClick={verifyData}
          className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
        >
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Chart Data */}
        <div className="bg-white p-3 rounded border">
          <h4 className="font-semibold text-gray-700 mb-2">📊 Chart Data</h4>
          <div className="space-y-1 text-sm">
            <div>Data Points: <span className="font-mono">{chartData.length}</span></div>
            <div>Total Amount: <span className="font-mono">${chartTotal.toLocaleString()}</span></div>
            <div>Sample Data:</div>
            <div className="ml-2 text-xs text-gray-600 max-h-20 overflow-y-auto">
              {chartData.slice(0, 3).map((item, index) => (
                <div key={index} className="truncate">
                  {JSON.stringify(item).substring(0, 50)}...
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Database Data */}
        <div className="bg-white p-3 rounded border">
          <h4 className="font-semibold text-gray-700 mb-2">🗄️ Database Data</h4>
          <div className="space-y-1 text-sm">
            <div>Records: <span className="font-mono">{dbSummary.totalRecords}</span></div>
            <div>Total Amount: <span className="font-mono">${dbSummary.totalAmount.toLocaleString()}</span></div>
            <div>Date Range: <span className="font-mono text-xs">{dbSummary.dateRange.min} to {dbSummary.dateRange.max}</span></div>
            <div>Categories: <span className="font-mono">{Object.keys(dbSummary.categories).length}</span></div>
            <div>Customers: <span className="font-mono">{Object.keys(dbSummary.customers).length}</span></div>
          </div>
        </div>
      </div>

      {/* Comparison */}
      <div className="mt-3 p-3 bg-white rounded border">
        <h4 className="font-semibold text-gray-700 mb-2">📈 Comparison</h4>
        <div className="flex items-center justify-between">
          <div className="text-sm">
            <div>Difference: <span className="font-mono">${difference.toLocaleString()}</span></div>
            <div>Percentage: <span className="font-mono">{percentageDiff.toFixed(2)}%</span></div>
          </div>
          <div className="text-right">
            {percentageDiff < 1 ? (
              <span className="text-green-600 font-semibold">✅ Data Matches</span>
            ) : percentageDiff < 5 ? (
              <span className="text-yellow-600 font-semibold">⚠️ Small Difference</span>
            ) : (
              <span className="text-red-600 font-semibold">❌ Significant Difference</span>
            )}
          </div>
        </div>
      </div>

      {/* Top Categories */}
      <div className="mt-3 p-3 bg-white rounded border">
        <h4 className="font-semibold text-gray-700 mb-2">🏷️ Top Categories (Database)</h4>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {Object.entries(dbSummary.categories).slice(0, 6).map(([category, amount]) => (
            <div key={category} className="flex justify-between">
              <span className="truncate">{category}</span>
              <span className="font-mono">${amount.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
