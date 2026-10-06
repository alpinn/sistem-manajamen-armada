import { describe, expect, it } from 'vitest'
import { isStale } from './format.ts'

describe('isStale', () => {
  const now = Date.parse('2026-01-01T12:05:00Z')

  it('flags data older than five minutes only', () => {
    expect(isStale('2026-01-01T12:00:00Z', now)).toBe(false)
    expect(isStale('2026-01-01T11:59:59Z', now)).toBe(true)
  })
})
