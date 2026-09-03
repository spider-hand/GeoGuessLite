import { nextTick } from 'vue'
import { beforeEach, expect, it } from 'vitest'
import { render } from 'vitest-browser-vue'

import LanguageSelector from '@/components/shared/LanguageSelector.vue'
import { createAppI18n, LOCALE_STORAGE_KEY } from '@/i18n'

beforeEach(() => localStorage.clear())

const renderSelector = () => {
  const i18n = createAppI18n()
  return { i18n, screen: render(LanguageSelector, { global: { plugins: [i18n] } }) }
}

it('should render the default state properly', async () => {
  const { screen } = renderSelector()

  await expect.element(screen.getByRole('button', { name: 'Language' })).toBeVisible()
  await expect.element(screen.getByRole('menu')).not.toBeInTheDocument()
})

it('should show the supported languages and identify the current language', async () => {
  const { screen } = renderSelector()

  await screen.getByRole('button', { name: 'Language' }).click()

  await expect
    .element(screen.getByRole('menu', { name: 'Supported languages. Current selection: English' }))
    .toBeVisible()
  await expect
    .element(screen.getByRole('menuitemradio', { name: /English/ }))
    .toHaveAttribute('aria-checked', 'true')
  expect(screen.getByRole('menuitemradio').all()).toHaveLength(7)
})

it('should select a language, persist it, emit it, and close the menu', async () => {
  const { i18n, screen } = renderSelector()

  await screen.getByRole('button', { name: 'Language' }).click()
  await screen.getByRole('menuitemradio', { name: /日本語/ }).click()

  expect(i18n.global.locale.value).toBe('ja')
  expect(localStorage.getItem(LOCALE_STORAGE_KEY)).toBe('ja')
  expect(screen.emitted('select')).toEqual([['ja']])
  await expect.element(screen.getByRole('menu')).not.toBeInTheDocument()
})

it('should close the language menu when clicking outside', async () => {
  const { screen } = renderSelector()

  await screen.getByRole('button', { name: 'Language' }).click()
  document.body.click()
  await nextTick()

  await expect.element(screen.getByRole('menu')).not.toBeInTheDocument()
})
