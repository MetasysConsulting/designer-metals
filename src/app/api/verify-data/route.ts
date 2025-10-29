import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Fetch compressed data from blob storage
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/csv-data`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch CSV data');
    }

    // Decompress and parse on server side
    const { gunzipSync } = await import('zlib');
    const { parse } = await import('csv-parse/sync');
    
    const compressedBuffer = Buffer.from(await response.arrayBuffer());
    const decompressed = gunzipSync(compressedBuffer);
    const csvContent = decompressed.toString('utf-8');
    
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });

    // Calculate YTD Sales by Year (matching the image)
    const salesByYear: { [key: string]: number } = {};
    
    records.forEach((record: any) => {
      if (record.INV_DATE && record.TOTAL) {
        const year = new Date(record.INV_DATE).getFullYear().toString();
        const total = parseFloat(record.TOTAL) || 0;
        
        // Exclude Employee Appreciation and Shipped To (case-insensitive)
        const category = (record.TREE_DESCR || '').trim().toLowerCase();
        if (category === 'employee appreciation' || category === 'shipped to') {
          return;
        }
        
        if (!salesByYear[year]) {
          salesByYear[year] = 0;
        }
        salesByYear[year] += total;
      }
    });

    // Sort by year
    const sortedYears = Object.keys(salesByYear).sort((a, b) => b.localeCompare(a));
    const ytdSales = sortedYears.map(year => ({
      year,
      total: salesByYear[year],
      totalInMillions: (salesByYear[year] / 1000000).toFixed(1) + 'M'
    }));

    // Get category breakdown (matching the income categories in the image)
    const categoryTotals: { [key: string]: { [year: string]: number } } = {};
    
    records.forEach((record: any) => {
      if (record.INV_DATE && record.TOTAL && record.TREE_DESCR) {
        const year = new Date(record.INV_DATE).getFullYear().toString();
        const category = record.TREE_DESCR;
        const total = parseFloat(record.TOTAL) || 0;
        
        // Exclude Employee Appreciation and Shipped To (case-insensitive)
        const categoryLower = category.trim().toLowerCase();
        if (categoryLower === 'employee appreciation' || categoryLower === 'shipped to') {
          return;
        }
        
        if (!categoryTotals[category]) {
          categoryTotals[category] = {};
        }
        if (!categoryTotals[category][year]) {
          categoryTotals[category][year] = 0;
        }
        categoryTotals[category][year] += total;
      }
    });

    // Check if "Shipped To" is in the data (case-insensitive)
    const shippedToRecords = records.filter((r: any) => 
      (r.TREE_DESCR || '').trim().toLowerCase() === 'shipped to'
    );
    
    return NextResponse.json({
      success: true,
      totalRecords: records.length,
      ytdSalesByYear: ytdSales,
      categoryBreakdown: Object.keys(categoryTotals).sort().map(cat => ({
        category: cat,
        yearlyTotals: categoryTotals[cat]
      })),
      shippedToCheck: {
        found: shippedToRecords.length,
        message: shippedToRecords.length > 0 
          ? '⚠️ WARNING: "Shipped To" category found in data!' 
          : '✅ "Shipped To" category properly excluded'
      },
      // Expected values from image for comparison
      expectedFromImage: {
        '2025': 'Not in image (current year)',
        '2024': '7,203,893',
        '2023': '4,157,196',
        '2022': '1,674,612'
      }
    });

  } catch (error) {
    console.error('Error verifying data:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to verify data',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

