import { describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-vue'

import PlayWithFriendsCard from '@/components/pages/Home/PlayWithFriendsCard.vue'
import { createAppI18n } from '@/i18n'

const defaultProps = {
  disabled: false,
  isCreatingRoom: false,
  isEnteringRoom: false,
}

describe('PlayWithFriendsCard', () => {
  it('should render the default state properly', async () => {
    const screen = await render(PlayWithFriendsCard, {
      props: defaultProps,
      global: { plugins: [createAppI18n()] },
    })

    await expect.element(screen.getByRole('heading', { name: 'Play with Friends' })).toBeVisible()
    await expect.element(screen.getByRole('button', { name: 'Create Room' })).toBeEnabled()
    await expect.element(screen.getByRole('button', { name: 'Enter Room' })).toBeDisabled()
  })

  it('should emit the create room action', async () => {
    const screen = await render(PlayWithFriendsCard, {
      props: defaultProps,
      global: { plugins: [createAppI18n()] },
    })

    await screen.getByRole('button', { name: 'Create Room' }).click()

    expect(screen.emitted('createFriendsRoom')).toHaveLength(1)
  })

  it('should emit the normalized room key when entering a room', async () => {
    const screen = await render(PlayWithFriendsCard, {
      props: defaultProps,
      global: { plugins: [createAppI18n()] },
    })
    const roomKeyInput = screen.getByPlaceholder('6-Digit Key')

    await roomKeyInput.fill('12a34')
    await expect.element(roomKeyInput).toHaveValue('1234')
    await roomKeyInput.fill('123456')
    await screen.getByRole('button', { name: 'Enter Room' }).click()

    expect(screen.emitted('enterFriendsRoom')).toEqual([['123456']])
  })

  it('should show an error for an invalid room key', async () => {
    const screen = await render(PlayWithFriendsCard, {
      props: defaultProps,
      global: { plugins: [createAppI18n()] },
    })

    await screen.getByPlaceholder('6-Digit Key').fill('123')

    await expect.element(screen.getByText('Enter a 6-digit key')).toBeVisible()
    await expect.element(screen.getByRole('button', { name: 'Enter Room' })).toBeDisabled()
  })

  it('should disable all actions when disabled', async () => {
    const screen = await render(PlayWithFriendsCard, {
      props: { ...defaultProps, disabled: true },
      global: { plugins: [createAppI18n()] },
    })

    await expect.element(screen.getByRole('button', { name: 'Create Room' })).toBeDisabled()
    await expect.element(screen.getByPlaceholder('6-Digit Key')).toBeDisabled()
    await expect.element(screen.getByRole('button', { name: 'Enter Room' })).toBeDisabled()
  })

  it.each([
    ['creating a room', { isCreatingRoom: true, isEnteringRoom: false }, 'Create Room'],
    ['entering a room', { isCreatingRoom: false, isEnteringRoom: true }, 'Enter Room'],
  ])('should show the loading state when %s', async (_, loadingProps, buttonName) => {
    const screen = await render(PlayWithFriendsCard, {
      props: { ...defaultProps, ...loadingProps },
      global: { plugins: [createAppI18n()] },
    })

    const button = screen.getByRole('button', { name: buttonName })

    await expect.element(button).toHaveAttribute('aria-busy', 'true')
    await expect.element(button).toBeDisabled()
  })
})
