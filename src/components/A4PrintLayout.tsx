'use client'

import { forwardRef } from 'react'
import SalesChart from './SalesChart'
import YTDChart from './YTDChart'
import SalesDetailsTable from './SalesDetailsTable'

interface A4PrintLayoutProps {
  filters: any
}

const A4PrintLayout = forwardRef<HTMLDivElement, A4PrintLayoutProps>(
  ({ filters }, ref) => {
    return (
      <div 
        ref={ref}
        className="a4-print-layout"
        style={{
          width: '210mm',
          height: '297mm',
          background: 'white',
          padding: '10mm',
          boxSizing: 'border-box',
          fontFamily: 'Arial, sans-serif',
          fontSize: '12px',
          lineHeight: '1.4',
          color: '#333'
        }}
      >
        <style jsx>{`
          .a4-print-layout {
            width: 210mm !important;
            height: 297mm !important;
            background: white !important;
            padding: 10mm !important;
            box-sizing: border-box !important;
            font-family: Arial, sans-serif !important;
            font-size: 12px !important;
            line-height: 1.4 !important;
            color: #333 !important;
            margin: 0 !important;
            overflow: hidden !important;
          }
          
          .a4-print-layout * {
            box-sizing: border-box !important;
          }
          
          .a4-print-layout h1 {
            font-size: 24px !important;
            font-weight: bold !important;
            color: #1a1a1a !important;
            margin: 0 0 8px 0 !important;
            text-align: center !important;
          }
          
          .a4-print-layout h2 {
            font-size: 16px !important;
            font-weight: bold !important;
            color: #333 !important;
            margin: 0 0 6px 0 !important;
          }
          
          .a4-print-layout h3 {
            font-size: 14px !important;
            font-weight: bold !important;
            color: #555 !important;
            margin: 0 0 4px 0 !important;
          }
          
          .a4-print-layout p {
            font-size: 12px !important;
            color: #666 !important;
            margin: 0 0 4px 0 !important;
          }
          
          .a4-print-layout .header {
            text-align: center !important;
            margin-bottom: 8mm !important;
            border-bottom: 2px solid #333 !important;
            padding-bottom: 4mm !important;
          }
          
          .a4-print-layout .logo {
            height: 40px !important;
            margin-bottom: 4px !important;
          }
          
          .a4-print-layout .charts-grid {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            gap: 6mm !important;
            margin-bottom: 8mm !important;
            height: 80mm !important;
          }
          
          .a4-print-layout .chart-container {
            background: white !important;
            border: 1px solid #ddd !important;
            border-radius: 4px !important;
            padding: 4mm !important;
            height: 100% !important;
            display: flex !important;
            flex-direction: column !important;
          }
          
          .a4-print-layout .chart-title {
            font-size: 14px !important;
            font-weight: bold !important;
            color: #333 !important;
            margin-bottom: 4mm !important;
            text-align: center !important;
          }
          
          .a4-print-layout .chart-wrapper {
            flex: 1 !important;
            height: 60mm !important;
            min-height: 60mm !important;
            max-height: 60mm !important;
          }
          
          .a4-print-layout .table-container {
            background: white !important;
            border: 1px solid #ddd !important;
            border-radius: 4px !important;
            padding: 4mm !important;
            height: 120mm !important;
            overflow: hidden !important;
          }
          
          .a4-print-layout .table-title {
            font-size: 14px !important;
            font-weight: bold !important;
            color: #333 !important;
            margin-bottom: 4mm !important;
            text-align: center !important;
          }
          
          .a4-print-layout table {
            width: 100% !important;
            border-collapse: collapse !important;
            font-size: 10px !important;
            height: 100% !important;
          }
          
          .a4-print-layout th {
            background-color: #f5f5f5 !important;
            border: 1px solid #ddd !important;
            padding: 2mm !important;
            text-align: left !important;
            font-weight: bold !important;
            font-size: 10px !important;
          }
          
          .a4-print-layout td {
            border: 1px solid #ddd !important;
            padding: 1.5mm !important;
            font-size: 9px !important;
          }
          
          .a4-print-layout .chart-container canvas {
            width: 100% !important;
            height: 100% !important;
            max-width: 100% !important;
            max-height: 100% !important;
          }
          
          .a4-print-layout .echarts-for-react {
            width: 100% !important;
            height: 100% !important;
          }
          
          /* Print-specific styles */
          @media print {
            .a4-print-layout {
              width: 210mm !important;
              height: 297mm !important;
              margin: 0 !important;
              padding: 10mm !important;
              background: white !important;
              color: black !important;
              font-size: 12px !important;
            }
            
            .a4-print-layout * {
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            
            .a4-print-layout .chart-container {
              page-break-inside: avoid !important;
              break-inside: avoid !important;
            }
            
            .a4-print-layout .table-container {
              page-break-inside: avoid !important;
              break-inside: avoid !important;
            }
          }
        `}</style>
        
        {/* Header */}
        <div className="header">
          <img 
            src="/Designer Metals Logo.png" 
            alt="Designer Metals Logo" 
            className="logo"
          />
          <h1>Sales Dashboard Overview</h1>
          <p>Comprehensive sales analytics and performance insights</p>
        </div>

        {/* Charts Grid */}
        <div className="charts-grid">
          {/* Monthly Sales Chart */}
          <div className="chart-container">
            <h2 className="chart-title">Total Sales - Monthly View</h2>
            <div className="chart-wrapper">
              <SalesChart filters={filters} />
            </div>
          </div>
          
          {/* YTD Sales Chart */}
          <div className="chart-container">
            <h2 className="chart-title">Total Sales</h2>
            <div className="chart-wrapper">
              <YTDChart filters={filters} />
            </div>
          </div>
        </div>

        {/* Sales Details Table */}
        <div className="table-container">
          <h2 className="table-title">Sales Performance Details</h2>
          <SalesDetailsTable filters={filters} />
        </div>
      </div>
    )
  }
)

A4PrintLayout.displayName = 'A4PrintLayout'

export default A4PrintLayout
