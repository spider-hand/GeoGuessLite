import { createMemoryHistory, createRouter } from 'vue-router'
import { expect, it } from 'vitest'
import { render } from 'vitest-browser-vue'

import NavigationFooter from '@/components/shared/NavigationFooter.vue'
import { createAppI18n } from '@/i18n'

it('should render the default state properly', async () => {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: { template: '<div />' } },
      { path: '/privacy', component: { template: '<div />' } },
      { path: '/terms', component: { template: '<div />' } },
    ],
  })
  const screen = render(NavigationFooter, { global: { plugins: [router, createAppI18n()] } })

  await expect
    .element(screen.getByText(String(new Date().getFullYear()), { exact: false }))
    .toBeVisible()
  await expect
    .element(screen.getByRole('link', { name: 'Privacy' }))
    .toHaveAttribute('href', '/privacy')
  await expect
    .element(screen.getByRole('link', { name: 'Terms' }))
    .toHaveAttribute('href', '/terms')
  await expect
    .element(screen.getByRole('link', { name: 'Contact' }))
    .toHaveAttribute('href', 'mailto:creative.spider.hand@gmail.com')
})
