import { beforeEach, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-vue'

import GameStreetView from '@/components/pages/Game/GameStreetView.vue'

const mapillaryMockState = vi.hoisted(() => ({
  viewers: [] as Array<{
    moveTo: ReturnType<typeof vi.fn>
    options: {
      accessToken: string
      component: { cover: boolean }
      container: HTMLElement
      imageId: string
    }
    remove: ReturnType<typeof vi.fn>
  }>,
}))

vi.mock('mapillary-js', () => {
  class MockViewer {
    moveTo = vi.fn(() => Promise.resolve())
    remove = vi.fn()
    options: {
      accessToken: string
      component: { cover: boolean }
      container: HTMLElement
      imageId: string
    }

    constructor(options: {
      accessToken: string
      component: { cover: boolean }
      container: HTMLElement
      imageId: string
    }) {
      this.options = options
      mapillaryMockState.viewers.push(this)
    }
  }

  return { Viewer: MockViewer }
})

beforeEach(() => {
  mapillaryMockState.viewers.length = 0
})

it('should render the default state properly', async () => {
  const screen = await render(GameStreetView, {
    props: { imageId: '524779645570864' },
  })

  await expect.element(screen.getByTestId('game-street-view')).toBeVisible()
  expect(mapillaryMockState.viewers[0]?.options.imageId).toBe('524779645570864')
  expect(mapillaryMockState.viewers[0]?.options.component.cover).toBe(false)

  await screen.rerender({ imageId: 'another-image' })
  expect(mapillaryMockState.viewers[0]?.moveTo).toHaveBeenCalledWith('another-image')

  screen.unmount()
  expect(mapillaryMockState.viewers[0]?.remove).toHaveBeenCalledOnce()
})
