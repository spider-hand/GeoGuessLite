import { beforeEach, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-vue'

import GameMap from '@/components/pages/Game/GameMap.vue'

const mapboxState = vi.hoisted(() => ({
  maps: [] as Array<{ events: Record<string, (event: unknown) => void> }>,
}))

vi.mock('mapbox-gl', () => {
  class MockMap {
    events: Record<string, (event: unknown) => void> = {}
    on = vi.fn((event: string, callback: (value: unknown) => void) => {
      this.events[event] = callback
    })
    isStyleLoaded = vi.fn(() => false)
    getSource = vi.fn()
    addSource = vi.fn()
    addLayer = vi.fn()
    jumpTo = vi.fn()
    remove = vi.fn()

    constructor() {
      mapboxState.maps.push(this)
    }
  }

  class MockMarker {
    setLngLat = vi.fn(() => this)
    addTo = vi.fn(() => this)
    remove = vi.fn()
  }

  return { default: { accessToken: '', Map: MockMap, Marker: MockMarker } }
})

beforeEach(() => {
  mapboxState.maps.length = 0
})

const renderMap = (isSelectable: boolean) =>
  render(GameMap, {
    props: { center: [139.6917, 35.6895], isSelectable, markers: [], zoom: 10 },
  })

it('should render the default state properly', async () => {
  const screen = renderMap(true)

  await expect.element(screen.getByTestId('game-map')).toBeVisible()
})

it.each([
  [true, [[[139.7, 35.6]]]],
  [false, undefined],
] as const)(
  'should emit selected coordinates only when selection is %s',
  async (isSelectable, emitted) => {
    const screen = renderMap(isSelectable)

    mapboxState.maps[0]!.events.click!({ lngLat: { lng: 139.7, lat: 35.6 } })

    expect(screen.emitted('select')).toEqual(emitted)
  },
)
