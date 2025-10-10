'use client'

import { useState, useRef } from 'react'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
import { useReactToPrint } from 'react-to-print'
import SalesChart from '@/components/SalesChart'
import YTDChart from '@/components/YTDChart'
import SalesDetailsTable from '@/components/SalesDetailsTable'

interface ResizableDashboardProps {
  filters: any
}

export default function ResizableDashboard({ filters }: ResizableDashboardProps) {
  const printRef = useRef<HTMLDivElement>(null)
  const [isPrintMode, setIsPrintMode] = useState(false)

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
        .resize-handle { display: none !important; }
        .resize-controls { display: none !important; }
      }
    `
  })

  const togglePrintMode = () => {
    setIsPrintMode(!isPrintMode)
  }

  return (
    <div className="w-full min-h-screen bg-gray-50">
      {/* Header with Controls */}
      <div className="w-full bg-gray-50 py-6 px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <img 
              src="/Designer Metals Logo.png" 
              alt="Designer Metals Logo" 
              className="h-24 object-contain"
            />
          </div>
          
          <div className="flex items-center gap-8">
            {/* Print Mode Toggle */}
            <div className="flex items-center gap-3">
              <button
                onClick={togglePrintMode}
                className={`px-4 py-2 rounded-lg transition-colors font-medium flex items-center gap-2 text-sm ${
                  isPrintMode 
                    ? 'bg-orange-600 text-white hover:bg-orange-700' 
                    : 'bg-gray-600 text-white hover:bg-gray-700'
                }`}
                title="Toggle Print Layout Mode"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4a2 2 0 012-2h8.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V20a2 2 0 01-2 2H6a2 2 0 01-2-2v-4" />
                </svg>
                {isPrintMode ? 'Exit Print Mode' : 'Print Mode'}
              </button>
              
              <button
                onClick={handlePrint}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2 text-sm"
                title="Print Report"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Print
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-8" ref={printRef}>
        {/* Page Title */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Sales Dashboard Overview</h1>
          <p className="text-lg text-gray-600 mt-2">Comprehensive sales analytics and performance insights</p>
          {isPrintMode && (
            <div className="mt-4 p-4 bg-orange-100 border border-orange-300 rounded-lg">
              <p className="text-orange-800 font-medium">
                📄 Print Mode Active - Resize panels to fit your print layout, then click Print
              </p>
            </div>
          )}
        </div>

        {/* Resizable Charts Section */}
        <div className="mb-8">
          <PanelGroup direction="horizontal" className="min-h-[600px]">
            {/* Monthly Sales Chart */}
            <Panel defaultSize={50} minSize={30} maxSize={70}>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden h-full">
                <div className="p-6 h-full flex flex-col">
                  <h2 className="text-2xl font-semibold text-gray-800 mb-6">Total Sales - Monthly View</h2>
                  <div className="flex-1 w-full">
                    <SalesChart filters={filters} />
                  </div>
                </div>
              </div>
            </Panel>

            <PanelResizeHandle className="w-2 bg-gray-200 hover:bg-blue-400 transition-colors relative group">
              <div className="absolute inset-y-0 left-1/2 transform -translate-x-1/2 w-1 bg-blue-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-white border-2 border-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <svg className="w-3 h-3 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8 4a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1zM3 6a1 1 0 000 2h14a1 1 0 100-2H3zM3 10a1 1 0 100 2h14a1 1 0 100-2H3zM3 14a1 1 0 100 2h14a1 1 0 100-2H3z" />
                </svg>
              </div>
            </PanelResizeHandle>

            {/* YTD Sales Chart */}
            <Panel defaultSize={50} minSize={30} maxSize={70}>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden h-full">
                <div className="p-6 h-full flex flex-col">
                  <h2 className="text-2xl font-semibold text-gray-800 mb-6">Total Sales</h2>
                  <div className="flex-1 w-full">
                    <YTDChart filters={filters} />
                  </div>
                </div>
              </div>
            </Panel>
          </PanelGroup>
        </div>

        {/* Resizable Table Section */}
        <div className="mb-8">
          <PanelGroup direction="vertical" className="min-h-[400px]">
            <Panel defaultSize={100} minSize={40}>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full">
                <div className="p-6 h-full flex flex-col">
                  <h2 className="text-2xl font-semibold text-gray-800 mb-6">Sales Performance Details</h2>
                  <div className="flex-1 overflow-auto">
                    <SalesDetailsTable filters={filters} />
                  </div>
                </div>
              </div>
            </Panel>
          </PanelGroup>
        </div>

        {/* Print Mode Instructions */}
        {isPrintMode && (
          <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">📋 Print Layout Instructions</h3>
            <ul className="text-blue-800 space-y-2">
              <li>• <strong>Resize panels:</strong> Drag the resize handles between sections to adjust sizes</li>
              <li>• <strong>Chart proportions:</strong> Make charts larger or smaller to fit your print needs</li>
              <li>• <strong>Table height:</strong> Adjust the table section height as needed</li>
              <li>• <strong>Preview:</strong> Use your browser's print preview (Ctrl+P) to see how it will look</li>
              <li>• <strong>Print:</strong> Click the Print button when you're satisfied with the layout</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
