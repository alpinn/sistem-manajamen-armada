import L from 'leaflet'
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png'
import iconUrl from 'leaflet/dist/images/marker-icon.png'
import shadowUrl from 'leaflet/dist/images/marker-shadow.png'
import 'leaflet/dist/leaflet.css'
import { useEffect } from 'react'
import { MapContainer, Marker, TileLayer, useMap } from 'react-leaflet'

delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl
L.Icon.Default.mergeOptions({ iconUrl, iconRetinaUrl, shadowUrl })

function SyncMap({
  latitude,
  longitude,
}: {
  latitude: number
  longitude: number
}) {
  const map = useMap()
  useEffect(() => {
    const frame = requestAnimationFrame(() => map.invalidateSize())
    return () => cancelAnimationFrame(frame)
  }, [map])
  useEffect(() => {
    map.setView([latitude, longitude])
  }, [map, latitude, longitude])
  return null
}

export default function VehicleMap({
  latitude,
  longitude,
  label,
}: {
  latitude: number
  longitude: number
  label: string
}) {
  return (
    <div
      role="region"
      aria-label={`Peta lokasi kendaraan ${label}`}
      className="relative z-0 h-60 overflow-hidden rounded-lg border border-border"
    >
      <MapContainer
        center={[latitude, longitude]}
        zoom={15}
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <Marker
          position={[latitude, longitude]}
          title={`Kendaraan ${label}`}
          alt={`Penanda kendaraan ${label}`}
        />
        <SyncMap latitude={latitude} longitude={longitude} />
      </MapContainer>
    </div>
  )
}
