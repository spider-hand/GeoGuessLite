import { expect, it } from 'vitest'
import { render } from 'vitest-browser-vue'

import Avatar from '@/components/shared/Avatar.vue'

const renderAvatar = (name: string) => render(Avatar, { props: { name, size: 'md' } })

it('should render the default state properly', async () => {
  const screen = renderAvatar('Taylor Swift')

  await expect.element(screen.getByText('TS')).toBeVisible()
  await expect.element(screen.getByText('TS')).toHaveAttribute('aria-hidden', 'true')
})

it.each([
  { name: 'Taylor', initials: 'TA' },
  { name: 'Taylor Swift', initials: 'TS' },
  { name: 'Élodie Durand', initials: 'ÉD' },
])('should render the expected initials for $name', async ({ name, initials }) => {
  const screen = renderAvatar(name)

  await expect.element(screen.getByText(initials)).toBeVisible()
})

it('should render the neutral fallback for a blank name', async () => {
  const screen = renderAvatar('   ')
  const avatar = screen.getByText('?')

  await expect.element(avatar).toBeVisible()
  await expect.element(avatar).toHaveStyle({ backgroundColor: 'var(--surface-card-dark)' })
})
