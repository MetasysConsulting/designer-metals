'use client'

import SalesChart from '@/components/SalesChart'
import YTDChart from '@/components/YTDChart'
import SalesDetailsTable from '@/components/SalesDetailsTable'

interface PrintableDashboardProps {
  filters: any
}

export default function PrintableDashboard({ filters }: PrintableDashboardProps) {
  return (
    <div className="print-dashboard" style={{
      width: '100%',
      maxWidth: '8.5in',
      margin: '0 auto',
      padding: '0.5in',
      backgroundColor: 'white',
      color: '#000',
      fontFamily: 'Arial, sans-serif',
      fontSize: '12px',
      lineHeight: '1.4'
    }}>
      {/* Header */}
      <div style={{
        textAlign: 'center',
        marginBottom: '20px',
        borderBottom: '2px solid #333',
        paddingBottom: '15px'
      }}>
        <img 
          src="/Designer Metals Logo.png" 
          alt="Designer Metals Logo" 
          style={{
            height: '60px',
            marginBottom: '10px'
          }}
        />
        <h1 style={{
          fontSize: '24px',
          fontWeight: 'bold',
          margin: '0 0 5px 0',
          color: '#000'
        }}>
          Sales Dashboard Report
        </h1>
        <p style={{
          fontSize: '14px',
          margin: '0',
          color: '#666'
        }}>
          Generated: {new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </p>
        <div style={{
          fontSize: '12px',
          marginTop: '8px',
          color: '#666'
        }}>
          Filters: Year: {filters.year} | Customer: {filters.customer} | Category: {filters.category}
        </div>
      </div>

      {/* Charts Section - Single Column Layout */}
      <div style={{ marginBottom: '20px' }}>
        {/* Monthly Sales Chart */}
        <div style={{
          backgroundColor: '#fff',
          border: '1px solid #ddd',
          borderRadius: '4px',
          marginBottom: '15px',
          padding: '15px',
          pageBreakInside: 'avoid'
        }}>
          <h2 style={{
            fontSize: '18px',
            fontWeight: 'bold',
            margin: '0 0 10px 0',
            color: '#000'
          }}>
            Total Sales - Monthly View
          </h2>
          <div style={{
            height: '300px',
            width: '100%'
          }}>
            <SalesChart filters={filters} />
          </div>
        </div>

        {/* YTD Sales Chart */}
        <div style={{
          backgroundColor: '#fff',
          border: '1px solid #ddd',
          borderRadius: '4px',
          marginBottom: '15px',
          padding: '15px',
          pageBreakInside: 'avoid'
        }}>
          <h2 style={{
            fontSize: '18px',
            fontWeight: 'bold',
            margin: '0 0 10px 0',
            color: '#000'
          }}>
            Total Sales
          </h2>
          <div style={{
            height: '300px',
            width: '100%'
          }}>
            <YTDChart filters={filters} />
          </div>
        </div>
      </div>

      {/* Sales Details Table */}
      <div style={{
        backgroundColor: '#fff',
        border: '1px solid #ddd',
        borderRadius: '4px',
        padding: '15px',
        pageBreakInside: 'avoid'
      }}>
        <h2 style={{
          fontSize: '18px',
          fontWeight: 'bold',
          margin: '0 0 10px 0',
          color: '#000'
        }}>
          Sales Performance Details
        </h2>
        <div style={{ overflow: 'visible' }}>
          <SalesDetailsTable filters={filters} />
        </div>
      </div>

      {/* Footer */}
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
  )
}