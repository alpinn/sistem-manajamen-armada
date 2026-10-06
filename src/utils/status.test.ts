import { describe, expect, it } from 'vitest'
import { getStatus } from './status.ts'

describe('getStatus', () => {
  it.each([
    ['IN_TRANSIT_TO', 'Menuju halte'],
    ['INCOMING_AT', 'Segera tiba'],
    ['STOPPED_AT', 'Berhenti di halte'],
    [null, 'Tidak diketahui'],
    ['SOMETHING_NEW', 'Tidak diketahui'],
  ])('maps %s to "%s"', (code, label) => {
    expect(getStatus(code).label).toBe(label)
  })
})
