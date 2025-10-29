const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

async function analyzeCSV() {
  try {
    console.log('📊 Analyzing Result_1.csv...\n');

    // Read the CSV file
    const csvPath = path.join(__dirname, '..', 'Result_1.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    
    // Parse CSV
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });

    console.log(`Total records in Result_1.csv: ${records.length.toLocaleString()}\n`);

    // Calculate YTD Sales by Year
    const salesByYear = {};
    const categoryByYear = {};
    let shippedToCount = 0;
    let shippedToTotal = 0;
    let employeeAppCount = 0;
    let employeeAppTotal = 0;

    records.forEach(record => {
      if (record.INV_DATE && record.TOTAL && record.TREE_DESCR) {
        const year = new Date(record.INV_DATE).getFullYear().toString();
        const total = parseFloat(record.TOTAL) || 0;
        const category = record.TREE_DESCR.trim();

        // Check for "Shipped to" (case-insensitive)
        if (category.toLowerCase() === 'shipped to') {
          shippedToCount++;
          shippedToTotal += total;
          return; // Skip
        }

        // Check for "Employee Appreciation" (case-insensitive)
        if (category.toLowerCase() === 'employee appreciation') {
          employeeAppCount++;
          employeeAppTotal += total;
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

    console.log('═══════════════════════════════════════════════════════');
    console.log('📊 YTD SALES BY YEAR (FROM Result_1.csv)');
    console.log('═══════════════════════════════════════════════════════\n');
    
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
    console.log('🔍 COMPARISON WITH COMPRESSED FILE');
    console.log('═══════════════════════════════════════════════════════\n');

    const compressedData = {
      '2024': 9139760.45,
      '2023': 5168827.91,
      '2022': 2135066.03
    };

    console.log('Year │ Result_1.csv      │ Compressed File   │ Match?');
    console.log('─────┼───────────────────┼───────────────────┼────────');
    
    ['2024', '2023', '2022'].forEach(year => {
      const csv = salesByYear[year] || 0;
      const comp = compressedData[year];
      const diff = Math.abs(csv - comp);
      const percentDiff = ((diff / comp) * 100).toFixed(2);
      const match = percentDiff < 1 ? '✅ Yes' : `❌ ${percentDiff}% off`;
      
      console.log(
        `${year} │ $${csv.toLocaleString().padStart(15)} │ $${comp.toLocaleString().padStart(15)} │ ${match}`
      );
    });

    console.log('\n═══════════════════════════════════════════════════════');
    console.log('🚫 EXCLUDED CATEGORIES');
    console.log('═══════════════════════════════════════════════════════\n');

    console.log(`"Shipped to" records: ${shippedToCount}`);
    console.log(`"Shipped to" total: $${shippedToTotal.toLocaleString()}`);
    console.log(`\n"Employee Appreciation" records: ${employeeAppCount}`);
    console.log(`"Employee Appreciation" total: $${employeeAppTotal.toLocaleString()}\n`);

    console.log('═══════════════════════════════════════════════════════');
    console.log('📋 ALL CATEGORIES IN Result_1.csv');
    console.log('═══════════════════════════════════════════════════════\n');

    const allCategories = new Set();
    records.forEach(r => {
      if (r.TREE_DESCR) allCategories.add(r.TREE_DESCR.trim());
    });

    Array.from(allCategories).sort().forEach(cat => console.log(`  - ${cat}`));

    console.log('\n═══════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

analyzeCSV();

