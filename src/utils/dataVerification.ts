import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export interface DatabaseRecord {
  TOTAL: string
  INV_DATE: string
  NAME: string
  TREE_DESCR: string
  ADDRESS1?: string
  ADDRESS2?: string
}

export interface ChartDataSummary {
  totalRecords: number
  totalAmount: number
  dateRange: { min: string; max: string }
  categories: { [key: string]: number }
  customers: { [key: string]: number }
  years: { [key: string]: number }
  sampleRecords: DatabaseRecord[]
}

export async function verifyChartData(filters: any = {}): Promise<ChartDataSummary> {
  try {
    console.log('🔍 Verifying chart data with filters:', filters)
    
    // Build the same query that charts use
    let query = supabase
      .from('ARINV')
      .select('TOTAL, INV_DATE, NAME, TREE_DESCR, ADDRESS1, ADDRESS2')
      .not('TOTAL', 'is', null)
      .not('INV_DATE', 'is', null)
      .not('TREE_DESCR', 'eq', 'Employee Appreciation')
      .not('TREE_DESCR', 'eq', 'Shipped To')

    // Apply the same filters that charts use
    if (filters.year && filters.year !== 'All') {
      const startDate = `${filters.year}-01-01`
      const endDate = `${filters.year}-12-31`
      query = query.gte('INV_DATE', startDate).lte('INV_DATE', endDate)
    }
    if (filters.customer && filters.customer !== 'All') {
      query = query.eq('NAME', filters.customer)
    }
    if (filters.category && filters.category !== 'All') {
      query = query.eq('TREE_DESCR', filters.category)
    }

    const { data: records, error } = await query

    if (error) {
      console.error('❌ Database query error:', error)
      throw new Error(`Database query failed: ${error.message}`)
    }

    if (!records || records.length === 0) {
      console.warn('⚠️ No records found with current filters')
      return {
        totalRecords: 0,
        totalAmount: 0,
        dateRange: { min: '', max: '' },
        categories: {},
        customers: {},
        years: {},
        sampleRecords: []
      }
    }

    // Process the data the same way charts do
    let totalAmount = 0
    const categories: { [key: string]: number } = {}
    const customers: { [key: string]: number } = {}
    const years: { [key: string]: number } = {}
    const dates: string[] = []

    records.forEach(record => {
      const amount = parseFloat(record.TOTAL || '0') || 0
      totalAmount += amount

      // Category aggregation
      if (record.TREE_DESCR) {
        categories[record.TREE_DESCR] = (categories[record.TREE_DESCR] || 0) + amount
      }

      // Customer aggregation
      if (record.NAME) {
        customers[record.NAME] = (customers[record.NAME] || 0) + amount
      }

      // Year aggregation
      if (record.INV_DATE) {
        const year = new Date(record.INV_DATE).getFullYear().toString()
        years[year] = (years[year] || 0) + amount
        dates.push(record.INV_DATE)
      }
    })

    // Calculate date range
    const sortedDates = dates.sort()
    const dateRange = {
      min: sortedDates[0] || '',
      max: sortedDates[sortedDates.length - 1] || ''
    }

    // Get sample records (first 5)
    const sampleRecords = records.slice(0, 5)

    const summary: ChartDataSummary = {
      totalRecords: records.length,
      totalAmount: Math.round(totalAmount * 100) / 100, // Round to 2 decimal places
      dateRange,
      categories: Object.fromEntries(
        Object.entries(categories)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 10) // Top 10 categories
      ),
      customers: Object.fromEntries(
        Object.entries(customers)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 10) // Top 10 customers
      ),
      years: Object.fromEntries(
        Object.entries(years)
          .sort(([a], [b]) => b.localeCompare(a))
      ),
      sampleRecords
    }

    console.log('✅ Data verification complete:', {
      totalRecords: summary.totalRecords,
      totalAmount: summary.totalAmount,
      categoriesCount: Object.keys(summary.categories).length,
      customersCount: Object.keys(summary.customers).length,
      yearsCount: Object.keys(summary.years).length
    })

    return summary

  } catch (error) {
    console.error('❌ Data verification failed:', error)
    throw error
  }
}

export function logChartComparison(chartName: string, chartData: any[], dbSummary: ChartDataSummary) {
  console.log(`\n📊 ${chartName} Chart Data Comparison:`)
  console.log('=' .repeat(50))
  
  // Calculate chart totals
  const chartTotal = chartData.reduce((sum, item) => {
    if (typeof item === 'object' && item.value !== undefined) {
      return sum + (item.value || 0)
    } else if (typeof item === 'object' && item.amount !== undefined) {
      return sum + (item.amount || 0)
    } else if (typeof item === 'number') {
      return sum + item
    }
    return sum
  }, 0)

  console.log(`📈 Chart Data Points: ${chartData.length}`)
  console.log(`💰 Chart Total: $${chartTotal.toLocaleString()}`)
  console.log(`🗄️  Database Records: ${dbSummary.totalRecords}`)
  console.log(`💰 Database Total: $${dbSummary.totalAmount.toLocaleString()}`)
  
  const difference = Math.abs(chartTotal - dbSummary.totalAmount)
  const percentageDiff = dbSummary.totalAmount > 0 ? (difference / dbSummary.totalAmount) * 100 : 0
  
  console.log(`📊 Difference: $${difference.toLocaleString()} (${percentageDiff.toFixed(2)}%)`)
  
  if (percentageDiff < 1) {
    console.log('✅ Data matches closely!')
  } else if (percentageDiff < 5) {
    console.log('⚠️ Small difference detected')
  } else {
    console.log('❌ Significant difference detected!')
  }

  // Show sample data
  console.log('\n📋 Sample Chart Data:')
  chartData.slice(0, 3).forEach((item, index) => {
    console.log(`  ${index + 1}.`, item)
  })

  console.log('\n🗄️ Sample Database Records:')
  dbSummary.sampleRecords.slice(0, 3).forEach((record, index) => {
    console.log(`  ${index + 1}. ${record.NAME} - ${record.TREE_DESCR} - $${parseFloat(record.TOTAL || '0').toLocaleString()} - ${record.INV_DATE}`)
  })
}
