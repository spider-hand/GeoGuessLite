import { expect, it } from 'vitest'

import { recentUtcDates } from '@/utils/date'

it('should return consecutive UTC dates across month boundaries', () => {
  expect(
    recentUtcDates(3, new Date('2026-03-01T23:00:00-08:00')).map((date) => date.toISOString()),
  ).toEqual(['2026-03-02T00:00:00.000Z', '2026-03-01T00:00:00.000Z', '2026-02-28T00:00:00.000Z'])
})
