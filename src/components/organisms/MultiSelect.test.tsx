import type {
  InfiniteData,
  UseInfiniteQueryResult,
} from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { ApiError } from '@/services/apiClient.ts'
import type { Option, OptionPage } from '@/types/mbta.ts'
import { MultiSelect } from './MultiSelect.tsx'

const OPTIONS: Option[] = [
  { id: 'Red', label: 'Red Line' },
  { id: 'Orange', label: 'Orange Line' },
]

function fakeQuery(overrides: Record<string, unknown> = {}) {
  return {
    data: { pages: [{ items: OPTIONS }], pageParams: [0] },
    error: null,
    isError: false,
    isLoading: false,
    isSuccess: true,
    isFetchNextPageError: false,
    isFetchingNextPage: false,
    hasNextPage: false,
    fetchNextPage: vi.fn(),
    refetch: vi.fn(),
    ...overrides,
  } as unknown as UseInfiniteQueryResult<InfiniteData<OptionPage>>
}

function Harness({
  query = fakeQuery(),
  disabled,
  helperText,
}: {
  query?: UseInfiniteQueryResult<InfiniteData<OptionPage>>
  disabled?: boolean
  helperText?: string
}) {
  const [selected, setSelected] = useState<Option[]>([])
  return (
    <MultiSelect
      label="Rute"
      placeholder="Semua rute"
      endText="Semua rute sudah ditampilkan"
      query={query}
      selected={selected}
      onChange={setSelected}
      disabled={disabled}
      helperText={helperText}
    />
  )
}

const trigger = () => screen.getByRole('button', { name: /^Rute/ })

describe('MultiSelect', () => {
  it('opens a listbox with the loaded options', async () => {
    const user = userEvent.setup()
    render(<Harness />)

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    await user.click(trigger())

    expect(trigger()).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('listbox')).toHaveAttribute(
      'aria-multiselectable',
      'true',
    )
    expect(screen.getAllByRole('option')).toHaveLength(2)
    expect(screen.getByText('Semua rute sudah ditampilkan')).toBeVisible()
  })

  it('toggles multiple options by click and Space', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    await user.click(trigger())
    const red = screen.getByRole('option', { name: 'Red Line' })
    const orange = screen.getByRole('option', { name: 'Orange Line' })
    await waitFor(() =>
      expect(
        screen.getByRole('searchbox', { name: 'Cari rute' }),
      ).toHaveFocus(),
    )
    await user.keyboard('{ArrowDown}')
    expect(red).toHaveFocus()

    await user.click(red)
    expect(red).toHaveAttribute('aria-selected', 'true')

    await user.keyboard('{ArrowDown} ')
    expect(orange).toHaveAttribute('aria-selected', 'true')
    expect(trigger()).toHaveTextContent('2 dipilih')

    await user.click(red)
    expect(red).toHaveAttribute('aria-selected', 'false')
    expect(trigger()).toHaveTextContent('1 dipilih')
  })

  it('closes on Escape and returns focus to the trigger', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    await user.click(trigger())
    await waitFor(() =>
      expect(
        screen.getByRole('searchbox', { name: 'Cari rute' }),
      ).toHaveFocus(),
    )

    await user.keyboard('{ArrowDown}{ArrowDown}')
    expect(screen.getByRole('option', { name: 'Orange Line' })).toHaveFocus()

    await user.keyboard('{Escape}')
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    expect(trigger()).toHaveFocus()
  })

  it('opens with ArrowDown and closes with Escape while still loading', async () => {
    const user = userEvent.setup()
    render(
      <Harness
        query={fakeQuery({
          data: undefined,
          isLoading: true,
          isSuccess: false,
        })}
      />,
    )
    trigger().focus()

    await user.keyboard('{ArrowDown}')
    expect(screen.getByText('Memuat…')).toBeVisible()

    await user.keyboard('{Escape}')
    expect(screen.queryByText('Memuat…')).not.toBeVisible()
  })

  it('keeps the panel open while tabbing inside and closes when focus leaves', async () => {
    const user = userEvent.setup()
    render(
      <>
        <Harness query={fakeQuery({ hasNextPage: true })} />
        <button type="button">Luar</button>
      </>,
    )
    await user.click(trigger())
    await waitFor(() =>
      expect(
        screen.getByRole('searchbox', { name: 'Cari rute' }),
      ).toHaveFocus(),
    )
    await user.keyboard('{ArrowDown}')

    await user.tab()
    expect(
      screen.getByRole('button', { name: 'Muat lebih banyak' }),
    ).toHaveFocus()
    expect(screen.getByRole('listbox')).toBeInTheDocument()

    await user.tab()
    expect(screen.getByRole('button', { name: 'Luar' })).toHaveFocus()
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('filters loaded options by search text and reports no matches', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    await user.click(trigger())
    const search = screen.getByRole('searchbox', { name: 'Cari rute' })

    await user.type(search, 'oran')
    expect(screen.getAllByRole('option')).toHaveLength(1)
    expect(screen.getByRole('option', { name: 'Orange Line' })).toBeVisible()

    await user.keyboard('{ArrowDown} ')
    expect(trigger()).toHaveTextContent('1 dipilih')

    await user.click(search)
    await user.clear(search)
    await user.type(search, 'blue')
    expect(screen.queryAllByRole('option')).toHaveLength(0)
    expect(
      screen.getByText(/Tidak ada rute yang cocok dengan “blue”/),
    ).toBeVisible()
  })

  it('returns to the search box with ArrowUp from the first option', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    await user.click(trigger())
    const search = screen.getByRole('searchbox', { name: 'Cari rute' })
    await waitFor(() => expect(search).toHaveFocus())

    await user.keyboard('{ArrowDown}{ArrowUp}')
    expect(search).toHaveFocus()
  })

  it('closes on an outside pointer click', async () => {
    const user = userEvent.setup()
    render(
      <>
        <Harness />
        <p>Di luar</p>
      </>,
    )
    await user.click(trigger())
    expect(screen.getByRole('listbox')).toBeInTheDocument()

    await user.click(screen.getByText('Di luar'))
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('is disabled with an explanatory helper text', () => {
    render(<Harness disabled helperText="Pilih rute terlebih dahulu" />)

    expect(trigger()).toBeDisabled()
    expect(trigger()).toHaveAccessibleDescription('Pilih rute terlebih dahulu')
  })

  it('loads more options on demand', async () => {
    const user = userEvent.setup()
    const query = fakeQuery({ hasNextPage: true })
    render(<Harness query={query} />)
    await user.click(trigger())

    await user.click(screen.getByRole('button', { name: 'Muat lebih banyak' }))

    expect(query.fetchNextPage).toHaveBeenCalled()
  })

  it('shows a friendly error with a retry action', async () => {
    const user = userEvent.setup()
    const query = fakeQuery({
      data: undefined,
      isError: true,
      isSuccess: false,
      error: new ApiError(503),
    })
    render(<Harness query={query} />)
    await user.click(trigger())

    expect(
      screen.getByText(
        'Server MBTA sedang bermasalah. Coba beberapa saat lagi.',
      ),
    ).toBeVisible()
    await user.click(screen.getByRole('button', { name: 'Coba lagi' }))

    expect(query.refetch).toHaveBeenCalled()
  })
})
