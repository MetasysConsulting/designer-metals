'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap, GeoJSON } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

interface CustomerLocationData {
  state: string
  customerCount: number
  totalSales: number
  coordinates: { lat: number; lng: number }
}

interface CustomerPoint {
  name: string
  address: string
  city: string
  state: string
  zip: string
  lat: number
  lng: number
  totalSales: number
}

interface MapComponentProps {
  locationData: CustomerLocationData[]
  mode?: 'bubbles' | 'choropleth'
  metric?: 'customers' | 'sales'
  height?: number
  customerPoints?: CustomerPoint[]
  aggregation?: 'state' | 'customer'
}

// Custom marker icon
const createCustomIcon = (size: number, color: string = '#2563eb') => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        background-color: ${color};
        border: 2px solid #1d4ed8;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 12px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      ">
        ${size > 30 ? '📍' : ''}
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  })
}

// Component to fit map bounds to provided points
function FitBoundsToPoints({ points }: { points: Array<[number, number]> }) {
  const map = useMap()
  useEffect(() => {
    if (points && points.length > 0) {
      const bounds = L.latLngBounds(points.map(([lat, lng]) => [lat, lng]))
      map.fitBounds(bounds, { padding: [20, 20] })
    }
  }, [points, map])
  return null
}

export default function MapComponent({ locationData, mode = 'bubbles', metric = 'customers', height = 600, customerPoints = [], aggregation = 'state' }: MapComponentProps) {
  const [loading, setLoading] = useState(true)
  const [statesGeoJson, setStatesGeoJson] = useState<any | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        // Lightweight US states GeoJSON (GeoJSON, not TopoJSON)
        const res = await fetch('https://raw.githubusercontent.com/PublicaMundi/MappingAPI/master/data/geojson/us-states.json')
        if (res.ok) {
          const gj = await res.json()
          setStatesGeoJson(gj)
        }
      } catch (e) {
        // ignore; map still works in bubble mode
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading map...</p>
        </div>
      </div>
    )
  }

  // Find max values for scaling
  const maxCustomers = Math.max(...locationData.map(d => d.customerCount), 1)
  const maxSales = Math.max(...locationData.map(d => d.totalSales), 1)

  const valueByState: Record<string, number> = {}
  locationData.forEach(d => {
    valueByState[d.state] = d.totalSales
  })

  const getValue = (abbr: string, metric: 'customers' | 'sales') => {
    const found = locationData.find(d => d.state === abbr)
    if (!found) return 0
    return metric === 'customers' ? found.customerCount : found.totalSales
  }

  const getChoroplethColor = (val: number, metric: 'customers' | 'sales') => {
    const max = metric === 'customers' ? maxCustomers : maxSales
    const ratio = Math.min(val / max, 1)
    // Blue scale from #e5f0ff to #0b5bd3
    const start = [229, 240, 255]
    const end = [11, 91, 211]
    const r = Math.round(start[0] + (end[0] - start[0]) * ratio)
    const g = Math.round(start[1] + (end[1] - start[1]) * ratio)
    const b = Math.round(start[2] + (end[2] - start[2]) * ratio)
    return `rgb(${r}, ${g}, ${b})`
  }

  // Build points to fit
  const fitPoints: Array<[number, number]> = aggregation === 'customer'
    ? customerPoints.map(p => [p.lat, p.lng])
    : locationData.map(l => [l.coordinates.lat, l.coordinates.lng])

  return (
    <div className="w-full rounded-lg border border-gray-200 overflow-hidden" style={{height}}>
      <MapContainer
        center={[39.8283, -98.5795]} // Center of US
        zoom={4}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {/* Choropleth layer (optional) */}
        {statesGeoJson && (mode === 'choropleth') && (
          <GeoJSON
            data={statesGeoJson as any}
            style={(feature: any) => {
              // Feature has name property (full state name). We need state abbrev: feature.properties.state_abbr if exists; fallback map by name not provided here.
              const name: string = feature?.properties?.name || ''
              // Map full name to USPS abbr quick map
              const nameToAbbr: Record<string, string> = {
                Alabama: 'AL', Alaska: 'AK', Arizona: 'AZ', Arkansas: 'AR', California: 'CA', Colorado: 'CO', Connecticut: 'CT', Delaware: 'DE', Florida: 'FL', Georgia: 'GA', Hawaii: 'HI', Idaho: 'ID', Illinois: 'IL', Indiana: 'IN', Iowa: 'IA', Kansas: 'KS', Kentucky: 'KY', Louisiana: 'LA', Maine: 'ME', Maryland: 'MD', Massachusetts: 'MA', Michigan: 'MI', Minnesota: 'MN', Mississippi: 'MS', Missouri: 'MO', Montana: 'MT', Nebraska: 'NE', Nevada: 'NV', 'New Hampshire': 'NH', 'New Jersey': 'NJ', 'New Mexico': 'NM', 'New York': 'NY', 'North Carolina': 'NC', 'North Dakota': 'ND', Ohio: 'OH', Oklahoma: 'OK', Oregon: 'OR', Pennsylvania: 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC', 'South Dakota': 'SD', Tennessee: 'TN', Texas: 'TX', Utah: 'UT', Vermont: 'VT', Virginia: 'VA', Washington: 'WA', 'West Virginia': 'WV', Wisconsin: 'WI', Wyoming: 'WY'
              }
              const abbr = nameToAbbr[name] || ''
              const val = getValue(abbr, metric)
              return {
                fillColor: getChoroplethColor(val, metric),
                weight: 1,
                opacity: 1,
                color: '#ffffff',
                fillOpacity: 0.8
              }
            }}
            onEachFeature={(feature, layer) => {
              const name: any = (feature as any)?.properties?.name || ''
              const nameToAbbr: Record<string, string> = {
                Alabama: 'AL', Alaska: 'AK', Arizona: 'AZ', Arkansas: 'AR', California: 'CA', Colorado: 'CO', Connecticut: 'CT', Delaware: 'DE', Florida: 'FL', Georgia: 'GA', Hawaii: 'HI', Idaho: 'ID', Illinois: 'IL', Indiana: 'IN', Iowa: 'IA', Kansas: 'KS', Kentucky: 'KY', Louisiana: 'LA', Maine: 'ME', Maryland: 'MD', Massachusetts: 'MA', Michigan: 'MI', Minnesota: 'MN', Mississippi: 'MS', Missouri: 'MO', Montana: 'MT', Nebraska: 'NE', Nevada: 'NV', 'New Hampshire': 'NH', 'New Jersey': 'NJ', 'New Mexico': 'NM', 'New York': 'NY', 'North Carolina': 'NC', 'North Dakota': 'ND', Ohio: 'OH', Oklahoma: 'OK', Oregon: 'OR', Pennsylvania: 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC', 'South Dakota': 'SD', Tennessee: 'TN', Texas: 'TX', Utah: 'UT', Vermont: 'VT', Virginia: 'VA', Washington: 'WA', 'West Virginia': 'WV', Wisconsin: 'WI', Wyoming: 'WY'
              }
              const abbr = nameToAbbr[name] || ''
              const val = getValue(abbr, metric)
              const cust = getValue(abbr, 'customers')
              const sales = getValue(abbr, 'sales')
              layer.bindPopup(`
                <div class="p-2">
                  <h3 class="font-bold text-lg text-gray-900 mb-2">${name} (${abbr || 'N/A'})</h3>
                  <div class="space-y-1 text-sm">
                    <p class="text-gray-600"><span class="font-medium">Customers:</span> ${cust.toLocaleString()}</p>
                    <p class="text-gray-600"><span class="font-medium">Total Sales:</span> $${Number(sales).toLocaleString()}</p>
                  </div>
                </div>
              `)
            }}
          />
        )}

        {/* Customer points layer */}
        {aggregation === 'customer' && (
          <>
            {console.log('Rendering customer points:', customerPoints.length, customerPoints)}
            {customerPoints.map((p, idx) => (
              <Marker key={idx} position={[p.lat, p.lng]} icon={createCustomIcon(14, '#0ea5e9')}>
                <Popup>
                  <div className="p-3 min-w-[250px]">
                    <h3 className="font-bold text-lg text-gray-900 mb-2">{p.name}</h3>
                    <div className="space-y-1">
                      {p.address && (
                        <p className="text-sm text-gray-700 font-medium">{p.address}</p>
                      )}
                      <p className="text-sm text-gray-600">{p.city}, {p.state} {p.zip}</p>
                      <p className="text-sm text-gray-600 mt-2">
                        <span className="font-medium">Total Sales:</span> ${p.totalSales.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </>
        )}

        {/* Bubble layer */}
        {aggregation === 'state' && mode === 'bubbles' && (
          <>
            {locationData.map((location, index) => {
              const size = Math.max(20, (location.customerCount / maxCustomers) * 50)
              return (
                <Marker
                  key={index}
                  position={[location.coordinates.lat, location.coordinates.lng]}
                  icon={createCustomIcon(size)}
                >
                  <Popup>
                    <div className="p-2">
                      <h3 className="font-bold text-lg text-gray-900 mb-2">{location.state}</h3>
                      <div className="space-y-1 text-sm">
                        <p className="text-gray-600">
                          <span className="font-medium">Customers:</span> {location.customerCount}
                        </p>
                        <p className="text-gray-600">
                          <span className="font-medium">Total Sales:</span> ${location.totalSales.toLocaleString()}
                        </p>
                        <p className="text-gray-600">
                          <span className="font-medium">Avg per Customer:</span> ${Math.round(location.totalSales / Math.max(location.customerCount,1)).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              )
            })}
          </>
        )}
        
        <FitBoundsToPoints points={fitPoints} />
      </MapContainer>
    </div>
  )
}
