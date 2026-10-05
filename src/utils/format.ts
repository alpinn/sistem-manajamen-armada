const OCCUPANCY: Record<string, string> = {
  EMPTY: 'Kosong',
  MANY_SEATS_AVAILABLE: 'Banyak kursi tersedia',
  FEW_SEATS_AVAILABLE: 'Sedikit kursi tersedia',
  STANDING_ROOM_ONLY: 'Hanya tempat berdiri',
  CRUSHED_STANDING_ROOM_ONLY: 'Sangat padat',
  FULL: 'Penuh',
  NOT_ACCEPTING_PASSENGERS: 'Tidak menerima penumpang',
  NO_DATA_AVAILABLE: 'Tidak ada data',
}

export const NOT_AVAILABLE = 'Tidak tersedia'

export function formatOccupancy(code: string | null) {
  return code ? (OCCUPANCY[code] ?? code) : NOT_AVAILABLE
}

export function formatSpeed(metersPerSecond: number | null) {
  return metersPerSecond === null
    ? NOT_AVAILABLE
    : `${(metersPerSecond * 3.6).toFixed(1)} km/jam`
}

const COMPASS = [
  'Utara',
  'Timur Laut',
  'Timur',
  'Tenggara',
  'Selatan',
  'Barat Daya',
  'Barat',
  'Barat Laut',
]

export function formatBearing(bearing: number | null) {
  if (bearing === null) return NOT_AVAILABLE
  return `${bearing}° (${COMPASS[Math.round(bearing / 45) % 8]})`
}

export function formatCoordinates(latitude: number, longitude: number) {
  return `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`
}

const relativeFormat = new Intl.RelativeTimeFormat('id', { numeric: 'auto' })
const dateTimeFormat = new Intl.DateTimeFormat('id', {
  dateStyle: 'medium',
  timeStyle: 'medium',
})

export function formatRelative(iso: string, now = Date.now()) {
  const seconds = Math.round((Date.parse(iso) - now) / 1000)
  const abs = Math.abs(seconds)
  if (abs < 60) return relativeFormat.format(seconds, 'second')
  if (abs < 3600)
    return relativeFormat.format(Math.round(seconds / 60), 'minute')
  if (abs < 86400)
    return relativeFormat.format(Math.round(seconds / 3600), 'hour')
  return relativeFormat.format(Math.round(seconds / 86400), 'day')
}

export function formatDateTime(iso: string) {
  return dateTimeFormat.format(new Date(iso))
}

export function isStale(iso: string, now = Date.now()) {
  return now - Date.parse(iso) > 5 * 60 * 1000
}
