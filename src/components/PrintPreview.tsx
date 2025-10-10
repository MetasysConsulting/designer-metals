'use client'

import { useState, useRef } from 'react'
import { useReactToPrint } from 'react-to-print'
import SalesChart from '@/components/SalesChart'
import YTDChart from '@/components/YTDChart'
import SalesDetailsTable from '@/components/SalesDetailsTable'

interface PrintPreviewProps {
  filters: any
  onClose: () => void
}

export default function PrintPreview({ filters, onClose }: PrintPreviewProps) {
  const printRef = useRef<HTMLDivElement>(null)
  const [chart1Height, setChart1Height] = useState(300)
  const [chart2Height, setChart2Height] = useState(300)
  const [tableHeight, setTableHeight] = useState(400)

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Designer-Metals-Sales-Dashboard-${new Date().toISOString().split('T')[0]}`,
    pageStyle: `
      @page {
        size: A4;
        margin: 0.5in;
      }
      @media print {
        body { -webkit-print-color-adjust: exact; }
        .print-controls { display: none !important; }
        .page-boundary { box-shadow: none !important; }
      }
    `
  })

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold">Print Preview - Adjust Layout</h2>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Print
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>

        {/* Print Preview Content */}
        <div className="p-6">
          <div 
            ref={printRef}
            className="mx-auto bg-white shadow-lg print-preview-page"
            style={{
              width: '8.5in',
              minHeight: '11in',
              padding: '0.5in',
              position: 'relative',
              border: '1px solid #ccc'
            }}
          >
            {/* Page Header */}
            <div style={{
              textAlign: 'center',
              marginBottom: '20px',
              borderBottom: '2px solid #333',
              paddingBottom: '15px'
            }}>
              <img 
                src="/Designer Metals Logo.png" 
                alt="Designer Metals Logo" 
                style={{ height: '50px', marginBottom: '10px' }}
              />
              <h1 style={{
                fontSize: '20px',
                fontWeight: 'bold',
                margin: '0 0 5px 0',
                color: '#000'
              }}>
                Sales Dashboard Report
              </h1>
              <p style={{
                fontSize: '12px',
                margin: '0',
                color: '#666'
              }}>
                Generated: {new Date().toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>

            {/* Charts Section */}
            <div style={{ marginBottom: '20px' }}>
              {/* Chart 1 */}
              <div style={{
                backgroundColor: '#fff',
                border: '1px solid #ddd',
                borderRadius: '4px',
                marginBottom: '15px',
                padding: '15px',
                position: 'relative'
              }}>
                <div className="print-controls" style={{
                  position: 'absolute',
                  top: '5px',
                  right: '5px',
                  display: 'flex',
                  gap: '5px',
                  zIndex: 10
                }}>
                  <button
                    onClick={() => setChart1Height(Math.max(200, chart1Height - 20))}
                    className="w-6 h-6 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                    title="Decrease Height"
                  >
                    -
                  </button>
                  <button
                    onClick={() => setChart1Height(Math.min(500, chart1Height + 20))}
                    className="w-6 h-6 bg-green-500 text-white text-xs rounded hover:bg-green-600"
                    title="Increase Height"
                  >
                    +
                  </button>
                </div>
                <h2 style={{
                  fontSize: '16px',
                  fontWeight: 'bold',
                  margin: '0 0 10px 0',
                  color: '#000'
                }}>
                  Total Sales - Monthly View
                </h2>
                <div style={{ height: `${chart1Height}px`, width: '100%' }}>
                  <SalesChart filters={filters} />
                </div>
              </div>

              {/* Chart 2 */}
              <div style={{
                backgroundColor: '#fff',
                border: '1px solid #ddd',
                borderRadius: '4px',
                marginBottom: '15px',
                padding: '15px',
                position: 'relative'
              }}>
                <div className="print-controls" style={{
                  position: 'absolute',
                  top: '5px',
                  right: '5px',
                  display: 'flex',
                  gap: '5px',
                  zIndex: 10
                }}>
                  <button
                    onClick={() => setChart2Height(Math.max(200, chart2Height - 20))}
                    className="w-6 h-6 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                    title="Decrease Height"
                  >
                    -
                  </button>
                  <button
                    onClick={() => setChart2Height(Math.min(500, chart2Height + 20))}
                    className="w-6 h-6 bg-green-500 text-white text-xs rounded hover:bg-green-600"
                    title="Increase Height"
                  >
                    +
                  </button>
                </div>
                <h2 style={{
                  fontSize: '16px',
                  fontWeight: 'bold',
                  margin: '0 0 10px 0',
                  color: '#000'
                }}>
                  Total Sales
                </h2>
                <div style={{ height: `${chart2Height}px`, width: '100%' }}>
                  <YTDChart filters={filters} />
                </div>
              </div>
            </div>

            {/* Table Section */}
            <div style={{
              backgroundColor: '#fff',
              border: '1px solid #ddd',
              borderRadius: '4px',
              padding: '15px',
              position: 'relative'
            }}>
              <div className="print-controls" style={{
                position: 'absolute',
                top: '5px',
                right: '5px',
                display: 'flex',
                gap: '5px',
                zIndex: 10
              }}>
                <button
                  onClick={() => setTableHeight(Math.max(200, tableHeight - 20))}
                  className="w-6 h-6 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                  title="Decrease Height"
                >
                  -
                </button>
                <button
                  onClick={() => setTableHeight(Math.min(600, tableHeight + 20))}
                  className="w-6 h-6 bg-green-500 text-white text-xs rounded hover:bg-green-600"
                  title="Increase Height"
                >
                  +
                </button>
              </div>
              <h2 style={{
                fontSize: '16px',
                fontWeight: 'bold',
                margin: '0 0 10px 0',
                color: '#000'
              }}>
                Sales Performance Details
              </h2>
              <div style={{ height: `${tableHeight}px`, overflow: 'auto' }}>
                <SalesDetailsTable filters={filters} />
              </div>
            </div>

            {/* Page Footer */}
            <div style={{
              marginTop: '20px',
              paddingTop: '15px',
              borderTop: '1px solid #ddd',
              textAlign: 'center',
              fontSize: '10px',
              color: '#666'
            }}>
              Designer Metals - Sales Analytics Dashboard
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">📋 Print Layout Instructions</h3>
            <ul className="text-blue-800 space-y-1 text-sm">
              <li>• <strong>Adjust heights:</strong> Use the +/- buttons to resize charts and tables</li>
              <li>• <strong>Page boundaries:</strong> The white box shows your A4 page size</li>
              <li>• <strong>Preview:</strong> This is exactly how your print will look</li>
              <li>• <strong>Print:</strong> Click Print when satisfied with the layout</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
