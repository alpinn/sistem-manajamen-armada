import { describe, expect, it } from 'vitest'
import { ApiError } from '@/services/apiClient.ts'
import { errorMessage } from './error.ts'

describe('errorMessage', () => {
  it.each([
    [new ApiError(429), /membatasi permintaan/],
    [new ApiError(404), /tidak ditemukan/],
    [new ApiError(500), /Server MBTA sedang bermasalah/],
    [new ApiError(503), /Server MBTA sedang bermasalah/],
    [new TypeError('Failed to fetch'), /koneksi internet/],
    [new ApiError(400), /kesalahan yang tidak terduga/],
    ['boom', /kesalahan yang tidak terduga/],
  ])('explains %s in plain language', (error, message) => {
    expect(errorMessage(error)).toMatch(message)
  })
})
