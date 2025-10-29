import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

export async function exportCurrentPageToPDF(pageName: string = 'Dashboard Page') {
  try {
    console.log(`Starting PDF export for ${pageName}...`)
    
    // Hide buttons temporarily
    const buttons = document.querySelectorAll('button')
    buttons.forEach(btn => {
      if (btn instanceof HTMLElement) {
        btn.style.visibility = 'hidden'
      }
    })
    
    // Add CSS to convert oklch colors to RGB before capture
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
      
      /* Chart-specific print styles */
      .chart-container {
        width: 100% !important;
        height: 300px !important;
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }
      
      .chart-container canvas {
        max-width: 100% !important;
        height: 100% !important;
        width: 100% !important;
        object-fit: contain !important;
      }
      
      .echarts-for-react {
        width: 100% !important;
        height: 100% !important;
      }
      
      .echarts-for-react canvas {
        width: 100% !important;
        height: 100% !important;
        max-width: 100% !important;
      }
    `
    document.head.appendChild(colorFixStyle)
    
    await new Promise(resolve => setTimeout(resolve, 100))
    
    // Force chart resizing before capture
    const chartCanvases = document.querySelectorAll('canvas')
    chartCanvases.forEach(canvas => {
      const chartInstance = (canvas as any).__chartjs__ || (canvas as any).chart
      if (chartInstance && typeof chartInstance.resize === 'function') {
        chartInstance.resize()
      }
    })
    
    // Capture the entire dashboard with all content
    const dashboardElement = document.querySelector('.min-h-screen') as HTMLElement
    if (!dashboardElement) {
      alert('Dashboard not found')
      return
    }
    
    console.log('Capturing full dashboard...')
    
    // Scroll to top to ensure we capture everything
    window.scrollTo(0, 0)
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Capture the entire dashboard including all charts
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
    
    console.log('Creating PDF...')
    
    // Create PDF
    const imgData = canvas.toDataURL('image/png', 1.0)
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    })
    
    // Get PDF dimensions
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = pdf.internal.pageSize.getHeight()
    
    // Calculate image dimensions to fit the page while maintaining aspect ratio
    const imgWidth = canvas.width
    const imgHeight = canvas.height
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight)
    const finalWidth = imgWidth * ratio
    const finalHeight = imgHeight * ratio
    
    // If the content is taller than the page, we'll need multiple pages
    if (finalHeight > pdfHeight) {
      console.log('Content is tall, creating multi-page PDF...')
      
      // Calculate how many pages we need
      const pagesNeeded = Math.ceil(finalHeight / pdfHeight)
      
      for (let i = 0; i < pagesNeeded; i++) {
        if (i > 0) {
          pdf.addPage()
        }
        
        // Calculate the y offset for this page
        const yOffset = -i * pdfHeight
        
        // Add the image to this page
        pdf.addImage(imgData, 'PNG', 0, yOffset, finalWidth, finalHeight)
      }
    } else {
      // Content fits on one page
      const x = (pdfWidth - finalWidth) / 2
      const y = (pdfHeight - finalHeight) / 2
      pdf.addImage(imgData, 'PNG', x, y, finalWidth, finalHeight)
    }
    
    // Add title and metadata
    pdf.setProperties({
      title: `Designer Metals - ${pageName}`,
      subject: 'Designer Metals Sales Dashboard',
      author: 'Designer Metals Analytics',
      creator: 'Designer Metals Dashboard',
      producer: 'Designer Metals Dashboard'
    })
    
    // Save the PDF
    const fileName = `designer-metals-${pageName.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`
    pdf.save(fileName)
    
    console.log('PDF exported successfully!')
    
  } catch (error) {
    console.error('PDF export failed:', error)
    alert('PDF export failed. Please try again.')
  }
}

// Function to show instructions for manual export
export function showManualExportInstructions() {
  const instructions = `
To export all dashboard pages to PDF:

1. Navigate to each tab using the bottom navigation
2. Click "Export PDF" on each page you want to include
3. You'll get separate PDFs for each page
4. You can combine them later if needed

Pages to export:
- Sales Overview (current page)
- Sales by Category
- Sales by Category Details  
- YTD Sales
- Monthly Sales
- Individual Sales
- Sales by Year
- Yearly Coil Sales
- YTD Coil Sales
- Sales by Year Comparison
- Customer Locations

This approach is more reliable than automatic navigation.
  `
  
  alert(instructions)
}
