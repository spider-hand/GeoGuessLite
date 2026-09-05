import { expect, it } from 'vitest'

import { countryFlagSrc } from '@/utils/game'

it.each([
  { countryCode: 'JP', expected: '/flags/jp.webp' },
  { countryCode: 'us', expected: '/flags/us.webp' },
])('should build the flag asset path for $countryCode', ({ countryCode, expected }) => {
  expect(countryFlagSrc(countryCode)).toBe(expected)
})
