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
        { path: '/game/single-player', component: HomePage },
        { path: '/game/daily-challenge', component: HomePage },
        { path: '/game/with-friends/:gameId', component: HomePage },
        { path: '/game/random-match', component: HomePage },
      ],
    })

    await router.push('/')
    await router.isReady()

    const { container, getByRole } = render(HomePage, {
      global: { plugins: [router, createAppI18n()] },
    })

    await expect.element(getByRole('img', { name: 'Hero Image' })).toBeVisible()
    expect(
      Array.from(container.querySelectorAll('h2'), (heading) => heading.textContent?.trim()),
    ).toEqual(['Single Player', 'Play with Friends', 'Daily Challenge', 'Random Match'])
    expect(container.textContent).not.toContain('Play vs AI')
  })
})
