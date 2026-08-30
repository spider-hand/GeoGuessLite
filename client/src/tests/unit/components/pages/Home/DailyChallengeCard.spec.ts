import { describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-vue'

import DailyChallengeCard from '@/components/pages/Home/DailyChallengeCard.vue'
import { createAppI18n } from '@/i18n'

describe('DailyChallengeCard', () => {
  it('should render the default state properly', async () => {
    const screen = await render(DailyChallengeCard, {
      props: { disabled: false, isStartingChallenge: false, status: 'available' },
      global: { plugins: [createAppI18n()] },
    })

    await expect.element(screen.getByRole('heading', { name: 'Daily Challenge' })).toBeVisible()
    await expect.element(screen.getByRole('button', { name: 'Start Game' })).toBeEnabled()
  })

  it('should emit the start action', async () => {
    const screen = await render(DailyChallengeCard, {
      props: { disabled: false, isStartingChallenge: false, status: 'available' },
      global: { plugins: [createAppI18n()] },
    })

    await screen.getByRole('button', { name: 'Start Game' }).click()

    expect(screen.emitted('startDailyChallenge')).toHaveLength(1)
  })

  it('should disable the start action when disabled', async () => {
    const screen = await render(DailyChallengeCard, {
      props: { disabled: true, isStartingChallenge: false, status: 'available' },
      global: { plugins: [createAppI18n()] },
    })

    await expect.element(screen.getByRole('button', { name: 'Start Game' })).toBeDisabled()
  })

  it('should show the already played state properly', async () => {
    const screen = await render(DailyChallengeCard, {
      props: { disabled: false, isStartingChallenge: false, status: 'completed' },
      global: { plugins: [createAppI18n()] },
    })

    const button = screen.getByRole('button', { name: 'Already Played Today' })

    await expect.element(button).toBeDisabled()
    await button.click({ force: true })
    expect(screen.emitted('startDailyChallenge')).toBeUndefined()
  })
})
