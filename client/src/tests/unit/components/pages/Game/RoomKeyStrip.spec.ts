import { expect, it } from 'vitest'
import { render } from 'vitest-browser-vue'

import RoomKeyStrip from '@/components/pages/Game/RoomKeyStrip.vue'
import { createAppI18n } from '@/i18n'

it('should render the default state properly', async () => {
  const screen = await render(RoomKeyStrip, {
    props: { roomKey: '654321' },
    global: { plugins: [createAppI18n()] },
  })

  await expect.element(screen.getByLabelText('Room Key, 654321')).toBeVisible()
  await expect.element(screen.getByText('Room Key')).toBeVisible()
  await expect.element(screen.getByText('654321')).toBeVisible()
})
