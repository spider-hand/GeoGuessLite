import { nextTick } from 'vue'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-vue'

import CountdownTimer from '@/components/pages/Game/CountdownTimer.vue'

let nowMs = 0

beforeEach(() => {
  nowMs = 1_751_155_200_000
  vi.useFakeTimers()
  vi.setSystemTime(nowMs)
})

afterEach(() => {
  vi.useRealTimers()
})

it('should render the default state properly', async () => {
  const screen = await render(CountdownTimer, {
    props: { startedAtMs: nowMs },
  })

  await expect.element(screen.getByRole('timer')).toBeVisible()
  await expect.element(screen.getByText('01:00')).toBeVisible()

  await vi.advanceTimersByTimeAsync(51_000)
  await nextTick()
  await expect.element(screen.getByText('00:09')).toHaveClass('countdown-timer__value--danger')

  await vi.advanceTimersByTimeAsync(9_000)
  await nextTick()
  await expect.element(screen.getByText('00:00')).toBeVisible()
})
