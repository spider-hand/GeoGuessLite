import { setup } from '@storybook/vue3-vite'
import type { Preview } from '@storybook/vue3-vite'
import { VueQueryPlugin } from '@tanstack/vue-query'
import { VueFire, VueFireAuth } from 'vuefire'
import { sb } from 'storybook/test'
import { appI18n } from '../src/i18n'
import { firebaseApp } from '../src/lib/firebase'
import router from '../src/router'
import 'mapbox-gl/dist/mapbox-gl.css'
import '../src/main.css'

sb.mock(import('../src/composables/useAuth.ts'), { spy: true })
sb.mock(import('../src/composables/useDailyChallengeHistoryQuery.ts'), { spy: true })
sb.mock(import('../src/composables/useDailyChallengeLeaderboardQuery.ts'), { spy: true })
sb.mock(import('../src/composables/useSinglePlayerGamesQuery.ts'), { spy: true })
sb.mock(import('../src/composables/useUserQuery.ts'), { spy: true })
sb.mock(import('../src/composables/useWithFriendsGamesQuery.ts'), { spy: true })

setup((app) => {
  app.use(VueQueryPlugin)
  app.use(appI18n)
  app.use(VueFire, { firebaseApp, modules: [VueFireAuth()] })
  app.use(router)
})

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      test: 'todo',
    },
  },
}

export default preview
