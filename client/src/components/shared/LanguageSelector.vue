<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { SUPPORTED_LANGUAGES } from '@/constants/languages'
import useOnClickOutside from '@/composables/useOnClickOutside'
import IconButton from '@/components/shared/IconButton.vue'
import { saveLocale } from '@/i18n'
import type { SupportedLanguage } from '@/types/language'

defineOptions({
  name: 'SharedLanguageSelector',
})

const emit = defineEmits<{
  select: [language: SupportedLanguage]
}>()

const { locale, t } = useI18n({ useScope: 'global' })
const root = ref<HTMLElement | null>(null)
const isOpen = ref(false)

const currentLanguage = computed(
  () =>
    SUPPORTED_LANGUAGES.find((option) => option.value === locale.value) ?? SUPPORTED_LANGUAGES[0],
)

const closeMenu = () => {
  isOpen.value = false
}

const toggleMenu = () => {
  isOpen.value = !isOpen.value
}

const selectLanguage = (language: SupportedLanguage) => {
  locale.value = language
  saveLocale(language)
  emit('select', language)
  closeMenu()
}

useOnClickOutside({
  root,
  close: closeMenu,
})
</script>

<template>
  <div ref="root" class="language-selector">
    <IconButton
      :ariaLabel="t('components.shared.LanguageSelector.triggerLabel')"
      @click="toggleMenu"
    >
      <svg aria-hidden="true" fill="none" height="18" viewBox="0 0 24 24" width="18">
        <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.5" />
        <path
          d="M3 12h18M12 3c2.6 2.5 4 5.7 4 9s-1.4 6.5-4 9c-2.6-2.5-4-5.7-4-9s1.4-6.5 4-9Z"
          stroke="currentColor"
          stroke-width="1.5"
        />
      </svg>
    </IconButton>

    <div
      v-if="isOpen"
      class="language-selector__menu"
      role="menu"
      :aria-label="
        t('components.shared.LanguageSelector.supportedLanguagesLabel', {
          language: currentLanguage.label,
        })
      "
    >
      <button
        v-for="language in SUPPORTED_LANGUAGES"
        :key="language.value"
        class="language-selector__item"
        :class="{
          'language-selector__item--selected': language.value === locale,
        }"
        type="button"
        role="menuitemradio"
        :aria-checked="language.value === locale"
        @click="selectLanguage(language.value)"
      >
        <span aria-hidden="true" class="language-selector__flag">
          {{ language.flag }}
        </span>
        <span class="language-selector__label">{{ language.label }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.language-selector {
  position: relative;
}

.language-selector__menu {
  position: absolute;
  top: calc(100% + var(--spacing-xs));
  right: 0;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xxs);
  min-width: 176px;
  padding: var(--spacing-xs);
  border: 1px solid var(--hairline);
  border-radius: var(--radius-token-sm);
  background-color: var(--surface-card-dark);
  box-shadow: 0 12px 28px color-mix(in srgb, black 32%, transparent);
}

.language-selector__item {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  width: 100%;
  border: 0;
  border-radius: var(--radius-token-md);
  padding: var(--spacing-xs) var(--spacing-sm);
  background: transparent;
  color: var(--body);
  text-align: left;
  cursor: pointer;
  transition:
    background-color 160ms ease,
    color 160ms ease;
}

.language-selector__item:hover {
  background-color: var(--surface-elevated-dark);
  color: var(--on-dark);
}

.language-selector__item:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--info-ring) 50%, transparent);
  outline-offset: 2px;
}

.language-selector__item--selected {
  color: var(--primary);
}

.language-selector__flag {
  font-size: 1rem;
  line-height: 1;
}

.language-selector__label {
  font-size: var(--font-size-body-md);
  font-weight: var(--font-weight-medium);
  line-height: var(--line-height-body);
}
</style>
