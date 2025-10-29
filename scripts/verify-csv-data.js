const fs = require('fs');
const path = require('path');
const { brotliDecompressSync } = require('zlib');
const { parse } = require('csv-parse/sync');

async function verifyData() {
  try {
    console.log('🔍 Verifying CSV data from Vercel Blob Storage...\n');

    // Check if we have a local brotli file
    const brotliPath = path.join(__dirname, '..', 'Designer Metals Data - Sheet1.csv.brotli');
    
    if (!fs.existsSync(brotliPath)) {
      console.error('❌ Brotli file not found at:', brotliPath);
      console.log('📥 Fetching from Vercel Blob Storage...');
      
      // Fetch from API
      const fetch = (await import('node-fetch')).default;
      const response = await fetch('https://designer-metals.vercel.app/api/csv-data');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.statusText}`);
      }
      
      const buffer = Buffer.from(await response.arrayBuffer());
      console.log(`📦 Downloaded ${(buffer.length / 1024 / 1024).toFixed(2)} MB compressed data`);
      
      // Decompress
      const { gunzipSync } = require('zlib');
      const decompressed = gunzipSync(buffer);
      console.log(`🔓 Decompressed to ${(decompressed.length / 1024 / 1024).toFixed(2)} MB`);
      
      // Parse
      const records = parse(decompressed.toString('utf-8'), {
        columns: true,
        skip_empty_lines: true,
        trim: true
      });
      
      analyzeData(records);
      return;
    }

    // Read local brotli file
    const compressed = fs.readFileSync(brotliPath);
    console.log(`📦 Compressed size: ${(compressed.length / 1024 / 1024).toFixed(2)} MB`);

    // Decompress
    const decompressed = brotliDecompressSync(compressed);
    console.log(`🔓 Decompressed size: ${(decompressed.length / 1024 / 1024).toFixed(2)} MB`);

    // Parse CSV
    const csvContent = decompressed.toString('utf-8');
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });

    console.log(`📊 Total records: ${records.length.toLocaleString()}\n`);

    analyzeData(records);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

function analyzeData(records) {
  console.log('═══════════════════════════════════════════════════════');
  console.log('📊 YTD SALES BY YEAR (From Compressed CSV)');
  console.log('═══════════════════════════════════════════════════════\n');

  // Calculate YTD Sales by Year
  const salesByYear = {};
  const categoryByYear = {};
  let shippedToCount = 0;
  let employeeAppCount = 0;

  records.forEach(record => {
    if (record.INV_DATE && record.TOTAL) {
      const year = new Date(record.INV_DATE).getFullYear().toString();
      const total = parseFloat(record.TOTAL) || 0;
      const category = record.TREE_DESCR || 'Unknown';

      // Check for excluded categories
      if (category === 'Shipped To') {
        shippedToCount++;
        return; // Skip
      }
      if (category === 'Employee Appreciation') {
        employeeAppCount++;
        return; // Skip
      }

      if (!salesByYear[year]) {
        salesByYear[year] = 0;
        categoryByYear[year] = {};
      }
      salesByYear[year] += total;

      if (!categoryByYear[year][category]) {
        categoryByYear[year][category] = 0;
      }
      categoryByYear[year][category] += total;
    }
  });

  // Sort years descending
  const years = Object.keys(salesByYear).sort((a, b) => b.localeCompare(a));

  console.log('Year    │ Total Sales      │ In Millions');
  console.log('────────┼──────────────────┼─────────────');
  
  years.forEach(year => {
    const total = salesByYear[year];
    const formatted = total.toLocaleString('en-US', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
    const millions = (total / 1000000).toFixed(1);
    console.log(`${year}   │ $${formatted.padStart(15)} │ ${millions}M`);
  });

  console.log('\n═══════════════════════════════════════════════════════');
  console.log('📋 COMPARISON WITH IMAGE DATA');
  console.log('═══════════════════════════════════════════════════════\n');

  const expected = {
    '2024': 7203893,
    '2023': 4157196,
    '2022': 1674612
  };

  const csvData = {
    '2024': salesByYear['2024'] || 0,
    '2023': salesByYear['2023'] || 0,
    '2022': salesByYear['2022'] || 0
  };

  console.log('Year │ Expected (Image)  │ CSV Data          │ Match?');
  console.log('─────┼───────────────────┼───────────────────┼────────');
  
  Object.keys(expected).forEach(year => {
    const exp = expected[year];
    const csv = csvData[year];
    const diff = Math.abs(exp - csv);
    const percentDiff = ((diff / exp) * 100).toFixed(2);
    const match = percentDiff < 5 ? '✅ Yes' : `⚠️ ${percentDiff}% off`;
    
    console.log(
      `${year} │ $${exp.toLocaleString().padStart(15)} │ $${csv.toLocaleString().padStart(15)} │ ${match}`
    );
  });

  console.log('\n═══════════════════════════════════════════════════════');
  console.log('🚫 EXCLUDED CATEGORIES CHECK');
  console.log('═══════════════════════════════════════════════════════\n');

  console.log(`"Shipped To" records found: ${shippedToCount}`);
  console.log(`"Employee Appreciation" records found: ${employeeAppCount}`);
  
  if (shippedToCount > 0) {
    console.log('\n⚠️  WARNING: "Shipped To" category is present in CSV!');
    console.log('   These records are being filtered out in the code.');
  } else {
    console.log('\n✅ "Shipped To" category not found in CSV (good!)');
  }

  if (employeeAppCount > 0) {
    console.log('⚠️  WARNING: "Employee Appreciation" category is present in CSV!');
    console.log('   These records are being filtered out in the code.');
  } else {
    console.log('✅ "Employee Appreciation" category not found in CSV (good!)');
  }

  console.log('\n═══════════════════════════════════════════════════════');
  console.log('📈 TOP CATEGORIES BY YEAR');
  console.log('═══════════════════════════════════════════════════════\n');

  ['2024', '2023', '2022'].forEach(year => {
    if (categoryByYear[year]) {
      console.log(`\n${year}:`);
      const sorted = Object.entries(categoryByYear[year])
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
      
      sorted.forEach(([cat, total]) => {
        console.log(`  ${cat.padEnd(40)} $${total.toLocaleString()}`);
      });
    }
  });

  console.log('\n═══════════════════════════════════════════════════════\n');
}

verifyData();

