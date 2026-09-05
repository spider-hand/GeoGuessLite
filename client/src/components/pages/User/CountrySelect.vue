<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { COUNTRY_CODES } from '@/constants/countries'
import useCountry from '@/composables/useCountry'

defineOptions({ name: 'UserCountrySelect' })

const props = defineProps<{ country: string | null }>()
const emit = defineEmits<{ select: [country: string | null] }>()
const { t } = useI18n()
const { countryFlagAlt, countryFlagSrc, countryName } = useCountry()
const query = ref('')
const countries = computed(() =>
  COUNTRY_CODES.filter((code) =>
    countryName(code).toLocaleLowerCase().includes(query.value.trim().toLocaleLowerCase()),
  ).sort((left, right) => countryName(left).localeCompare(countryName(right))),
)
</script>

<template>
  <div class="country-select">
    <span class="country-select__label">{{
      t('components.pages.User.CountrySelect.country')
    }}</span>
    <input
      v-model="query"
      class="country-select__input"
      :placeholder="t('components.pages.User.CountrySelect.search')"
      type="search"
    />
    <button class="country-select__option" type="button" @click="emit('select', null)">
      {{ t('components.pages.User.CountrySelect.noCountry') }}
    </button>
    <div class="country-select__options">
      <button
        v-for="countryCode in countries"
        :key="countryCode"
        class="country-select__option"
        :class="{ 'country-select__option--selected': countryCode.toUpperCase() === props.country }"
        type="button"
        @click="emit('select', countryCode.toUpperCase())"
      >
        <img :src="countryFlagSrc(countryCode)" :alt="countryFlagAlt(countryCode)" />
        {{ countryName(countryCode) }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.country-select {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}
.country-select__label {
  color: var(--muted);
  font-size: var(--font-size-body-sm);
}
.country-select__input {
  min-height: 40px;
  border: 1px solid var(--hairline);
  border-radius: var(--radius-token-md);
  padding: 0 var(--spacing-sm);
  background: var(--surface-card-dark);
  color: var(--on-dark);
  font: inherit;
}
.country-select__input:focus-visible,
.country-select__option:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--info-ring) 50%, transparent);
  outline-offset: 2px;
}
.country-select__options {
  max-height: 224px;
  overflow-y: auto;
}
.country-select__option {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  width: 100%;
  border: 0;
  border-radius: var(--radius-token-md);
  padding: var(--spacing-xs) var(--spacing-sm);
  background: transparent;
  color: var(--body);
  font: inherit;
  text-align: left;
  cursor: pointer;
}
.country-select__option:hover {
  background-color: var(--surface-elevated-dark);
  color: var(--on-dark);
}
.country-select__option--selected {
  color: var(--primary);
}
.country-select__option img {
  width: 20px;
  height: auto;
}
</style>
