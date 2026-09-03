import { nextTick } from 'vue'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-vue'

import CountdownTimer from '@/components/pages/Game/CountdownTimer.vue'

const nowMs = 1_751_155_200_000

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(nowMs)
})

afterEach(() => vi.useRealTimers())

it('should render the default state properly', async () => {
  const screen = render(CountdownTimer, { props: { startedAtMs: nowMs } })

  await expect.element(screen.getByRole('timer')).toBeVisible()
  await expect.element(screen.getByText('01:00')).toBeVisible()
})

it('should show the danger state during the final ten seconds', async () => {
  const screen = render(CountdownTimer, { props: { startedAtMs: nowMs } })

  await vi.advanceTimersByTimeAsync(51_000)
  await nextTick()

  await expect.element(screen.getByText('00:09')).toHaveClass('countdown-timer__value--danger')
})

it('should emit expired exactly once when time reaches zero', async () => {
  const screen = render(CountdownTimer, { props: { startedAtMs: nowMs } })

  await vi.advanceTimersByTimeAsync(61_000)
  await nextTick()

  expect(screen.emitted('expired')).toEqual([[]])
  await expect.element(screen.getByText('00:00')).toBeVisible()
})

it('should restart when the round start time changes', async () => {
  const screen = render(CountdownTimer, { props: { startedAtMs: nowMs } })
  await vi.advanceTimersByTimeAsync(60_000)

  await screen.rerender({ startedAtMs: nowMs + 60_000 })
  await nextTick()

  await expect.element(screen.getByText('01:00')).toBeVisible()
})
