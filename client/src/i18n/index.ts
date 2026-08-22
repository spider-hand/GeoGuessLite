import { createI18n } from 'vue-i18n'

import de from '@/locales/de.json'
import en from '@/locales/en.json'
import es from '@/locales/es.json'
import fr from '@/locales/fr.json'
import ja from '@/locales/ja.json'
import pt from '@/locales/pt.json'
import zh from '@/locales/zh.json'

export const DEFAULT_LOCALE = 'en'

export const messages = {
  de,
  en,
  es,
  fr,
  ja,
  pt,
  zh,
} as const

export type AppLocale = keyof typeof messages

export const LOCALE_STORAGE_KEY = 'geoguesslite.locale'

export const getStoredLocale = (): AppLocale => {
  if (typeof window.localStorage?.getItem !== 'function') {
    return DEFAULT_LOCALE
  }

  const locale = window.localStorage.getItem(LOCALE_STORAGE_KEY)

  return locale && locale in messages ? (locale as AppLocale) : DEFAULT_LOCALE
}

export const saveLocale = (locale: AppLocale) => {
  if (typeof window.localStorage?.setItem !== 'function') {
    return
  }

  window.localStorage.setItem(LOCALE_STORAGE_KEY, locale)
}

export const createAppI18n = (locale: AppLocale = DEFAULT_LOCALE) => {
  return createI18n({
    legacy: false,
    locale,
    fallbackLocale: DEFAULT_LOCALE,
    messages,
  })
}

export const appI18n = createAppI18n(getStoredLocale())
