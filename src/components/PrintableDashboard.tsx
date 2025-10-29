'use client'

import { forwardRef } from 'react'

interface PrintableDashboardProps {
  children: React.ReactNode
}

const PrintableDashboard = forwardRef<HTMLDivElement, PrintableDashboardProps>(
  ({ children }, ref) => {
    return (
      <div ref={ref} className="printable-dashboard">
        <style jsx>{`
          .printable-dashboard {
            background: white;
            color: black;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.4;
            padding: 20px;
            max-width: 100%;
          }
          
          .printable-dashboard * {
            box-sizing: border-box;
          }
          
          .printable-dashboard h1,
          .printable-dashboard h2,
          .printable-dashboard h3 {
            margin: 0 0 16px 0;
            font-weight: 600;
          }
          
          .printable-dashboard h1 {
            font-size: 24px;
            color: #1f2937;
          }
          
          .printable-dashboard h2 {
            font-size: 20px;
            color: #374151;
          }
          
          .printable-dashboard h3 {
            font-size: 18px;
            color: #4b5563;
          }
          
          .printable-dashboard p {
            margin: 0 0 12px 0;
            color: #6b7280;
          }
          
          .printable-dashboard .chart-container {
            width: 100%;
            height: 300px;
            margin: 16px 0;
            page-break-inside: avoid;
            break-inside: avoid;
          }
          
          .printable-dashboard .chart-container canvas {
            width: 100% !important;
            height: 100% !important;
            max-width: 100% !important;
            object-fit: contain;
          }
          
          .printable-dashboard .grid {
            display: grid;
            gap: 16px;
            margin: 16px 0;
          }
          
          .printable-dashboard .grid-cols-2 {
            grid-template-columns: 1fr 1fr;
          }
          
          .printable-dashboard .bg-white {
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 16px;
            margin: 8px 0;
            page-break-inside: avoid;
            break-inside: avoid;
          }
          
          .printable-dashboard .text-center {
            text-align: center;
          }
          
          .printable-dashboard .mb-4 {
            margin-bottom: 16px;
          }
          
          .printable-dashboard .mb-6 {
            margin-bottom: 24px;
          }
          
          .printable-dashboard .mb-8 {
            margin-bottom: 32px;
          }
          
          .printable-dashboard table {
            width: 100%;
            border-collapse: collapse;
            margin: 16px 0;
            page-break-inside: avoid;
            break-inside: avoid;
          }
          
          .printable-dashboard th,
          .printable-dashboard td {
            border: 1px solid #d1d5db;
            padding: 8px 12px;
            text-align: left;
            font-size: 14px;
          }
          
          .printable-dashboard th {
            background-color: #f9fafb;
            font-weight: 600;
            color: #374151;
          }
          
          .printable-dashboard td {
            color: #6b7280;
          }
          
          .printable-dashboard .font-bold {
            font-weight: 700;
          }
          
          .printable-dashboard .font-semibold {
            font-weight: 600;
          }
          
          .printable-dashboard .text-gray-900 {
            color: #111827;
          }
          
          .printable-dashboard .text-gray-800 {
            color: #1f2937;
          }
          
          .printable-dashboard .text-gray-700 {
            color: #374151;
          }
          
          .printable-dashboard .text-gray-600 {
            color: #4b5563;
          }
          
          .printable-dashboard .text-gray-500 {
            color: #6b7280;
          }
          
          .printable-dashboard .text-sm {
            font-size: 14px;
          }
          
          .printable-dashboard .text-lg {
            font-size: 18px;
          }
          
          .printable-dashboard .text-xl {
            font-size: 20px;
          }
          
          .printable-dashboard .text-2xl {
            font-size: 24px;
          }
          
          .printable-dashboard .text-3xl {
            font-size: 30px;
          }
          
          .printable-dashboard .text-4xl {
            font-size: 36px;
          }
          
          /* Hide elements that shouldn't print */
          .printable-dashboard .no-print,
          .printable-dashboard button,
          .printable-dashboard .export-buttons {
            display: none !important;
          }
          
          /* Ensure proper spacing */
          .printable-dashboard .space-y-4 > * + * {
            margin-top: 16px;
          }
          
          .printable-dashboard .space-y-6 > * + * {
            margin-top: 24px;
          }
          
          .printable-dashboard .space-y-8 > * + * {
            margin-top: 32px;
          }
        `}</style>
        {children}
      </div>
    )
  }
)

PrintableDashboard.displayName = 'PrintableDashboard'

export default PrintableDashboard