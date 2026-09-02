import path from 'node:path'
import { playwright } from '@vitest/browser-playwright'
import vue from '@vitejs/plugin-vue'
import { configDefaults, defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [vue()],
  optimizeDeps: {
    include: ['@tanstack/vue-query', 'canvas-confetti'],
    exclude: ['fsevents', 'mapbox-gl', 'mapillary-js', 'playwright', 'playwright-core'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    setupFiles: ['./src/tests/setup.ts'],
    exclude: configDefaults.exclude,
    browser: {
      enabled: true,
      provider: playwright(),
      instances: [{ browser: 'chromium' }],
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json-summary'],
      reportsDirectory: './coverage',
      include: ['src/**/*.{ts,vue}'],
      exclude: ['src/tests/**', 'src/stories/**', 'src/services/**', 'vitest.shims.d.ts'],
    },
  },
})
