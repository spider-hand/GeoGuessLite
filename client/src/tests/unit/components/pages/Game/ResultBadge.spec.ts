import { expect, it } from 'vitest'
import { render } from 'vitest-browser-vue'

import ResultBadge from '@/components/pages/Game/ResultBadge.vue'
import { createAppI18n } from '@/i18n'

it.each([
  ['won', 'You Win', 'result-badge--won'],
  ['lost', 'You Lose', 'result-badge--lost'],
] as const)('should render the %s result visibly', async (result, label, className) => {
  const screen = await render(ResultBadge, {
    props: { result },
    global: { plugins: [createAppI18n()] },
  })

  await expect.element(screen.getByText(label)).toHaveClass(className)
})
