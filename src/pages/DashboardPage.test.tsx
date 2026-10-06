import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DashboardPage } from './DashboardPage.tsx'

vi.mock('@/components/organisms/VehicleMap.tsx', () => ({
  default: ({ label }: { label: string }) => (
    <div role="region" aria-label={`Peta lokasi kendaraan ${label}`} />
  ),
}))

const updatedAt = new Date().toISOString()

const vehicle = (id: string, label: string, status: string) => ({
  id,
  type: 'vehicle',
  attributes: {
    label,
    latitude: 42.35,
    longitude: -71.06,
    bearing: 90,
    speed: 10,
    current_status: status,
    occupancy_status: null,
    direction_id: 0,
    updated_at: updatedAt,
  },
  relationships: {
    route: { data: { id: 'Red', type: 'route' } },
    trip: { data: { id: 'trip-1', type: 'trip' } },
    stop: { data: { id: 'place-pktrm', type: 'stop' } },
  },
})

const VEHICLES = [
  vehicle('y1', '1234', 'IN_TRANSIT_TO'),
  vehicle('y2', '5678', 'STOPPED_AT'),
]

const DETAIL = {
  data: VEHICLES[0],
  included: [
    {
      id: 'Red',
      type: 'route',
      attributes: {
        color: 'DA291C',
        short_name: '',
        long_name: 'Red Line',
        description: 'Rapid Transit',
        direction_names: ['South', 'North'],
        direction_destinations: ['Ashmont/Braintree', 'Alewife'],
      },
    },
    { id: 'trip-1', type: 'trip', attributes: { headsign: 'Ashmont' } },
    { id: 'place-pktrm', type: 'stop', attributes: { name: 'Park Street' } },
  ],
}

let vehicleList: () => Response

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status })

beforeEach(() => {
  vehicleList = () => json({ data: VEHICLES })
  vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
    const { pathname } = new URL(String(input))
    if (pathname === '/vehicles') return vehicleList()
    if (pathname === '/vehicles/y1') return json(DETAIL)
    return json({ data: [] })
  })
})

afterEach(() => {
  vi.restoreAllMocks()
})

function renderPage() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  render(
    <QueryClientProvider client={client}>
      <DashboardPage />
    </QueryClientProvider>,
  )
}

describe('DashboardPage', () => {
  it('shows a loading state, then vehicle cards with pagination', async () => {
    renderPage()

    expect(screen.getByText('Memuat data kendaraan…')).toBeInTheDocument()

    const card = await screen.findByRole('button', {
      name: 'Kendaraan 1234, Menuju halte, lihat detail',
    })
    expect(within(card).getByText('1234')).toBeInTheDocument()
    expect(within(card).getByText('Menuju halte')).toBeInTheDocument()
    expect(within(card).getByText('42.35000, -71.06000')).toBeInTheDocument()
    expect(
      screen.getByRole('button', {
        name: 'Kendaraan 5678, Berhenti di halte, lihat detail',
      }),
    ).toBeInTheDocument()
    expect(screen.getByRole('navigation')).toHaveTextContent(
      'Menampilkan 1–2 dari 2 kendaraan',
    )
    expect(screen.queryByText('Memuat data kendaraan…')).not.toBeInTheDocument()
  })

  it('explains a server error and recovers on retry', async () => {
    const user = userEvent.setup()
    vehicleList = () => json({ errors: [] }, 500)
    renderPage()

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent(
      'Server MBTA sedang bermasalah. Coba beberapa saat lagi.',
    )

    vehicleList = () => json({ data: VEHICLES })
    await user.click(within(alert).getByRole('button', { name: 'Coba lagi' }))

    expect(
      await screen.findByRole('button', { name: /Kendaraan 1234/ }),
    ).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('opens a detail dialog with route and trip data', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(
      await screen.findByRole('button', { name: /Kendaraan 1234/ }),
    )

    const dialog = screen.getByRole('dialog', { name: 'Kendaraan 1234' })
    expect(
      within(dialog).getByRole('region', {
        name: 'Peta lokasi kendaraan 1234',
      }),
    ).toBeInTheDocument()
    expect(await within(dialog).findByText('Red Line')).toBeInTheDocument()
    expect(within(dialog).getByText('Ashmont')).toBeInTheDocument()
    expect(within(dialog).getByText('trip-1')).toBeInTheDocument()
    expect(within(dialog).getByText('Park Street')).toBeInTheDocument()
    expect(
      within(dialog).getByText('South – Ashmont/Braintree'),
    ).toBeInTheDocument()

    await user.click(within(dialog).getByRole('button', { name: 'Tutup' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Kendaraan 1234/ })).toHaveFocus()
  })

  it('shows an empty state when no vehicles match', async () => {
    vehicleList = () => json({ data: [] })
    renderPage()

    expect(
      await screen.findByText('Tidak ada kendaraan yang sedang beroperasi'),
    ).toBeInTheDocument()
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
  })
})
