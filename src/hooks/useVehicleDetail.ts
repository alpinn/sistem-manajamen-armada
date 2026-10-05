import { useQuery } from '@tanstack/react-query'
import { getVehicle } from '@/services/vehicleService.ts'

export function useVehicleDetail(id: string) {
  return useQuery({
    queryKey: ['vehicle', id],
    queryFn: ({ signal }) => getVehicle(id, signal),
  })
}
