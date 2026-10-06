import { describe, expect, it } from 'vitest'
import { offsetFromLink } from './apiClient.ts'

describe('offsetFromLink', () => {
  it('reads literal and URL-encoded page[offset]', () => {
    expect(
      offsetFromLink(
        'https://api-v3.mbta.com/vehicles?page[limit]=12&page[offset]=36',
      ),
    ).toBe(36)
    expect(
      offsetFromLink(
        'https://api-v3.mbta.com/vehicles?page%5Blimit%5D=12&page%5Boffset%5D=228',
      ),
    ).toBe(228)
  })

  it('returns undefined without a link', () => {
    expect(offsetFromLink(undefined)).toBeUndefined()
  })

  it('returns undefined when the link has no page[offset]', () => {
    expect(
      offsetFromLink('https://api-v3.mbta.com/vehicles?page[limit]=12'),
    ).toBeUndefined()
  })
})
