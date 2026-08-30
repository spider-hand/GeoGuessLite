import { beforeEach, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-vue'

import GameMap from '@/components/pages/Game/GameMap.vue'

const mapboxMockState = vi.hoisted(() => ({
  maps: [] as Array<{
    jumpTo: ReturnType<typeof vi.fn>
    options: { center: [number, number]; zoom: number }
    remove: ReturnType<typeof vi.fn>
  }>,
}))

vi.mock('mapbox-gl', () => {
  class MockMap {
    jumpTo = vi.fn()
    remove = vi.fn()
    options: { center: [number, number]; zoom: number }

    constructor(options: { center: [number, number]; zoom: number }) {
      this.options = options
      mapboxMockState.maps.push(this)
    }

    on = vi.fn()
  }

  return { default: { accessToken: '', Map: MockMap } }
})

beforeEach(() => {
  mapboxMockState.maps.length = 0
})

it('should render the default state properly', async () => {
  const screen = await render(GameMap, {
    props: { center: [139.6917, 35.6895], isSelectable: true, markers: [], zoom: 10 },
  })

  await expect.element(screen.getByTestId('game-map')).toBeVisible()
  expect(mapboxMockState.maps[0]?.options.center).toEqual([139.6917, 35.6895])
  expect(mapboxMockState.maps[0]?.options.zoom).toBe(10)
})
