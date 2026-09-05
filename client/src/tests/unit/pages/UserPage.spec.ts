import { expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-vue'

import { createAppI18n } from '@/i18n'

vi.mock('@/components/pages/User/UserProfileSection.vue', () => ({
  default: { template: '<section>Profile section</section>' },
}))
vi.mock('@/components/pages/User/SinglePlayerGamesSection.vue', () => ({
  default: { template: '<section>Single player section</section>' },
}))
vi.mock('@/components/pages/User/FriendsGamesSection.vue', () => ({
  default: { template: '<section>Friends section</section>' },
}))
vi.mock('@/components/pages/User/DailyChallengeSection.vue', () => ({
  default: { template: '<section>Daily section</section>' },
}))
vi.mock('@/components/shared/NavigationHeader.vue', () => ({ default: { template: '<header />' } }))
vi.mock('@/components/shared/NavigationFooter.vue', () => ({ default: { template: '<footer />' } }))

const UserPage = (await import('@/pages/UserPage.vue')).default
const renderPage = () => render(UserPage, { global: { plugins: [createAppI18n()] } })

it('should render the default state properly', async () => {
  const screen = renderPage()

  await expect
    .element(screen.getByRole('tab', { name: 'Profile' }))
    .toHaveAttribute('aria-selected', 'true')
  await expect.element(screen.getByText('Profile section')).toBeVisible()
})

it.each([
  ['Single Player Games', 'Single player section'],
  ['Friends Games', 'Friends section'],
  ['Daily Challenge', 'Daily section'],
])('should select %s when it is clicked', async (tabName, sectionName) => {
  const screen = renderPage()

  await screen.getByRole('tab', { name: tabName }).click()

  await expect
    .element(screen.getByRole('tab', { name: tabName }))
    .toHaveAttribute('aria-selected', 'true')
  await expect.element(screen.getByText(sectionName)).toBeVisible()
})
