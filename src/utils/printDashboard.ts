import html2canvas from 'html2canvas'

export async function printDashboard(title: string = 'Designer Metals Dashboard') {
  try {
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
      
      /* Print-specific styles to remove headers/footers */
      @media print {
        @page {
          margin: 0 !important;
          size: A4 landscape !important;
        }
        @page :first {
          margin: 0 !important;
        }
        @page :left {
          margin: 0 !important;
        }
        @page :right {
          margin: 0 !important;
        }
      }
    `
    document.head.appendChild(colorFixStyle)
    
    await new Promise(resolve => setTimeout(resolve, 100))
    
    // Capture the dashboard as an image
    const dashboardElement = document.querySelector('.min-h-screen') as HTMLElement
    if (!dashboardElement) {
      alert('Dashboard not found')
      return
    }
    
    const canvas = await html2canvas(dashboardElement, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      windowWidth: dashboardElement.scrollWidth,
      windowHeight: dashboardElement.scrollHeight
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
    
    // Try a different approach - create a hidden div with the image and print directly
    const printContainer = document.createElement('div')
    printContainer.className = 'print-container'
    printContainer.style.position = 'absolute'
    printContainer.style.left = '-9999px'
    printContainer.style.top = '-9999px'
    printContainer.style.width = '210mm' // A4 width
    printContainer.style.height = '297mm' // A4 height
    printContainer.style.background = 'white'
    printContainer.style.padding = '0'
    printContainer.style.margin = '0'
    
    const printImage = document.createElement('img')
    printImage.src = canvas.toDataURL('image/png', 1.0)
    printImage.style.width = '100%'
    printImage.style.height = '100%'
    printImage.style.objectFit = 'contain'
    printImage.style.display = 'block'
    
    printContainer.appendChild(printImage)
    document.body.appendChild(printContainer)
    
    // Add print-specific CSS
    const printStyle = document.createElement('style')
    printStyle.id = 'print-style'
    printStyle.textContent = `
      @media print {
        @page {
          margin: 0 !important;
          size: A4 landscape !important;
        }
        @page :first {
          margin: 0 !important;
        }
        @page :left {
          margin: 0 !important;
        }
        @page :right {
          margin: 0 !important;
        }
        body {
          margin: 0 !important;
          padding: 0 !important;
        }
        .print-container {
          margin: 0 !important;
          padding: 0 !important;
          width: 100% !important;
          height: 100% !important;
        }
        .print-container img {
          width: 100% !important;
          height: 100% !important;
          object-fit: contain !important;
        }
      }
    `
    document.head.appendChild(printStyle)
    
    // Wait a moment then print
    setTimeout(() => {
      window.print()
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(printContainer)
        const styleToRemove = document.getElementById('print-style')
        if (styleToRemove) {
          document.head.removeChild(styleToRemove)
        }
      }, 1000)
    }, 500)
    
  } catch (error) {
    console.error('Print failed:', error)
    alert('Print failed. Please try again.')
  }
}

