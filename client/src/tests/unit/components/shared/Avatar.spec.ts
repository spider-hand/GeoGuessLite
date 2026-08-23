import { expect, it } from 'vitest'
import { render } from 'vitest-browser-vue'

import Avatar from '@/components/shared/Avatar.vue'

const renderAvatar = (name: string) =>
  render(Avatar, {
    props: { name, size: 'md' },
  })

const getAvatarStyle = (name: string) =>
  renderAvatar(name).container.querySelector('.avatar')?.getAttribute('style')

it.each([
  { name: 'Taylor Swift', initials: 'TS' },
  { name: 'Taylor', initials: 'TA' },
  { name: '', initials: '?' },
])('should render $initials for $name', async ({ name, initials }) => {
  const { getByText } = renderAvatar(name)

  await expect.element(getByText(initials)).toBeInTheDocument()
})

it('should use the same background for the same normalized name', () => {
  expect(getAvatarStyle('Taylor Swift')).toBe(getAvatarStyle('  taylor swift  '))
})

it('should use different generated backgrounds for different names', () => {
  expect(getAvatarStyle('Taylor Swift')).not.toBe(getAvatarStyle('Olivia Rodrigo'))
})

it('should keep the neutral fallback background for a blank name', () => {
  expect(getAvatarStyle('')).toContain('var(--surface-card-dark)')
})
