import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const filters = await request.json()
    
    // Check if Supabase is properly configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://placeholder.supabase.co') {
      return NextResponse.json([])
    }

    let query = supabase
      .from('ARINV')
      .select('STATE, TOTAL, NAME')
      .not('STATE', 'is', null)
      .not('TOTAL', 'is', null)
      .not('TREE_DESCR', 'eq', 'Employee Appreciation')
      .not('TREE_DESCR', 'eq', 'Shipped To')

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
      console.error('Error fetching customer location data:', error)
      return NextResponse.json([])
    }

    // Group by state and calculate metrics
    const stateData: { [key: string]: { customerCount: number; totalSales: number; customers: Set<string> } } = {}
    
    data?.forEach(record => {
      const state = record.STATE?.trim().toUpperCase()
      if (!state) return

      if (!stateData[state]) {
        stateData[state] = {
          customerCount: 0,
          totalSales: 0,
          customers: new Set()
        }
      }

      // Add customer to set (to get unique count)
      if (record.NAME) {
        stateData[state].customers.add(record.NAME)
      }

      // Add to total sales
      const total = parseFloat(record.TOTAL) || 0
      stateData[state].totalSales += total
    })

    // Convert to array format
    const result = Object.entries(stateData).map(([state, data]) => ({
      state,
      customerCount: data.customers.size,
      totalSales: data.totalSales,
      coordinates: getStateCoordinates(state)
    })).filter(item => item.customerCount > 0)

    return NextResponse.json(result)

  } catch (error) {
    console.error('Error in customer-locations API:', error)
    return NextResponse.json([])
  }
}

// State coordinates mapping
function getStateCoordinates(state: string): { lat: number; lng: number } {
  const coordinates: { [key: string]: { lat: number; lng: number } } = {
    'AL': { lat: 32.806671, lng: -86.791130 },
    'AK': { lat: 61.370716, lng: -152.404419 },
    'AZ': { lat: 33.729759, lng: -111.431221 },
    'AR': { lat: 34.969704, lng: -92.373123 },
    'CA': { lat: 36.116203, lng: -119.681564 },
    'CO': { lat: 39.059811, lng: -105.311104 },
    'CT': { lat: 41.597782, lng: -72.755371 },
    'DE': { lat: 39.318523, lng: -75.507141 },
    'FL': { lat: 27.766279, lng: -82.640374 },
    'GA': { lat: 33.040619, lng: -83.643074 },
    'HI': { lat: 21.094318, lng: -157.498337 },
    'ID': { lat: 44.240459, lng: -114.478828 },
    'IL': { lat: 40.349457, lng: -88.986137 },
    'IN': { lat: 39.849426, lng: -86.258278 },
    'IA': { lat: 42.011539, lng: -93.210526 },
    'KS': { lat: 38.526600, lng: -96.726486 },
    'KY': { lat: 37.668140, lng: -84.670067 },
    'LA': { lat: 31.169546, lng: -91.867805 },
    'ME': { lat: 44.323535, lng: -69.765261 },
    'MD': { lat: 39.063946, lng: -76.802101 },
    'MA': { lat: 42.230171, lng: -71.530106 },
    'MI': { lat: 43.326618, lng: -84.536095 },
    'MN': { lat: 45.694454, lng: -93.900192 },
    'MS': { lat: 32.741646, lng: -89.678696 },
    'MO': { lat: 38.456085, lng: -92.288368 },
    'MT': { lat: 47.052632, lng: -110.454353 },
    'NE': { lat: 41.125370, lng: -98.268082 },
    'NV': { lat: 38.313515, lng: -117.055374 },
    'NH': { lat: 43.452492, lng: -71.563896 },
    'NJ': { lat: 40.298904, lng: -74.521011 },
    'NM': { lat: 34.840515, lng: -106.248482 },
    'NY': { lat: 42.165726, lng: -74.948051 },
    'NC': { lat: 35.630066, lng: -79.806419 },
    'ND': { lat: 47.528912, lng: -99.784012 },
    'OH': { lat: 40.388783, lng: -82.764915 },
    'OK': { lat: 35.565342, lng: -96.928917 },
    'OR': { lat: 44.572021, lng: -122.070938 },
    'PA': { lat: 40.590752, lng: -77.209755 },
    'RI': { lat: 41.680893, lng: -71.511780 },
    'SC': { lat: 33.856892, lng: -80.945007 },
    'SD': { lat: 44.299782, lng: -99.438828 },
    'TN': { lat: 35.747845, lng: -86.692345 },
    'TX': { lat: 31.054487, lng: -97.563461 },
    'UT': { lat: 40.150032, lng: -111.862434 },
    'VT': { lat: 44.045876, lng: -72.710686 },
    'VA': { lat: 37.769337, lng: -78.169968 },
    'WA': { lat: 47.400902, lng: -121.490494 },
    'WV': { lat: 38.491226, lng: -80.954453 },
    'WI': { lat: 44.268543, lng: -89.616508 },
    'WY': { lat: 42.755966, lng: -107.302490 }
  }

  return coordinates[state] || { lat: 39.8283, lng: -98.5795 } // Default to center of US
}
