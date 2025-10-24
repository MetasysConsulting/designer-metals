import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

// This will be called from the component with the router
export async function captureAllPagesAutomatically(router: any) {
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

  try {
    console.log('Starting automatic PDF export for ALL pages...')
    
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
        <div style="font-size: 14px; margin-bottom: 10px;">${message}</div>
        <div style="font-size: 12px; color: #9ca3af;">
          Page ${current} of ${total}
        </div>
        <div style="margin-top: 10px; width: 100%; background: #374151; border-radius: 4px; height: 8px;">
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
      
      // Wait for page to be fully loaded
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      // Hide buttons temporarily
      const buttons = document.querySelectorAll('button')
      buttons.forEach(btn => {
        if (btn instanceof HTMLElement) {
          btn.style.visibility = 'hidden'
        }
      })
      
      // Hide progress indicator temporarily
      const progressElement = document.getElementById('pdf-export-progress')
      if (progressElement) {
        progressElement.style.display = 'none'
      }
      
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
      
      // Restore progress indicator
      if (progressElement) {
        progressElement.style.display = 'block'
      }
      
      return canvas
    }
    
    // Navigate through each page and capture using Next.js router
    for (let i = 0; i < DASHBOARD_PAGES.length; i++) {
      const page = DASHBOARD_PAGES[i]
      
      try {
        updateProgress(`Navigating to ${page.name}...`, i + 1, DASHBOARD_PAGES.length)
        
        // Use Next.js router for client-side navigation
        router.push(page.path)
        
        // Wait for navigation to complete - check URL change
        await new Promise(resolve => {
          const checkURL = () => {
            if (window.location.pathname === page.path) {
              resolve(undefined)
            } else {
              setTimeout(checkURL, 100)
            }
          }
          setTimeout(checkURL, 500)
        })
        
        // Wait for page to render
        await new Promise(resolve => setTimeout(resolve, 3000))
        
        // Wait for charts to render (check for canvas elements)
        await new Promise(resolve => {
          const checkCharts = () => {
            const canvases = document.querySelectorAll('canvas')
            if (canvases.length > 0) {
              resolve(undefined)
            } else {
              setTimeout(checkCharts, 200)
            }
          }
          setTimeout(checkCharts, 500)
        })
        
        // Extra wait for chart animations to complete
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        updateProgress(`Capturing ${page.name}...`, i + 1, DASHBOARD_PAGES.length)
        
        // Capture the page
        const canvas = await captureCurrentPage(page.name)
        
        if (canvas) {
          // Add page to PDF
          if (!isFirstPage) {
            pdf.addPage()
          }
          isFirstPage = false
          
          // Add page title
          pdf.setFontSize(16)
          pdf.setFont('helvetica', 'bold')
          pdf.text(page.name, 20, 20)
          
          // Add the captured image
          const imgData = canvas.toDataURL('image/png', 1.0)
          const pdfWidth = pdf.internal.pageSize.getWidth()
          const pdfHeight = pdf.internal.pageSize.getHeight()
          
          const imgWidth = canvas.width
          const imgHeight = canvas.height
          const ratio = Math.min((pdfWidth - 40) / imgWidth, (pdfHeight - 40) / imgHeight)
          const finalWidth = imgWidth * ratio
          const finalHeight = imgHeight * ratio
          
          const x = (pdfWidth - finalWidth) / 2
          const y = 30 // Start below the title
          
          pdf.addImage(imgData, 'PNG', x, y, finalWidth, finalHeight)
          
          console.log(`Successfully captured ${page.name}`)
        }
        
      } catch (error) {
        console.error(`Error capturing ${page.name}:`, error)
        // Continue with next page
      }
    }
    
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
    
    console.log('Complete dashboard PDF exported successfully!')
    alert(`PDF export completed! All ${DASHBOARD_PAGES.length} dashboard pages have been captured in one PDF file.`)
    
    // Navigate back to sales overview
    router.push('/sales-overview')
    
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
