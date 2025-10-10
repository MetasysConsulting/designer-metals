'use client'

import { forwardRef } from 'react'
import SalesChart from './SalesChart'
import YTDChart from './YTDChart'
import SalesDetailsTable from './SalesDetailsTable'

interface PrintableDashboardProps {
  filters: any
}

const PrintableDashboard = forwardRef<HTMLDivElement, PrintableDashboardProps>(
  ({ filters }, ref) => {
    return (
      <div ref={ref} className="printable-dashboard" style={{ position: 'absolute', left: '-9999px', top: '-9999px', width: '210mm', minHeight: '297mm' }}>
        <style jsx>{`
          .printable-dashboard {
            font-family: 'Segoe UI', Arial, sans-serif;
            color: #1f2937;
            background: white;
            padding: 20px;
          }
          
          .print-header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 20px;
          }
          
          .print-title {
            font-size: 28px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 8px;
          }
          
          .print-subtitle {
            font-size: 16px;
            color: #6b7280;
            margin: 4px 0;
          }
          
          .filters-info {
            background: #f9fafb;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #3b82f6;
          }
          
          .charts-section {
            display: flex;
            flex-direction: column;
            gap: 30px;
            margin: 30px 0;
          }
          
          .chart-container {
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 20px;
            page-break-inside: avoid;
            break-inside: avoid;
          }
          
          .chart-title {
            font-size: 20px;
            font-weight: bold;
            margin-bottom: 15px;
            color: #1f2937;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 8px;
          }
          
          .chart-content {
            height: 400px;
            width: 100%;
          }
          
          .table-container {
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 20px;
            margin: 30px 0;
            page-break-inside: avoid;
            break-inside: avoid;
          }
          
          .table-title {
            font-size: 20px;
            font-weight: bold;
            margin-bottom: 15px;
            color: #1f2937;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 8px;
          }
          
          .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 12px;
            color: #6b7280;
            border-top: 1px solid #e5e7eb;
            padding-top: 20px;
          }
          
          @media print {
            .printable-dashboard {
              padding: 0;
              margin: 0;
            }
            
            .chart-container,
            .table-container {
              page-break-inside: avoid;
              break-inside: avoid;
              margin-bottom: 20px;
            }
            
            .charts-section {
              display: block;
            }
            
            .chart-content {
              height: 300px;
            }
          }
        `}</style>
        
        <div className="print-header">
          <div className="print-title">Sales Dashboard Overview</div>
          <div className="print-subtitle">Designer Metals - Sales Analytics Report</div>
          <div className="print-subtitle">Generated: {new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}</div>
        </div>
        
        <div className="filters-info">
          <strong>Report Filters Applied:</strong><br />
          • Year: {filters.year}<br />
          • Customer: {filters.customer}<br />
          • Category: {filters.category}
        </div>
        
        <div className="charts-section">
          <div className="chart-container">
            <div className="chart-title">Total Sales - Monthly View</div>
            <div className="chart-content">
              <SalesChart filters={filters} />
            </div>
          </div>
          
          <div className="chart-container">
            <div className="chart-title">Total Sales - Year to Date</div>
            <div className="chart-content">
              <YTDChart filters={filters} />
            </div>
          </div>
        </div>
        
        <div className="table-container">
          <div className="table-title">Sales Performance Details</div>
          <SalesDetailsTable filters={filters} />
        </div>
        
        <div className="footer">
          <p>This report was generated automatically by the Designer Metals Sales Dashboard System.</p>
          <p>For questions or additional information, please contact the Analytics Team.</p>
        </div>
      </div>
    )
  }
)

PrintableDashboard.displayName = 'PrintableDashboard'

export default PrintableDashboard
