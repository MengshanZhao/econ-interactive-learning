'use client'

import { useEffect, useRef, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix for default marker icons in Leaflet with Next.js
const DefaultIcon = L.icon({
  iconUrl: '/images/marker-icon.png',
  iconRetinaUrl: '/images/marker-icon-2x.png',
  shadowUrl: '/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

L.Marker.prototype.options.icon = DefaultIcon

type LatLngTuple = [number, number]

const locations: { name: string; coordinates: LatLngTuple; year: string; description: string }[] = [
  {
    name: 'Shenzhen, China',
    coordinates: [22.5431, 114.0579],
    year: '2019',
    description: 'Started my academic journey'
  },
  {
    name: 'UW-Madison',
    coordinates: [43.0766, -89.4125],
    year: '2019-2021',
    description: 'Master\'s in Agriculture and Applied Economics'
  },
  {
    name: 'WSU Pullman',
    coordinates: [46.7319, -117.1542],
    year: '2021-Present',
    description: 'PhD in Agricultural Economics'
  }
]

export default function JourneyMap() {
  const mapRef = useRef<L.Map>(null)
  const [animatedLine, setAnimatedLine] = useState<LatLngTuple[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (mapRef.current) {
      // Fit bounds to show all markers
      const bounds = L.latLngBounds(locations.map(loc => loc.coordinates))
      mapRef.current.fitBounds(bounds, { padding: [50, 50] })
    }
  }, [])

  useEffect(() => {
    const animateLine = () => {
      if (currentIndex < locations.length - 1) {
        const start = locations[currentIndex].coordinates
        const end = locations[currentIndex + 1].coordinates
        
        // Create intermediate points for smooth animation
        const steps = 50
        const latStep = (end[0] - start[0]) / steps
        const lngStep = (end[1] - start[1]) / steps
        
        let currentStep = 0
        const interval = setInterval(() => {
          if (currentStep <= steps) {
            const currentLat = start[0] + (latStep * currentStep)
            const currentLng = start[1] + (lngStep * currentStep)
            setAnimatedLine(prev => [...prev, [currentLat, currentLng] as LatLngTuple])
            currentStep++
          } else {
            clearInterval(interval)
            setCurrentIndex(prev => prev + 1)
          }
        }, 50)
        
        return () => clearInterval(interval)
      }
    }

    animateLine()
  }, [currentIndex])

  return (
    <div className="w-full h-[400px] rounded-lg overflow-hidden shadow-lg">
      <MapContainer
        center={[35, -100]}
        zoom={3}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {locations.map((location, index) => (
          <Marker
            key={location.name}
            position={location.coordinates}
          >
            <Popup>
              <div className="text-sm">
                <h3 className="font-bold">{location.name}</h3>
                <p className="text-gray-600">{location.year}</p>
                <p className="text-gray-600">{location.description}</p>
              </div>
            </Popup>
          </Marker>
        ))}
        <Polyline
          positions={animatedLine}
          color="#ffd700"
          weight={3}
          opacity={0.7}
        />
      </MapContainer>
    </div>
  )
} 