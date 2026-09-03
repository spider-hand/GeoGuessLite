import { expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-vue'

import GameMapContainer from '@/components/pages/Game/GameMapContainer.vue'
import { createAppI18n } from '@/i18n'

vi.mock('@/components/pages/Game/GameMapModal.vue', () => ({
  default: {
    props: ['isOpen'],
    emits: ['open', 'close', 'select'],
    template: `<div>
      <button v-if="!isOpen" @click="$emit('open')">Show map</button>
      <div v-else role="dialog" aria-label="Show map">
        <button @click="$emit('close')">Close map</button>
        <button @click="$emit('select', [139.7, 35.6])">Select Tokyo</button>
        <slot />
      </div>
    </div>`,
  },
}))

const renderContainer = (
  props: Partial<{
    isSubmitted: boolean
    isSubmitting: boolean
    playerName: string
    selection: [number, number] | null
  }> = {},
) =>
  render(GameMapContainer, {
    props: {
      isSubmitted: false,
      isSubmitting: false,
      playerName: 'Guest',
      selection: null,
      ...props,
    },
    global: { plugins: [createAppI18n()] },
  })

it('should render the default state properly', async () => {
  const screen = renderContainer()

  await expect.element(screen.getByRole('button', { name: 'Show map' })).toBeVisible()
})

it('should enable and emit submit after a location is selected', async () => {
  const screen = renderContainer({ selection: [139.7, 35.6] })

  await screen.getByRole('button', { name: 'Show map' }).click()
  const submit = screen.getByRole('button', { name: 'Make Guess' })
  await expect.element(submit).toBeEnabled()
  await submit.click()

  expect(screen.emitted('submit')).toEqual([[]])
})

it('should forward map selections', async () => {
  const screen = renderContainer()

  await screen.getByRole('button', { name: 'Show map' }).click()
  await screen.getByRole('button', { name: 'Select Tokyo' }).click()

  expect(screen.emitted('select')).toEqual([[[139.7, 35.6]]])
})

it.each([
  [
    'submitting',
    { isSubmitting: true, selection: [139.7, 35.6] as [number, number] },
    'Submitting…',
  ],
  ['submitted', { isSubmitted: true, selection: [139.7, 35.6] as [number, number] }, 'Submitted'],
] as const)('should show the %s state', async (_, props, label) => {
  const screen = renderContainer(props)

  await screen.getByRole('button', { name: 'Show map' }).click()
  await expect.element(screen.getByRole('button', { name: label })).toBeDisabled()
})

it('should open and close the map dialog', async () => {
  const screen = renderContainer()

  await screen.getByRole('button', { name: 'Show map' }).click()
  await expect.element(screen.getByRole('dialog', { name: 'Show map' })).toBeVisible()

  await screen.getByRole('button', { name: 'Close map' }).click()
  await expect.element(screen.getByRole('dialog')).not.toBeInTheDocument()
})
