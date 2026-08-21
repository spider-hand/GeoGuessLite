<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

import useOnClickOutside from '@/composables/useOnClickOutside'
import Avatar from '@/components/shared/Avatar.vue'

defineOptions({ name: 'SharedUserAvatarMenu' })

const props = defineProps<{ displayName: string; country?: string }>()
const emit = defineEmits<{ profileClick: []; signOutClick: [] }>()
const { t } = useI18n()
const isRegisteredUser = true
const root = ref<HTMLElement | null>(null)
const isOpen = ref(false)
const countryFlagSrc = (country: string) => `https://flagcdn.com/24x18/${country.toLowerCase()}.png`
const countryFlagAlt = (country: string) => `${country.toUpperCase()} flag`
const closeMenu = () => {
  isOpen.value = false
}
const toggleMenu = () => {
  isOpen.value = !isOpen.value
}
const emitSignOutClick = () => {
  emit('signOutClick')
  closeMenu()
}
const emitProfileClick = () => {
  emit('profileClick')
  closeMenu()
}

useOnClickOutside({ root, close: closeMenu })
</script>

<template>
  <div ref="root" class="user-avatar-menu">
    <button
      :aria-label="t('components.shared.UserAvatarMenu.triggerLabel')"
      class="user-avatar-menu__trigger"
      type="button"
      @click="toggleMenu"
    >
      <Avatar :name="props.displayName" size="md" />
    </button>

    <div
      v-if="isOpen"
      class="user-avatar-menu__menu"
      role="menu"
      :aria-label="t('components.shared.UserAvatarMenu.menuLabel')"
    >
      <div
        class="user-avatar-menu__summary"
        :aria-label="t('components.shared.UserAvatarMenu.nameLabel')"
      >
        <span class="user-avatar-menu__summary-label">
          {{ t('components.shared.UserAvatarMenu.nameLabel') }}
        </span>
        <span class="user-avatar-menu__summary-name">
          <span>{{ props.displayName }}</span>
          <img
            v-if="props.country"
            class="user-avatar-menu__flag"
            :src="countryFlagSrc(props.country)"
            :alt="countryFlagAlt(props.country)"
          />
        </span>
      </div>

      <div class="user-avatar-menu__divider" />

      <button
        v-if="isRegisteredUser"
        class="user-avatar-menu__item"
        type="button"
        role="menuitem"
        @click="emitProfileClick"
      >
        {{ t('components.shared.UserAvatarMenu.profile') }}
      </button>

      <button
        class="user-avatar-menu__item"
        type="button"
        role="menuitem"
        @click="emitSignOutClick"
      >
        {{ t('components.shared.UserAvatarMenu.signOut') }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.user-avatar-menu {
  position: relative;
}

.user-avatar-menu__trigger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 0;
  padding: 0;
  background: transparent;
  cursor: pointer;
}

.user-avatar-menu__trigger:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--info-ring) 50%, transparent);
  outline-offset: 2px;
}

.user-avatar-menu__menu {
  position: absolute;
  top: calc(100% + var(--spacing-xs));
  right: 0;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  min-width: 176px;
  padding: var(--spacing-xs);
  border: 1px solid var(--hairline);
  border-radius: var(--radius-token-sm);
  background-color: var(--surface-card-dark);
  box-shadow: 0 12px 28px color-mix(in srgb, black 32%, transparent);
}

.user-avatar-menu__summary {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xxs);
  padding: var(--spacing-xs) var(--spacing-sm);
}

.user-avatar-menu__summary-label {
  color: var(--muted);
  font-size: var(--font-size-body-sm);
  font-weight: var(--font-weight-medium);
  line-height: var(--line-height-body);
}

.user-avatar-menu__summary-name {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xxs);
  color: var(--on-dark);
  font-size: var(--font-size-body-md);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-body);
  word-break: break-word;
}

.user-avatar-menu__flag {
  height: 14px;
  width: auto;
}

.user-avatar-menu__divider {
  width: 100%;
  height: 1px;
  background-color: var(--hairline);
}

.user-avatar-menu__item {
  display: flex;
  align-items: center;
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

.user-avatar-menu__item:hover {
  background-color: var(--surface-elevated-dark);
  color: var(--on-dark);
}

.user-avatar-menu__item:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--info-ring) 50%, transparent);
  outline-offset: 2px;
}
</style>
