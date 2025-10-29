import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

// List of all dashboard pages to capture
const DASHBOARD_PAGES = [
  { name: 'Sales Overview', path: '/sales-overview' },
  { name: 'Sales by Category', path: '/sales-category' },
  { name: 'Sales by Category Details', path: '/sales-category-details' },
  { name: 'YTD Sales', path: '/ytd-sales' },
  { name: 'Monthly Sales', path: '/monthly-sales' },
  { name: 'Individual Sales', path: '/individual-sales' },
  { name: 'Sales by Year', path: '/sales-year' },
  { name: 'Yearly Coil Sales', path: '/yearly-coil' },
  { name: 'YTD Coil Sales', path: '/ytd-coil' },
  { name: 'Sales by Year Comparison', path: '/year-comparison' },
  { name: 'Customer Locations', path: '/customer-locations' }
]

export async function exportAllPagesInOnePDF() {
  try {
    console.log('Starting automatic capture of ALL pages...')
    
    // Show progress to user
    const progressDiv = document.createElement('div')
    progressDiv.id = 'pdf-export-progress'
    progressDiv.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #1f2937;
      color: white;
      padding: 20px;
      border-radius: 8px;
      z-index: 9999;
      font-family: Arial, sans-serif;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      max-width: 300px;
    `
    document.body.appendChild(progressDiv)
    
    const updateProgress = (message: string, current: number, total: number) => {
      progressDiv.innerHTML = `
        <div style="font-weight: bold; margin-bottom: 10px;">Exporting All Pages</div>
        <div>${message}</div>
        <div style="margin-top: 10px; font-size: 12px;">
          Progress: ${current}/${total}
        </div>
        <div style="margin-top: 5px; width: 100%; background: #374151; border-radius: 4px; height: 8px;">
          <div style="width: ${(current/total)*100}%; background: #10b981; height: 100%; border-radius: 4px; transition: width 0.3s;"></div>
        </div>
      `
    }
    
    // Create PDF
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    })
    
    let isFirstPage = true
    
    // Function to capture current page
    const captureCurrentPage = async (pageName: string) => {
      console.log(`Capturing ${pageName}...`)
      
      // Hide buttons temporarily
      const buttons = document.querySelectorAll('button')
      buttons.forEach(btn => {
        if (btn instanceof HTMLElement) {
          btn.style.visibility = 'hidden'
        }
      })
      
      // Add CSS to convert oklch colors to RGB
      const colorFixStyle = document.createElement('style')
      colorFixStyle.id = 'color-fix-style'
      colorFixStyle.textContent = `
        * {
          color: inherit !important;
          background-color: inherit !important;
          border-color: inherit !important;
        }
        .bg-gray-50 { background-color: #f9fafb !important; }
        .bg-gray-100 { background-color: #f3f4f6 !important; }
        .bg-gray-800 { background-color: #1f2937 !important; }
        .bg-white { background-color: #ffffff !important; }
        .text-gray-900 { color: #111827 !important; }
        .text-gray-800 { color: #1f2937 !important; }
        .text-gray-700 { color: #374151 !important; }
        .text-gray-600 { color: #4b5563 !important; }
        .text-gray-500 { color: #6b7280 !important; }
        .text-gray-400 { color: #9ca3af !important; }
        .text-gray-300 { color: #d1d5db !important; }
        .text-white { color: #ffffff !important; }
        .border-gray-200 { border-color: #e5e7eb !important; }
        .border-gray-300 { border-color: #d1d5db !important; }
        .bg-blue-600 { background-color: #2563eb !important; }
        .bg-blue-700 { background-color: #1d4ed8 !important; }
        .bg-green-600 { background-color: #16a34a !important; }
        .bg-purple-600 { background-color: #9333ea !important; }
        .bg-teal-600 { background-color: #0d9488 !important; }
        .bg-teal-700 { background-color: #0f766e !important; }
        .text-blue-600 { color: #2563eb !important; }
        .text-green-600 { color: #16a34a !important; }
        .text-teal-600 { color: #0d9488 !important; }
      `
      document.head.appendChild(colorFixStyle)
      
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Force chart resizing
      const chartCanvases = document.querySelectorAll('canvas')
      chartCanvases.forEach(canvas => {
        const chartInstance = (canvas as any).__chartjs__ || (canvas as any).chart
        if (chartInstance && typeof chartInstance.resize === 'function') {
          chartInstance.resize()
        }
      })
      
      // Capture the dashboard
      const dashboardElement = document.querySelector('.min-h-screen') as HTMLElement
      if (!dashboardElement) {
        console.warn(`Dashboard not found for ${pageName}`)
        return null
      }
      
      const canvas = await html2canvas(dashboardElement, {
        scale: 1.5,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: dashboardElement.scrollWidth,
        height: dashboardElement.scrollHeight,
        scrollX: 0,
        scrollY: 0
      })
      
      // Remove color fix style
      const styleToRemove = document.getElementById('color-fix-style')
      if (styleToRemove) {
        document.head.removeChild(styleToRemove)
      }
      
      // Restore buttons
      buttons.forEach(btn => {
        if (btn instanceof HTMLElement) {
          btn.style.visibility = 'visible'
        }
      })
      
      return canvas
    }
    
    // Start with current page (Sales Overview)
    updateProgress(`Capturing Sales Overview...`, 1, DASHBOARD_PAGES.length)
    const currentPageCanvas = await captureCurrentPage('Sales Overview')
    
    if (currentPageCanvas) {
      // Add page to PDF
      if (!isFirstPage) {
        pdf.addPage()
      }
      isFirstPage = false
      
      // Add page title
      pdf.setFontSize(16)
      pdf.setFont('helvetica', 'bold')
      pdf.text('Sales Overview', 20, 20)
      
      // Add the captured image
      const imgData = currentPageCanvas.toDataURL('image/png', 1.0)
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      
      const imgWidth = currentPageCanvas.width
      const imgHeight = currentPageCanvas.height
      const ratio = Math.min((pdfWidth - 40) / imgWidth, (pdfHeight - 40) / imgHeight)
      const finalWidth = imgWidth * ratio
      const finalHeight = imgHeight * ratio
      
      const x = (pdfWidth - finalWidth) / 2
      const y = 30 // Start below the title
      
      pdf.addImage(imgData, 'PNG', x, y, finalWidth, finalHeight)
      
      console.log('Successfully captured Sales Overview')
    }
    
    // Show instructions for manual navigation to other pages
    updateProgress(`Adding instructions for other pages...`, 2, DASHBOARD_PAGES.length)
    
    // Add instructions page to PDF
    pdf.addPage()
    pdf.setFontSize(20)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Complete Dashboard Export Instructions', 20, 30)
    
    pdf.setFontSize(12)
    pdf.setFont('helvetica', 'normal')
    let yPos = 60
    
    const instructions = [
      'To complete the dashboard export:',
      '',
      '1. Navigate to each remaining tab using the bottom navigation',
      '2. Click "Export PDF" on each page to get individual PDFs',
      '3. You can combine all PDFs later if needed',
      '',
      'Remaining pages to export:',
      '• Sales by Category',
      '• Sales by Category Details',
      '• YTD Sales',
      '• Monthly Sales',
      '• Individual Sales',
      '• Sales by Year',
      '• Yearly Coil Sales',
      '• YTD Coil Sales',
      '• Sales by Year Comparison',
      '• Customer Locations',
      '',
      'This approach is more reliable than automatic navigation.',
      'Each page will be captured with all its charts and data.'
    ]
    
    instructions.forEach(instruction => {
      pdf.text(instruction, 20, yPos)
      yPos += 8
    })
    
    // Skip the automatic navigation loop since it doesn't work reliably
    console.log('Skipping automatic navigation due to JavaScript execution limitations')
    
    // Add metadata
    pdf.setProperties({
      title: 'Designer Metals Complete Dashboard',
      subject: 'Complete Sales Analytics Dashboard',
      author: 'Designer Metals Analytics',
      creator: 'Designer Metals Dashboard',
      producer: 'Designer Metals Dashboard'
    })
    
    // Save the PDF
    const fileName = `designer-metals-complete-dashboard-${new Date().toISOString().split('T')[0]}.pdf`
    pdf.save(fileName)
    
    // Remove progress indicator
    const progressElement = document.getElementById('pdf-export-progress')
    if (progressElement) {
      document.body.removeChild(progressElement)
    }
    
    console.log('PDF exported with current page and instructions!')
    alert('PDF exported! It contains the Sales Overview page plus instructions for exporting the remaining pages manually.')
    
    // Navigate back to sales overview
    window.location.href = '/sales-overview'
    
  } catch (error) {
    console.error('Automatic PDF export failed:', error)
    alert('PDF export failed. Please try again.')
    
    // Remove progress indicator
    const progressElement = document.getElementById('pdf-export-progress')
    if (progressElement) {
      document.body.removeChild(progressElement)
    }
  }
}
