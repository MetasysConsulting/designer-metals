import { supabase } from './supabase'
import { ARINV } from '@/types/arinv'

export async function fetchARINVData(): Promise<ARINV[]> {
  // Check if Supabase is properly configured
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://placeholder.supabase.co') {
    console.warn('Supabase not configured, returning empty data')
    return []
  }

  const { data, error } = await supabase
    .from('ARINV')
    .select('*')
    .order('NAME', { ascending: true })

  if (error) {
    console.error('Error fetching ARINV data:', error)
    throw new Error('Failed to fetch ARINV data')
  }

  return data || []
}

export async function searchARINVData(searchTerm: string): Promise<ARINV[]> {
  const { data, error } = await supabase
    .from('ARINV')
    .select('*')
    .or(`NAME.ilike.%${searchTerm}%,ID.ilike.%${searchTerm}%,CITY.ilike.%${searchTerm}%,STATE.ilike.%${searchTerm}%`)
    .order('NAME', { ascending: true })

  if (error) {
    console.error('Error searching ARINV data:', error)
    throw new Error('Failed to search ARINV data')
  }

  return data || []
}

// New functions for chart data
export async function fetchMonthlySalesData(filters: any = {}): Promise<{ month: string; amount: number }[]> {
  let query = supabase
    .from('ARINV')
    .select('TOTAL, INV_DATE, NAME, TREE_DESCR')
    .not('TOTAL', 'is', null)
    .not('INV_DATE', 'is', null)
    .not('TREE_DESCR', 'in', ['Employee Appreciation', 'Shipped To'])

  // Apply filters
  if (filters.year && filters.year !== 'All') {
    // Filter by year - we'll need to use a date range or extract year from INV_DATE
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

  const { data, error } = await query

  if (error) {
    console.error('Error fetching monthly sales data:', error)
    throw new Error('Failed to fetch monthly sales data')
  }

  // Group by month and sum totals
  const monthlyData: { [key: string]: number } = {}
  
  data?.forEach(record => {
    if (record.INV_DATE && record.TOTAL) {
      const date = new Date(record.INV_DATE)
      if (!isNaN(date.getTime())) {
        const month = date.toLocaleString('default', { month: 'long' })
        const total = parseFloat(record.TOTAL) || 0
        monthlyData[month] = (monthlyData[month] || 0) + total
      }
    }
  })

  // Convert to array and sort by month
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                  'July', 'August', 'September', 'October', 'November', 'December']
  
  return months.map(month => ({
    month,
    amount: monthlyData[month] || 0
  }))
}

export async function fetchCategorySalesData(filters: any = {}): Promise<{ name: string; value: number }[]> {
  let query = supabase
    .from('ARINV')
    .select('TOTAL, TREE_DESCR, NAME, INV_DATE')
    .not('TOTAL', 'is', null)
    .not('TREE_DESCR', 'is', null)
    .not('TREE_DESCR', 'in', ['Employee Appreciation', 'Shipped To'])

  // Apply filters
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

  const { data, error } = await query

  if (error) {
    console.error('Error fetching category sales data:', error)
    console.error('Query filters:', filters)
    throw new Error(`Failed to fetch category sales data: ${error.message}`)
  }

  console.log('Category sales data fetched successfully:', data?.length, 'records')

  // Group by TREE_DESCR and sum totals
  const categoryData: { [key: string]: number } = {}
  
  data?.forEach(record => {
    const category = record.TREE_DESCR || 'Unknown'
    const total = parseFloat(record.TOTAL) || 0
    categoryData[category] = (categoryData[category] || 0) + total
  })

  // Convert to array and sort by value
  return Object.entries(categoryData)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
}

export async function fetchYearlySalesData(filters: any = {}): Promise<{ year: string; amount: number }[]> {
  let query = supabase
    .from('ARINV')
    .select('TOTAL, INV_DATE, NAME, TREE_DESCR')
    .not('TOTAL', 'is', null)
    .not('INV_DATE', 'is', null)
    .not('TREE_DESCR', 'in', ['Employee Appreciation', 'Shipped To'])

  // Apply filters
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

  const { data, error } = await query

  if (error) {
    console.error('Error fetching yearly sales data:', error)
    throw new Error('Failed to fetch yearly sales data')
  }

  // Group by year and sum totals
  const yearlyData: { [key: string]: number } = {}
  
  data?.forEach(record => {
    if (record.INV_DATE && record.TOTAL) {
      const date = new Date(record.INV_DATE)
      if (!isNaN(date.getTime())) {
        const year = date.getFullYear().toString()
        const total = parseFloat(record.TOTAL) || 0
        yearlyData[year] = (yearlyData[year] || 0) + total
      }
    }
  })

  // Convert to array and sort by year
  return Object.entries(yearlyData)
    .map(([year, amount]) => ({ year, amount }))
    .sort((a, b) => a.year.localeCompare(b.year))
}
