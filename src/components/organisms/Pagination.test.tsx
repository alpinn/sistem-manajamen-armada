import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Pagination } from './Pagination.tsx'

function setup(page: number, pageCount = 20) {
  const onPageChange = vi.fn()
  const onPageSizeChange = vi.fn()
  render(
    <Pagination
      page={page}
      pageCount={pageCount}
      pageSize={12}
      from={(page - 1) * 12 + 1}
      to={page * 12}
      total={240}
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
    />,
  )
  return { onPageChange, onPageSizeChange }
}

describe('Pagination', () => {
  it('shows the data range and page position', () => {
    setup(1)

    expect(
      screen.getByRole('navigation', { name: 'Navigasi halaman' }),
    ).toHaveTextContent('Menampilkan 1–12 dari 240 kendaraan')
    expect(screen.getByText('Halaman 1 dari 20')).toBeInTheDocument()
  })

  it('marks the current page and disables "previous" on the first page', () => {
    setup(1)

    expect(screen.getByRole('button', { name: 'Halaman 1' })).toHaveAttribute(
      'aria-current',
      'page',
    )
    expect(
      screen.getByRole('button', { name: 'Halaman 2' }),
    ).not.toHaveAttribute('aria-current')
    expect(screen.getByRole('button', { name: 'Sebelumnya' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Berikutnya' })).toBeEnabled()
  })

  it('disables "next" on the last page', () => {
    setup(20)

    expect(screen.getByRole('button', { name: 'Berikutnya' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Sebelumnya' })).toBeEnabled()
  })

  it('reports page and page-size changes', async () => {
    const user = userEvent.setup()
    const { onPageChange, onPageSizeChange } = setup(10)

    await user.click(screen.getByRole('button', { name: 'Halaman 11' }))
    await user.click(screen.getByRole('button', { name: 'Berikutnya' }))
    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Per halaman' }),
      '48',
    )

    expect(onPageChange.mock.calls).toEqual([[11], [11]])
    expect(onPageSizeChange).toHaveBeenCalledWith(48)
  })
})
