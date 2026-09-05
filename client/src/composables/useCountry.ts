import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import { countryFlagSrc } from '@/utils/game'

const useCountry = () => {
  const { locale } = useI18n()
  const displayNames = computed(() => new Intl.DisplayNames(locale.value, { type: 'region' }))

  const countryName = (countryCode: string) =>
    displayNames.value.of(countryCode.toUpperCase()) ?? countryCode.toUpperCase()
  const countryFlagAlt = (countryCode: string) => `${countryCode.toUpperCase()} flag`

  return { countryFlagAlt, countryFlagSrc, countryName }
}

export default useCountry
