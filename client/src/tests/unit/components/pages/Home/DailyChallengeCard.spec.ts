import { describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-vue'

import DailyChallengeCard from '@/components/pages/Home/DailyChallengeCard.vue'
import { createAppI18n } from '@/i18n'

describe('DailyChallengeCard', () => {
  it('should render the default state properly', async () => {
    const screen = await render(DailyChallengeCard, {
      props: {
        disabled: false,
        isLoadingUser: false,
        isStartingChallenge: false,
        status: 'available',
      },
      global: { plugins: [createAppI18n()] },
    })

    await expect.element(screen.getByRole('heading', { name: 'Daily Challenge' })).toBeVisible()
    await expect.element(screen.getByRole('button', { name: 'Start Game' })).toBeEnabled()
  })

  it('should emit the start action when available', async () => {
    const screen = await render(DailyChallengeCard, {
      props: {
        disabled: false,
        isLoadingUser: false,
        isStartingChallenge: false,
        status: 'available',
      },
      global: { plugins: [createAppI18n()] },
    })

    await screen.getByRole('button', { name: 'Start Game' }).click()

    expect(screen.emitted('startDailyChallenge')).toHaveLength(1)
  })

  it.each([
    ['available', 'Start Game', false],
    ['ongoing', 'Continue Challenge', false],
    ['completed', 'Already Played Today', true],
    ['unavailable', 'Unavailable Today', true],
  ] as const)(
    'should show the correct action for the %s challenge status',
    async (status, label, disabled) => {
      const screen = await render(DailyChallengeCard, {
        props: { disabled: false, isLoadingUser: false, isStartingChallenge: false, status },
        global: { plugins: [createAppI18n()] },
      })

      await expect.element(screen.getByRole('button', { name: label })).toBeInTheDocument()
      expect(screen.container.querySelector('button')?.disabled).toBe(disabled)
    },
  )

  it.each(['completed', 'unavailable'] as const)(
    'should prevent starting a %s challenge',
    async (status) => {
      const screen = await render(DailyChallengeCard, {
        props: { disabled: false, isLoadingUser: false, isStartingChallenge: false, status },
        global: { plugins: [createAppI18n()] },
      })

      await screen.getByRole('button').click({ force: true })
      expect(screen.emitted('startDailyChallenge')).toBeUndefined()
    },
  )

  it('should expose the start action as loading', async () => {
    const screen = await render(DailyChallengeCard, {
      props: {
        disabled: false,
        isLoadingUser: false,
        isStartingChallenge: true,
        status: 'available',
      },
      global: { plugins: [createAppI18n()] },
    })

    const button = screen.getByRole('button', { name: 'Start Game' })
    await expect.element(button).toBeDisabled()
    await expect.element(button).toHaveAttribute('aria-busy', 'true')
  })

  it('should expose the start action as loading while user information loads', async () => {
    const screen = await render(DailyChallengeCard, {
      props: {
        disabled: true,
        isLoadingUser: true,
        isStartingChallenge: false,
        status: 'available',
      },
      global: { plugins: [createAppI18n()] },
    })

    await expect
      .element(screen.getByRole('button', { name: 'Start Game' }))
      .toHaveAttribute('aria-busy', 'true')
  })
})
