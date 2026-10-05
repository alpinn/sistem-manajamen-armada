import { ApiError } from '@/services/apiClient.ts'

export function errorMessage(error: unknown) {
  if (error instanceof ApiError) {
    if (error.status === 429)
      return 'Server MBTA sedang membatasi permintaan. Tunggu sekitar 1 menit, lalu coba lagi.'
    if (error.status === 404)
      return 'Data tidak ditemukan. Kendaraan mungkin sudah tidak beroperasi.'
    if (error.status >= 500)
      return 'Server MBTA sedang bermasalah. Coba beberapa saat lagi.'
  }
  if (error instanceof TypeError)
    return 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.'
  return 'Terjadi kesalahan yang tidak terduga. Silakan coba lagi.'
}

export function errorDetail(error: unknown) {
  if (error instanceof ApiError) return `Kode status HTTP ${error.status}`
  return error instanceof Error ? error.message : String(error)
}
