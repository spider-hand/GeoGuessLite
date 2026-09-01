import { expect, it } from 'vitest'
import { render } from 'vitest-browser-vue'

import WithFriendsParticipantList from '@/components/pages/Game/WithFriendsParticipantList.vue'
import { createAppI18n } from '@/i18n'

it('should render the default state properly', async () => {
  const screen = await render(WithFriendsParticipantList, {
    props: {
      participants: [
        {
          userId: 'host',
          displayName: 'Host Player',
          country: 'JP',
          isConnected: true,
          isHost: true,
        },
        {
          userId: 'guest',
          displayName: 'Guest Player',
          country: 'US',
          isConnected: false,
          isHost: false,
        },
      ],
    },
    global: { plugins: [createAppI18n()] },
  })

  await expect.element(screen.getByRole('heading', { name: 'Players' })).toBeVisible()
  await expect.element(screen.getByText('2 / 100')).toBeVisible()
  await expect.element(screen.getByText('Host Player')).toBeVisible()
  await expect.element(screen.getByText('Guest Player')).toBeVisible()
  await expect.element(screen.getByText('Host', { exact: true })).toBeVisible()
  await expect.element(screen.getByText('Offline')).toBeVisible()
})
