'use client'

import { useState } from 'react'
import { clientCSVDataSource } from '@/utils/clientCSVDataSource'

export default function ClientTestPage() {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<{
    totalRecords?: number;
    sample?: any[];
    summary?: any;
    filtered2024?: number;
  } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const testClientDecompression = async () => {
    setLoading(true)
    setError(null)
    
    try {
      console.log('🧪 Testing client-side decompression...')
      
      // Test loading data from blob storage
      const records = await clientCSVDataSource.getData()
      console.log(`✅ Successfully loaded ${records.length} records`)
      
      // Get a sample of the data
      const sample = records.slice(0, 5)
      
      // Get data summary
      const summary = await clientCSVDataSource.getDataSummary()
      
      setData({
        totalRecords: records.length,
        sample,
        summary
      })
      
    } catch (err) {
      console.error('❌ Error testing client decompression:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const testFilteredData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      console.log('🔍 Testing filtered data...')
      
      // Test with year filter
      const filteredData = await clientCSVDataSource.getFilteredData({ year: '2024' })
      console.log(`✅ Filtered data for 2024: ${filteredData.length} records`)
      
      setData(prev => ({
        ...prev,
        filtered2024: filteredData.length
      }))
      
    } catch (err) {
      console.error('❌ Error testing filtered data:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Client-Side Decompression Test
        </h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Actions</h2>
          <div className="space-x-4">
            <button
              onClick={testClientDecompression}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Testing...' : 'Test Client Decompression'}
            </button>
            
            <button
              onClick={testFilteredData}
              disabled={loading}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Testing...' : 'Test Filtered Data'}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <h3 className="text-red-800 font-semibold">Error</h3>
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {data && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Test Results</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Data Summary</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Total Records:</span> {data.totalRecords?.toLocaleString()}</p>
                  {data.filtered2024 && (
                    <p><span className="font-medium">2024 Records:</span> {data.filtered2024.toLocaleString()}</p>
                  )}
                  {data.summary && (
                    <>
                      <p><span className="font-medium">Total Amount:</span> ${data.summary.totalAmount?.toLocaleString()}</p>
                      <p><span className="font-medium">Date Range:</span> {data.summary.dateRange?.min} to {data.summary.dateRange?.max}</p>
                      <p><span className="font-medium">Categories:</span> {Object.keys(data.summary.categories || {}).length}</p>
                      <p><span className="font-medium">Customers:</span> {Object.keys(data.summary.customers || {}).length}</p>
                    </>
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Sample Records</h3>
                <div className="space-y-2 text-sm max-h-64 overflow-y-auto">
                  {data.sample?.map((record: any, index: number) => (
                    <div key={index} className="border-l-2 border-blue-200 pl-3">
                      <p><span className="font-medium">Date:</span> {record.INV_DATE}</p>
                      <p><span className="font-medium">Customer:</span> {record.NAME}</p>
                      <p><span className="font-medium">Category:</span> {record.TREE_DESCR}</p>
                      <p><span className="font-medium">Amount:</span> ${record.TOTAL}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
