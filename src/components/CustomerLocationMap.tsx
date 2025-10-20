'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'

// Dynamically import the map component to avoid SSR issues
const MapComponent = dynamic(() => import('./MapComponent'), { 
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-96">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading map...</p>
      </div>
    </div>
  )
})

interface CustomerLocationData {
  state: string
  customerCount: number
  totalSales: number
  coordinates: { lat: number; lng: number }
}

interface CustomerPoint {
  name: string
  city: string
  state: string
  zip: string
  lat: number
  lng: number
  totalSales: number
}

interface CustomerLocationMapProps {
  filters: any
}

// State coordinates for US states
const STATE_COORDINATES: { [key: string]: { lat: number; lng: number } } = {
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

export default function CustomerLocationMap({ filters }: CustomerLocationMapProps) {
  const [locationData, setLocationData] = useState<CustomerLocationData[]>([])
  const [loading, setLoading] = useState(true)
  const [mode, setMode] = useState<'bubbles' | 'choropleth'>('bubbles')
  const [metric, setMetric] = useState<'customers' | 'sales'>('customers')
  const [aggregation, setAggregation] = useState<'state' | 'customer'>('state')
  const [customerPoints, setCustomerPoints] = useState<CustomerPoint[]>([])

  // Fetch customer location data
  useEffect(() => {
    const fetchLocationData = async () => {
      try {
        const response = await fetch('/api/customer-locations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(filters),
        })
        
        if (response.ok) {
          const data = await response.json()
          setLocationData(data)
        } else {
          // Fallback: create mock data for demonstration
          const mockData: CustomerLocationData[] = [
            { state: 'CA', customerCount: 45, totalSales: 125000, coordinates: STATE_COORDINATES['CA'] },
            { state: 'TX', customerCount: 32, totalSales: 98000, coordinates: STATE_COORDINATES['TX'] },
            { state: 'FL', customerCount: 28, totalSales: 87000, coordinates: STATE_COORDINATES['FL'] },
            { state: 'NY', customerCount: 25, totalSales: 76000, coordinates: STATE_COORDINATES['NY'] },
            { state: 'IL', customerCount: 22, totalSales: 65000, coordinates: STATE_COORDINATES['IL'] },
            { state: 'PA', customerCount: 18, totalSales: 54000, coordinates: STATE_COORDINATES['PA'] },
            { state: 'OH', customerCount: 15, totalSales: 42000, coordinates: STATE_COORDINATES['OH'] },
            { state: 'GA', customerCount: 12, totalSales: 35000, coordinates: STATE_COORDINATES['GA'] },
            { state: 'NC', customerCount: 10, totalSales: 28000, coordinates: STATE_COORDINATES['NC'] },
            { state: 'MI', customerCount: 8, totalSales: 22000, coordinates: STATE_COORDINATES['MI'] }
          ]
          setLocationData(mockData)
        }
      } catch (error) {
        console.error('Error fetching location data:', error)
        // Use mock data as fallback
        const mockData: CustomerLocationData[] = [
          { state: 'CA', customerCount: 45, totalSales: 125000, coordinates: STATE_COORDINATES['CA'] },
          { state: 'TX', customerCount: 32, totalSales: 98000, coordinates: STATE_COORDINATES['TX'] },
          { state: 'FL', customerCount: 28, totalSales: 87000, coordinates: STATE_COORDINATES['FL'] },
          { state: 'NY', customerCount: 25, totalSales: 76000, coordinates: STATE_COORDINATES['NY'] },
          { state: 'IL', customerCount: 22, totalSales: 65000, coordinates: STATE_COORDINATES['IL'] },
          { state: 'PA', customerCount: 18, totalSales: 54000, coordinates: STATE_COORDINATES['PA'] },
          { state: 'OH', customerCount: 15, totalSales: 42000, coordinates: STATE_COORDINATES['OH'] },
          { state: 'GA', customerCount: 12, totalSales: 35000, coordinates: STATE_COORDINATES['GA'] },
          { state: 'NC', customerCount: 10, totalSales: 28000, coordinates: STATE_COORDINATES['NC'] },
          { state: 'MI', customerCount: 8, totalSales: 22000, coordinates: STATE_COORDINATES['MI'] }
        ]
        setLocationData(mockData)
      } finally {
        setLoading(false)
      }
    }

    fetchLocationData()
  }, [filters])

  // Load per-customer points when aggregation is customer
  useEffect(() => {
    const loadCustomerPoints = async () => {
      if (aggregation !== 'customer') return
      try {
        const res = await fetch('/api/geocode-customers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(filters)
        })
        if (res.ok) {
          const pts = await res.json()
          setCustomerPoints(pts)
        } else {
          setCustomerPoints([])
        }
      } catch {
        setCustomerPoints([])
      }
    }
    loadCustomerPoints()
  }, [aggregation, filters])

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading map...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="mb-4 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Customer Locations</h3>
          <p className="text-sm text-gray-600">Interactive geographic distribution by state</p>
        </div>
        {/* External Toolbar */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-gray-100 rounded p-1">
            <button
              onClick={() => setAggregation('state')}
              className={`px-2 py-1 text-xs rounded ${aggregation==='state' ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-white'}`}
            >By State</button>
            <button
              onClick={() => setAggregation('customer')}
              className={`px-2 py-1 text-xs rounded ${aggregation==='customer' ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-white'}`}
            >Per Customer</button>
          </div>
          <div className="flex items-center gap-1 bg-gray-100 rounded p-1">
            <button
              onClick={() => setMode('bubbles')}
              className={`px-2 py-1 text-xs rounded ${mode==='bubbles' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-white'}`}
            >Bubbles</button>
            <button
              onClick={() => setMode('choropleth')}
              className={`px-2 py-1 text-xs rounded ${mode==='choropleth' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-white'}`}
            >Choropleth</button>
          </div>
          <div className="flex items-center gap-1 bg-gray-100 rounded p-1">
            <button
              onClick={() => setMetric('customers')}
              className={`px-2 py-1 text-xs rounded ${metric==='customers' ? 'bg-teal-600 text-white' : 'text-gray-700 hover:bg-white'}`}
            >Customers</button>
            <button
              onClick={() => setMetric('sales')}
              className={`px-2 py-1 text-xs rounded ${metric==='sales' ? 'bg-teal-600 text-white' : 'text-gray-700 hover:bg-white'}`}
            >Sales</button>
          </div>
        </div>
      </div>
      
      <div className="relative">
        {/* Toolbar */}
        <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur rounded-lg shadow border border-gray-200 p-2 flex items-center gap-2">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setMode('bubbles')}
              className={`px-2 py-1 text-xs rounded ${mode==='bubbles' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >Bubbles</button>
            <button
              onClick={() => setMode('choropleth')}
              className={`px-2 py-1 text-xs rounded ${mode==='choropleth' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >Choropleth</button>
          </div>
          <div className="w-px h-5 bg-gray-200 mx-1" />
          <div className="flex items-center gap-1">
            <button
              onClick={() => setMetric('customers')}
              className={`px-2 py-1 text-xs rounded ${metric==='customers' ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >Customers</button>
            <button
              onClick={() => setMetric('sales')}
              className={`px-2 py-1 text-xs rounded ${metric==='sales' ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >Sales</button>
          </div>
        </div>

        <MapComponent 
          locationData={locationData} 
          mode={mode} 
          metric={metric} 
          height={560}
          aggregation={aggregation}
          customerPoints={customerPoints}
        />
        
        {/* Legend */}
        <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-3 border border-gray-200 z-10">
          <h4 className="font-medium text-sm text-gray-900 mb-2">Legend</h4>
          {mode==='bubbles' ? (
            <div className="space-y-1 text-xs text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                <span>Bubble at state centroid</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span>Size = {metric==='customers' ? 'Customer count' : 'Total sales'}</span>
              </div>
            </div>
          ) : (
            <div className="space-y-1 text-xs text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{background:'#e5f0ff'}}></div>
                <span>Low {metric}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{background:'#0b5bd3'}}></div>
                <span>High {metric}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-sm text-gray-600">Total States</div>
          <div className="text-xl font-semibold text-gray-900">{locationData.length}</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-sm text-gray-600">Total Customers</div>
          <div className="text-xl font-semibold text-gray-900">
            {locationData.reduce((sum, d) => sum + d.customerCount, 0)}
          </div>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-sm text-gray-600">Total Sales</div>
          <div className="text-xl font-semibold text-gray-900">
            ${locationData.reduce((sum, d) => sum + d.totalSales, 0).toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  )
}
