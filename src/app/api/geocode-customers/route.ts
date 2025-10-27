import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

type ARINVRow = {
  NAME: string | null
  ADDRESS1: string | null
  ADDRESS2: string | null
  CITY: string | null
  STATE: string | null
  ZIP: string | null
  TOTAL: string | null
}

type CustomerPoint = {
  name: string
  address: string
  city: string
  state: string
  zip: string
  lat: number
  lng: number
  totalSales: number
}

function buildAddressKey(address: string, city: string, state: string, zip: string) {
  return `${address?.trim().toUpperCase() || ''}|${city?.trim().toUpperCase() || ''}|${state?.trim().toUpperCase() || ''}|${zip?.trim() || ''}`
}

async function geocodeWithNominatim(query: string): Promise<{ lat: number; lng: number } | null> {
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=us&q=${encodeURIComponent(query)}`
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'DesignerMetalsDashboard/1.0 (contact: admin@designer-metals.local)'
    }
  })
  if (!res.ok) return null
  const json: any[] = await res.json()
  if (!json || json.length === 0) return null
  const first = json[0]
  return { lat: parseFloat(first.lat), lng: parseFloat(first.lon) }
}

export async function POST(request: NextRequest) {
  try {
    const filters = await request.json().catch(() => ({}))

    // If Supabase is not configured, we can still geocode live (no cache)
    const supabaseConfigured = !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co')
    console.log('Supabase configured:', supabaseConfigured)
    console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)

    // Pull unique customers with full address info
    let query = supabase
      .from('ARINV')
      .select('NAME, ADDRESS1, ADDRESS2, CITY, STATE, ZIP, TOTAL')
      .not('CITY', 'is', null)
      .not('STATE', 'is', null)
      .not('TREE_DESCR', 'eq', 'Employee Appreciation')
      .not('TREE_DESCR', 'eq', 'Shipped To')

    if (filters?.year && filters.year !== 'All') {
      const startDate = `${filters.year}-01-01`
      const endDate = `${filters.year}-12-31`
      query = query.gte('INV_DATE', startDate).lte('INV_DATE', endDate)
    }
    if (filters?.customer && filters.customer !== 'All') {
      query = query.eq('NAME', filters.customer)
    }
    if (filters?.category && filters.category !== 'All') {
      query = query.eq('TREE_DESCR', filters.category)
    }

    const { data, error } = await query as unknown as { data: ARINVRow[] | null; error: any }
    if (error) {
      console.error('ARINV fetch failed for geocoding:', error)
      return NextResponse.json([])
    }
    console.log('Raw database data:', data?.length || 0, 'rows')

    const rows = (data || []).filter(r => r.CITY && r.STATE)
    console.log('Found rows for geocoding:', rows.length)

    // Aggregate per customer with full address
    const byCustomer: Map<string, { name: string; address: string; city: string; state: string; zip: string; totalSales: number }> = new Map()
    for (const r of rows) {
      const name = (r.NAME || 'Unknown').trim()
      const address1 = (r.ADDRESS1 || '').trim()
      const address2 = (r.ADDRESS2 || '').trim()
      const fullAddress = [address1, address2].filter(Boolean).join(', ')
      const city = (r.CITY || '').trim()
      const state = (r.STATE || '').trim()
      const zip = (r.ZIP || '').trim()
      const key = `${name}|${fullAddress}|${city}|${state}|${zip}`.toUpperCase()
      const total = parseFloat(r.TOTAL || '0') || 0
      const existing = byCustomer.get(key)
      if (existing) existing.totalSales += total
      else byCustomer.set(key, { name, address: fullAddress, city, state, zip, totalSales: total })
    }
    
    console.log('Aggregated customers:', byCustomer.size)

    const results: CustomerPoint[] = []
    const pendingToGeocode: { key: string; name: string; address: string; city: string; state: string; zip: string; totalSales: number }[] = []

    // Try cache first if supabase configured
    if (supabaseConfigured) {
      for (const [key, c] of byCustomer.entries()) {
        const addrKey = buildAddressKey(c.address, c.city, c.state, c.zip)
        const { data: cached } = await supabase
          .from('customer_geocode')
          .select('lat, lng, city, state, zip')
          .eq('address_key', addrKey)
          .limit(1)
          .maybeSingle()
        if (cached && typeof cached.lat === 'number' && typeof cached.lng === 'number') {
          results.push({ name: c.name, address: c.address, city: c.city, state: c.state, zip: c.zip, lat: cached.lat, lng: cached.lng, totalSales: c.totalSales })
        } else {
          pendingToGeocode.push({ key, ...c })
        }
      }
    } else {
      // No cache available
      for (const [key, c] of byCustomer.entries()) pendingToGeocode.push({ key, ...c })
    }

    // Geocode remaining with 1 rps throttle
    // State centroid fallback map (US only)
    const STATE_COORDINATES: Record<string, { lat: number; lng: number }> = {
      AL:{lat:32.806671,lng:-86.79113},AK:{lat:61.370716,lng:-152.404419},AZ:{lat:33.729759,lng:-111.431221},AR:{lat:34.969704,lng:-92.373123},CA:{lat:36.116203,lng:-119.681564},CO:{lat:39.059811,lng:-105.311104},CT:{lat:41.597782,lng:-72.755371},DE:{lat:39.318523,lng:-75.507141},FL:{lat:27.766279,lng:-82.640374},GA:{lat:33.040619,lng:-83.643074},HI:{lat:21.094318,lng:-157.498337},ID:{lat:44.240459,lng:-114.478828},IL:{lat:40.349457,lng:-88.986137},IN:{lat:39.849426,lng:-86.258278},IA:{lat:42.011539,lng:-93.210526},KS:{lat:38.5266,lng:-96.726486},KY:{lat:37.66814,lng:-84.670067},LA:{lat:31.169546,lng:-91.867805},ME:{lat:44.323535,lng:-69.765261},MD:{lat:39.063946,lng:-76.802101},MA:{lat:42.230171,lng:-71.530106},MI:{lat:43.326618,lng:-84.536095},MN:{lat:45.694454,lng:-93.900192},MS:{lat:32.741646,lng:-89.678696},MO:{lat:38.456085,lng:-92.288368},MT:{lat:47.052632,lng:-110.454353},NE:{lat:41.12537,lng:-98.268082},NV:{lat:38.313515,lng:-117.055374},NH:{lat:43.452492,lng:-71.563896},NJ:{lat:40.298904,lng:-74.521011},NM:{lat:34.840515,lng:-106.248482},NY:{lat:42.165726,lng:-74.948051},NC:{lat:35.630066,lng:-79.806419},ND:{lat:47.528912,lng:-99.784012},OH:{lat:40.388783,lng:-82.764915},OK:{lat:35.565342,lng:-96.928917},OR:{lat:44.572021,lng:-122.070938},PA:{lat:40.590752,lng:-77.209755},RI:{lat:41.680893,lng:-71.51178},SC:{lat:33.856892,lng:-80.945007},SD:{lat:44.299782,lng:-99.438828},TN:{lat:35.747845,lng:-86.692345},TX:{lat:31.054487,lng:-97.563461},UT:{lat:40.150032,lng:-111.862434},VT:{lat:44.045876,lng:-72.710686},VA:{lat:37.769337,lng:-78.169968},WA:{lat:47.400902,lng:-121.490494},WV:{lat:38.491226,lng:-80.954453},WI:{lat:44.268543,lng:-89.616508},WY:{lat:42.755966,lng:-107.30249}
    }

    for (let i = 0; i < pendingToGeocode.length; i++) {
      const c = pendingToGeocode[i]
      
      // Try full address first, then fall back to city/state if that fails
      let geocoded = null
      let queryParts = [c.address, c.city, c.state, c.zip, 'USA'].filter(Boolean).join(', ')
      
      // Only try full address if we have a meaningful address
      if (c.address && c.address.trim().length > 5) {
        geocoded = await geocodeWithNominatim(queryParts)
      }
      
      // If full address failed, try city/state/zip
      if (!geocoded) {
        queryParts = [c.city, c.state, c.zip, 'USA'].filter(Boolean).join(', ')
        geocoded = await geocodeWithNominatim(queryParts)
      }
      
      const fallback = STATE_COORDINATES[(c.state || '').toUpperCase()]
      const finalLat = geocoded?.lat ?? fallback?.lat
      const finalLng = geocoded?.lng ?? fallback?.lng
      
      if (typeof finalLat === 'number' && typeof finalLng === 'number') {
        results.push({ name: c.name, address: c.address, city: c.city, state: c.state, zip: c.zip, lat: finalLat, lng: finalLng, totalSales: c.totalSales })
        if (geocoded && supabaseConfigured) {
          const address_key = buildAddressKey(c.address, c.city, c.state, c.zip)
          await supabase.from('customer_geocode').upsert({
            address_key,
            city: c.city,
            state: c.state,
            zip: c.zip,
            lat: finalLat,
            lng: finalLng,
            updated_at: new Date().toISOString()
          })
        }
      }
      // Throttle 1 rps to respect Nominatim policy
      if (i < pendingToGeocode.length - 1) await new Promise(r => setTimeout(r, 1100))
    }

    console.log('Returning geocoded results:', results.length)
    return NextResponse.json(results)
  } catch (e) {
    console.error('Geocode customers API failed:', e)
    return NextResponse.json([])
  }
}


