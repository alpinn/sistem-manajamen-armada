const BASE_URL = 'https://api-v3.mbta.com'
const API_KEY = import.meta.env.VITE_MBTA_API_KEY

export class ApiError extends Error {
  readonly status: number

  constructor(status: number) {
    super(`HTTP ${status}`)
    this.name = 'ApiError'
    this.status = status
  }
}

type Params = Record<string, string | undefined>

export async function fetchJson<T>(
  path: string,
  params: Params,
  signal?: AbortSignal,
): Promise<T> {
  const url = new URL(path, BASE_URL)
  for (const [key, value] of Object.entries(params)) {
    if (value) url.searchParams.set(key, value)
  }
  const response = await fetch(url, {
    signal,
    headers: API_KEY ? { 'x-api-key': API_KEY } : undefined,
  })
  if (!response.ok) throw new ApiError(response.status)
  return response.json() as Promise<T>
}

export function offsetFromLink(link: string | undefined): number | undefined {
  if (!link) return undefined
  const raw = new URL(link).searchParams.get('page[offset]')
  const value = Number(raw)
  return raw && Number.isFinite(value) ? value : undefined
}
