import { createMemoryHistory, createRouter } from 'vue-router'
import { describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-vue'

import { createAppI18n } from '@/i18n'
import HomePage from '@/pages/HomePage.vue'

describe('HomePage', () => {
  it('should render the default state properly', async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', component: HomePage },
        { path: '/privacy', component: HomePage },
        { path: '/terms', component: HomePage },
        { path: '/game/vs-ai/:gameId', component: HomePage },
        { path: '/game/with-friends/:gameId', component: HomePage },
      ],
    })

    await router.push('/')
    await router.isReady()

    const { getByRole } = render(HomePage, {
      global: { plugins: [router, createAppI18n()] },
    })

    await expect.element(getByRole('img', { name: 'Hero Image' })).toBeVisible()
    await expect.element(getByRole('heading', { name: 'Play vs AI' })).toBeVisible()
  })
})
