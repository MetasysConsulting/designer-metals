import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const year = searchParams.get('year')
    const customer = searchParams.get('customer')
    const category = searchParams.get('category')
    const limit = parseInt(searchParams.get('limit') || '10')

    // Build query same way charts do
    let query = supabase
      .from('ARINV')
      .select('TOTAL, INV_DATE, NAME, TREE_DESCR, ADDRESS1, ADDRESS2')
      .not('TOTAL', 'is', null)
      .not('INV_DATE', 'is', null)
      .not('TREE_DESCR', 'eq', 'Employee Appreciation')
      .not('TREE_DESCR', 'eq', 'Shipped To')
      .limit(limit)

    // Apply filters
    if (year && year !== 'All') {
      const startDate = `${year}-01-01`
      const endDate = `${year}-12-31`
      query = query.gte('INV_DATE', startDate).lte('INV_DATE', endDate)
    }
    if (customer && customer !== 'All') {
      query = query.eq('NAME', customer)
    }
    if (category && category !== 'All') {
      query = query.eq('TREE_DESCR', category)
    }

    const { data: records, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Calculate summary stats
    const totalAmount = records?.reduce((sum, record) => {
      return sum + (parseFloat(record.TOTAL || '0') || 0)
    }, 0) || 0

    const categories = records?.reduce((acc, record) => {
      if (record.TREE_DESCR) {
        acc[record.TREE_DESCR] = (acc[record.TREE_DESCR] || 0) + (parseFloat(record.TOTAL || '0') || 0)
      }
      return acc
    }, {} as { [key: string]: number }) || {}

    const customers = records?.reduce((acc, record) => {
      if (record.NAME) {
        acc[record.NAME] = (acc[record.NAME] || 0) + (parseFloat(record.TOTAL || '0') || 0)
      }
      return acc
    }, {} as { [key: string]: number }) || {}

    return NextResponse.json({
      success: true,
      filters: { year, customer, category },
      summary: {
        totalRecords: records?.length || 0,
        totalAmount: Math.round(totalAmount * 100) / 100,
        topCategories: Object.entries(categories)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 5),
        topCustomers: Object.entries(customers)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 5)
      },
      sampleRecords: records?.slice(0, 5) || []
    })

  } catch (error) {
    console.error('Debug data API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch debug data' }, 
      { status: 500 }
    )
  }
}
