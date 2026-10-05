export interface Resource<A> {
  id: string
  type: string
  attributes: A
  relationships?: Record<string, { data: { id: string; type: string } | null }>
}

export interface Links {
  first?: string
  last?: string
  next?: string
  prev?: string
}

export interface JsonApiDocument<D> {
  data: D
  included?: Resource<never>[]
  links?: Links
}

export interface VehicleAttributes {
  label: string
  latitude: number
  longitude: number
  bearing: number | null
  speed: number | null
  current_status: string | null
  occupancy_status: string | null
  direction_id: number | null
  updated_at: string
}

export interface Route {
  id: string
  color: string
  short_name: string
  long_name: string
  description: string
  direction_names: (string | null)[]
  direction_destinations: (string | null)[]
}

export interface Trip {
  id: string
  headsign: string
}

export interface Stop {
  id: string
  name: string
}

export interface Vehicle extends VehicleAttributes {
  id: string
  route?: Route
  trip?: Trip
  stop?: Stop
}

export interface VehiclePage {
  vehicles: Vehicle[]
  offset: number
  limit: number
  lastOffset: number
}

export interface Option {
  id: string
  label: string
  detail?: string
  color?: string
  routeId?: string
}

export interface OptionPage {
  items: Option[]
  nextOffset?: number
}
