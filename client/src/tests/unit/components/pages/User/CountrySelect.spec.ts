import { expect, it } from 'vitest'
import { render } from 'vitest-browser-vue'

import CountrySelect from '@/components/pages/User/CountrySelect.vue'
import { createAppI18n } from '@/i18n'

it('should filter and select a country', async () => {
  const screen = render(CountrySelect, {
    props: { country: null },
    global: { plugins: [createAppI18n()] },
  })

  await screen.getByPlaceholder('Search countries').fill('Japan')
  await screen.getByRole('button', { name: /Japan/ }).click()

  expect(screen.emitted('select')).toEqual([['JP']])
})

it('should clear the selected country', async () => {
  const screen = render(CountrySelect, {
    props: { country: 'JP' },
    global: { plugins: [createAppI18n()] },
  })

  await screen.getByRole('button', { name: 'No country' }).click()

  expect(screen.emitted('select')).toEqual([[null]])
})
