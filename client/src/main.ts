import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { VueFire, VueFireAuth } from 'vuefire'
import { VueQueryPlugin } from '@tanstack/vue-query'
import './main.css'

import App from './App.vue'
import { appI18n } from './i18n'
import router from './router'
import { firebaseApp } from './lib/firebase'

const app = createApp(App)

app.use(createPinia())
app.use(appI18n)
app.use(router)
app.use(VueQueryPlugin)

app.use(VueFire, {
  firebaseApp,
  modules: [VueFireAuth()],
})

app.mount('#app')
