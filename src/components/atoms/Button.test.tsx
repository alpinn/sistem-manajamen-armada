import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Button } from './Button.tsx'

describe('Button', () => {
  it('defaults to type="button" and pads only solid variants', () => {
    render(
      <>
        <Button variant="secondary">Simpan</Button>
        <Button variant="secondary" size="sm" type="submit">
          Kirim
        </Button>
        <Button variant="ghost">Hapus</Button>
      </>,
    )

    const save = screen.getByRole('button', { name: 'Simpan' })
    const send = screen.getByRole('button', { name: 'Kirim' })
    const remove = screen.getByRole('button', { name: 'Hapus' })
    expect(save).toHaveAttribute('type', 'button')
    expect(save).toHaveClass('border-control', 'px-4')
    expect(send).toHaveAttribute('type', 'submit')
    expect(send).toHaveClass('px-3')
    expect(send).not.toHaveClass('px-4')
    expect(remove).not.toHaveClass('px-3', 'px-4')
  })
})
