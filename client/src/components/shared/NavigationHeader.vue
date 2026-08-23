<script setup lang="ts">
import { ChevronDown, ChevronUp, Menu, X } from '@lucide/vue'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

import { SUPPORTED_LANGUAGES } from '@/constants/languages'
import useAuth from '@/composables/useAuth'
import useOnClickOutside from '@/composables/useOnClickOutside'
import Avatar from '@/components/shared/Avatar.vue'
import Button from '@/components/shared/Button.vue'
import HowToPlayButton from '@/components/shared/HowToPlayButton.vue'
import IconButton from '@/components/shared/IconButton.vue'
import LanguageSelector from '@/components/shared/LanguageSelector.vue'
import UserAvatarMenu from '@/components/shared/UserAvatarMenu.vue'
import { saveLocale } from '@/i18n'
import type { SupportedLanguage } from '@/types/language'

defineOptions({ name: 'SharedNavigationHeader' })

const GITHUB_URL = 'https://github.com/spider-hand/GeoGuessLite'
const DISCORD_URL = 'https://discord.gg/H9RwrfgeDH'
const { locale, t } = useI18n({ useScope: 'global' })
const router = useRouter()
const {
  username,
  userCountry,
  isAuthenticatedUser,
  isRegisteredUser,
  isCurrentUserLoaded,
  signUpWithGoogle,
  signOutUser,
} = useAuth()
const isSigningUpInternal = ref(false)
const mobileMenuRoot = ref<HTMLElement | null>(null)
const isMobileMenuOpen = ref(false)
const isMobileHowToPlayOpen = ref(false)
const isMobileLanguageOpen = ref(false)

const emit = defineEmits<{
  languageSelect: [language: string]
}>()

const emitLanguageSelect = (language: string) => {
  emit('languageSelect', language)
}

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false
  isMobileHowToPlayOpen.value = false
  isMobileLanguageOpen.value = false
}
const toggleMobileMenu = () =>
  isMobileMenuOpen.value ? closeMobileMenu() : (isMobileMenuOpen.value = true)
const toggleMobileHowToPlay = () => {
  isMobileHowToPlayOpen.value = !isMobileHowToPlayOpen.value
}
const toggleMobileLanguage = () => {
  isMobileLanguageOpen.value = !isMobileLanguageOpen.value
}
const selectMobileLanguage = (language: SupportedLanguage) => {
  locale.value = language
  saveLocale(language)
  emitLanguageSelect(language)
  closeMobileMenu()
}
const handleSignUp = async () => {
  if (isSigningUpInternal.value) {
    return
  }

  closeMobileMenu()
  isSigningUpInternal.value = true

  try {
    await signUpWithGoogle()
    await router.push('/')
  } catch (error) {
    console.error(error)
  } finally {
    isSigningUpInternal.value = false
  }
}
const handleSignOut = async () => {
  try {
    closeMobileMenu()
    await signOutUser()
    await router.push('/')
  } catch (error) {
    console.error(error)
  }
}
const handleProfileClick = async () => {
  closeMobileMenu()
  await router.push('/user')
}
const handleGithubClick = () => {
  closeMobileMenu()
  window.open(GITHUB_URL, '_blank', 'noopener,noreferrer')
}
const handleDiscordClick = () => {
  closeMobileMenu()
  window.open(DISCORD_URL, '_blank', 'noopener,noreferrer')
}

useOnClickOutside({ root: mobileMenuRoot, close: closeMobileMenu })
</script>

<template>
  <header class="navigation-header">
    <nav
      class="navigation-header__content"
      :aria-label="t('components.shared.NavigationHeader.primaryNavigationLabel')"
    >
      <button class="navigation-header__brand" type="button" @click="router.push('/')">
        GeoGuessLite
      </button>

      <div class="navigation-header__actions">
        <div class="navigation-header__nav-actions navigation-header__nav-actions--desktop">
          <HowToPlayButton />
        </div>

        <div class="navigation-header__utility-actions navigation-header__utility-actions--desktop">
          <IconButton
            :ariaLabel="t('components.shared.NavigationHeader.githubRepositoryLink')"
            @click="handleGithubClick"
          >
            <svg
              aria-hidden="true"
              fill="none"
              height="18"
              viewBox="0 0 98 96"
              width="18"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g clip-path="url(#navigation-header-github-icon)">
                <path
                  d="M41.4395 69.3848C28.8066 67.8535 19.9062 58.7617 19.9062 46.9902C19.9062 42.2051 21.6289 37.0371 24.5 33.5918C23.2559 30.4336 23.4473 23.7344 24.8828 20.959C28.7109 20.4805 33.8789 22.4902 36.9414 25.2656C40.5781 24.1172 44.4062 23.543 49.0957 23.543C53.7852 23.543 57.6133 24.1172 61.0586 25.1699C64.0254 22.4902 69.2891 20.4805 73.1172 20.959C74.457 23.543 74.6484 30.2422 73.4043 33.4961C76.4668 37.1328 78.0937 42.0137 78.0937 46.9902C78.0937 58.7617 69.1934 67.6621 56.3691 69.2891C59.623 71.3945 61.8242 75.9883 61.8242 81.252L61.8242 91.2051C61.8242 94.0762 64.2168 95.7031 67.0879 94.5547C84.4102 87.9512 98 70.6289 98 49.1914C98 22.1074 75.9883 6.69539e-07 48.9043 4.309e-07C21.8203 1.92261e-07 -1.9479e-07 22.1074 -4.3343e-07 49.1914C-6.20631e-07 70.4375 13.4941 88.0469 31.6777 94.6504C34.2617 95.6074 36.75 93.8848 36.75 91.3008L36.75 83.6445C35.4102 84.2188 33.6875 84.6016 32.1562 84.6016C25.8398 84.6016 22.1074 81.1563 19.4277 74.7441C18.375 72.1602 17.2266 70.6289 15.0254 70.3418C13.877 70.2461 13.4941 69.7676 13.4941 69.1934C13.4941 68.0449 15.4082 67.1836 17.3223 67.1836C20.0977 67.1836 22.4902 68.9063 24.9785 72.4473C26.8926 75.2227 28.9023 76.4668 31.2949 76.4668C33.6875 76.4668 35.2187 75.6055 37.4199 73.4043C39.0469 71.7773 40.291 70.3418 41.4395 69.3848Z"
                  fill="currentColor"
                />
              </g>
              <defs>
                <clipPath id="navigation-header-github-icon">
                  <rect fill="white" height="96" width="98" />
                </clipPath>
              </defs>
            </svg>
          </IconButton>

          <IconButton
            :ariaLabel="t('components.shared.NavigationHeader.discordServerLink')"
            @click="handleDiscordClick"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 126.644 96" width="18" height="18">
              <path
                fill="currentColor"
                d="M81.15,0c-1.2376,2.1973-2.3489,4.4704-3.3591,6.794-9.5975-1.4396-19.3718-1.4396-28.9945,0-.985-2.3236-2.1216-4.5967-3.3591-6.794-9.0166,1.5407-17.8059,4.2431-26.1405,8.0568C2.779,32.5304-1.6914,56.3725.5312,79.8863c9.6732,7.1476,20.5083,12.603,32.0505,16.0884,2.6014-3.4854,4.8998-7.1981,6.8698-11.0623-3.738-1.3891-7.3497-3.1318-10.8098-5.1523.9092-.6567,1.7932-1.3386,2.6519-1.9953,20.281,9.547,43.7696,9.547,64.0758,0,.8587.7072,1.7427,1.3891,2.6519,1.9953-3.4601,2.0457-7.0718,3.7632-10.835,5.1776,1.97,3.8642,4.2683,7.5769,6.8698,11.0623,11.5419-3.4854,22.3769-8.9156,32.0509-16.0631,2.626-27.2771-4.496-50.9172-18.817-71.8548C98.9811,4.2684,90.1918,1.5659,81.1752.0505l-.0252-.0505ZM42.2802,65.4144c-6.2383,0-11.4159-5.6575-11.4159-12.6535s4.9755-12.6788,11.3907-12.6788,11.5169,5.708,11.4159,12.6788c-.101,6.9708-5.026,12.6535-11.3907,12.6535ZM84.3576,65.4144c-6.2637,0-11.3907-5.6575-11.3907-12.6535s4.9755-12.6788,11.3907-12.6788,11.4917,5.708,11.3906,12.6788c-.101,6.9708-5.026,12.6535-11.3906,12.6535Z"
              />
            </svg>
          </IconButton>

          <LanguageSelector @select="emitLanguageSelect" />
        </div>

        <div
          v-if="isCurrentUserLoaded"
          class="navigation-header__cta-actions navigation-header__cta-actions--desktop"
        >
          <UserAvatarMenu
            v-if="isAuthenticatedUser"
            :display-name="username"
            :country="userCountry"
            @profile-click="handleProfileClick"
            @sign-out-click="handleSignOut"
          />

          <Button v-else pill :loading="isSigningUpInternal" @click="handleSignUp">
            {{ t('components.shared.NavigationHeader.signUp') }}
          </Button>
        </div>

        <div ref="mobileMenuRoot" class="navigation-header__mobile-menu">
          <IconButton
            class="navigation-header__mobile-menu-trigger"
            :ariaLabel="
              isMobileMenuOpen
                ? t('components.shared.NavigationHeader.closeMenu')
                : t('components.shared.NavigationHeader.openMenu')
            "
            :aria-expanded="isMobileMenuOpen"
            aria-controls="navigation-header-mobile-panel"
            @click="toggleMobileMenu"
          >
            <X v-if="isMobileMenuOpen" :size="20" aria-hidden="true" />
            <Menu v-else :size="20" aria-hidden="true" />
          </IconButton>

          <div
            v-if="isMobileMenuOpen"
            id="navigation-header-mobile-panel"
            class="navigation-header__mobile-panel"
            data-testid="navigation-header-mobile-panel"
          >
            <div
              v-if="isCurrentUserLoaded && isAuthenticatedUser"
              class="navigation-header__mobile-user"
              data-testid="navigation-header-mobile-user"
            >
              <Avatar :name="username" size="sm" />
              <span
                class="navigation-header__mobile-username"
                data-testid="navigation-header-mobile-username"
              >
                {{ username }}
              </span>
            </div>

            <button
              v-if="isCurrentUserLoaded && isRegisteredUser"
              class="navigation-header__mobile-row"
              type="button"
              @click="handleProfileClick"
            >
              {{ t('components.shared.NavigationHeader.profile') }}
            </button>

            <button
              class="navigation-header__mobile-row navigation-header__mobile-row--accordion"
              data-testid="navigation-header-mobile-how-to-play-toggle"
              type="button"
              :aria-expanded="isMobileHowToPlayOpen"
              @click="toggleMobileHowToPlay"
            >
              <span>
                {{ t('components.shared.NavigationHeader.howToPlayTriggerLabel') }}
              </span>
              <ChevronUp
                v-if="isMobileHowToPlayOpen"
                :size="18"
                aria-hidden="true"
                data-testid="navigation-header-mobile-how-to-play-chevron-up"
              />
              <ChevronDown
                v-else
                :size="18"
                aria-hidden="true"
                data-testid="navigation-header-mobile-how-to-play-chevron-down"
              />
            </button>

            <div v-if="isMobileHowToPlayOpen" class="navigation-header__mobile-accordion-content">
              <p class="navigation-header__mobile-copy">
                {{ t('components.shared.NavigationHeader.howToPlayDescriptionLine1') }}
              </p>
              <p class="navigation-header__mobile-copy">
                {{ t('components.shared.NavigationHeader.howToPlayDescriptionLine2') }}
              </p>
              <p class="navigation-header__mobile-copy">
                {{ t('components.shared.NavigationHeader.howToPlayDescriptionLine3') }}
              </p>
            </div>

            <button class="navigation-header__mobile-row" type="button" @click="handleGithubClick">
              {{ t('components.shared.NavigationHeader.githubLabel') }}
            </button>

            <button class="navigation-header__mobile-row" type="button" @click="handleDiscordClick">
              {{ t('components.shared.NavigationHeader.discordLabel') }}
            </button>

            <button
              class="navigation-header__mobile-row navigation-header__mobile-row--accordion"
              data-testid="navigation-header-mobile-language-toggle"
              type="button"
              :aria-expanded="isMobileLanguageOpen"
              @click="toggleMobileLanguage"
            >
              <span>{{ t('components.shared.NavigationHeader.languageLabel') }}</span>
              <ChevronUp
                v-if="isMobileLanguageOpen"
                :size="18"
                aria-hidden="true"
                data-testid="navigation-header-mobile-language-chevron-up"
              />
              <ChevronDown
                v-else
                :size="18"
                aria-hidden="true"
                data-testid="navigation-header-mobile-language-chevron-down"
              />
            </button>

            <div
              v-if="isMobileLanguageOpen"
              class="navigation-header__mobile-accordion-content navigation-header__mobile-accordion-content--list"
            >
              <button
                v-for="language in SUPPORTED_LANGUAGES"
                :key="language.value"
                class="navigation-header__mobile-language"
                :class="{
                  'navigation-header__mobile-language--selected': language.value === locale,
                }"
                type="button"
                @click="selectMobileLanguage(language.value)"
              >
                <span aria-hidden="true" class="navigation-header__mobile-flag">
                  {{ language.flag }}
                </span>
                <span class="navigation-header__mobile-language-label">
                  {{ language.label }}
                </span>
              </button>
            </div>

            <Button
              v-if="isCurrentUserLoaded && !isAuthenticatedUser"
              class="navigation-header__mobile-auth-button"
              pill
              :loading="isSigningUpInternal"
              @click="handleSignUp"
            >
              {{ t('components.shared.NavigationHeader.signUp') }}
            </Button>

            <button
              v-else-if="isCurrentUserLoaded"
              class="navigation-header__mobile-row"
              type="button"
              @click="handleSignOut"
            >
              {{ t('components.shared.NavigationHeader.signOut') }}
            </button>
          </div>
        </div>
      </div>
    </nav>
  </header>
</template>

<style scoped>
.navigation-header {
  position: relative;
  z-index: 1;
  width: 100%;
  background-color: var(--on-primary);
}

.navigation-header__content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-lg);
  width: min(100%, 1280px);
  margin: 0 auto;
  padding: var(--spacing-md) var(--spacing-lg);
}

.navigation-header__brand {
  border: 0;
  padding: 0;
  background: transparent;
  color: var(--primary);
  font-family: var(--font-display);
  font-size: var(--font-size-title-md);
  font-weight: var(--font-weight-bold);
  line-height: var(--line-height-title-md);
  cursor: pointer;
}

.navigation-header__brand:focus-visible,
.navigation-header__brand:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--info-ring) 50%, transparent);
  outline-offset: 2px;
}

.navigation-header__actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--spacing-md);
}

.navigation-header__mobile-menu {
  display: none;
  position: relative;
}

.navigation-header__nav-actions,
.navigation-header__cta-actions {
  display: flex;
  align-items: center;
}

.navigation-header__utility-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.navigation-header__mobile-panel {
  position: absolute;
  top: calc(100% + var(--spacing-xs));
  right: 0;
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  width: min(320px, calc(100vw - (var(--spacing-md) * 2)));
  padding: var(--spacing-sm);
  border: 1px solid var(--hairline);
  border-radius: var(--radius-token-sm);
  background-color: var(--surface-card-dark);
  box-shadow: 0 12px 28px color-mix(in srgb, black 32%, transparent);
}

.navigation-header__mobile-row,
.navigation-header__mobile-auth-button {
  width: 100%;
}

.navigation-header__mobile-row {
  display: flex;
  align-items: center;
  border: 0;
  border-radius: var(--radius-token-md);
  padding: var(--spacing-xs) var(--spacing-sm);
  background: transparent;
  color: var(--body);
  font-family: var(--font-body);
  font-size: var(--font-size-body-md);
  font-weight: var(--font-weight-medium);
  line-height: var(--line-height-body);
  text-align: left;
  cursor: pointer;
  transition:
    background-color 160ms ease,
    color 160ms ease;
}

.navigation-header__mobile-row--accordion {
  justify-content: space-between;
}

.navigation-header__mobile-row:hover {
  background-color: var(--surface-elevated-dark);
  color: var(--on-dark);
}

.navigation-header__mobile-row:focus-visible,
.navigation-header__mobile-language:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--info-ring) 50%, transparent);
  outline-offset: 2px;
}

.navigation-header__mobile-accordion-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  padding: 0 var(--spacing-sm) var(--spacing-xs);
}

.navigation-header__mobile-accordion-content--list {
  gap: var(--spacing-xxs);
}

.navigation-header__mobile-copy {
  margin: 0;
  color: var(--muted);
  font-size: var(--font-size-body-sm);
  line-height: var(--line-height-body);
}

.navigation-header__mobile-user {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  min-height: 52px;
  padding: var(--spacing-sm) var(--spacing-sm);
  border-bottom: 1px solid var(--hairline);
}

.navigation-header__mobile-username {
  min-width: 0;
  overflow: hidden;
  color: var(--on-dark);
  font-size: var(--font-size-body-md);
  font-weight: var(--font-weight-medium);
  line-height: var(--line-height-body);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.navigation-header__mobile-language {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  width: 100%;
  border: 0;
  border-radius: var(--radius-token-md);
  padding: var(--spacing-xs) var(--spacing-sm);
  background: transparent;
  color: var(--body);
  font-family: var(--font-body);
  font-size: var(--font-size-body-md);
  line-height: var(--line-height-body);
  text-align: left;
  cursor: pointer;
  transition:
    background-color 160ms ease,
    color 160ms ease;
}

.navigation-header__mobile-language:hover {
  background-color: var(--surface-elevated-dark);
  color: var(--on-dark);
}

.navigation-header__mobile-language--selected {
  color: var(--primary);
}

.navigation-header__mobile-flag {
  font-size: 1rem;
  line-height: 1;
}

.navigation-header__mobile-language-label {
  font-size: var(--font-size-body-md);
  line-height: var(--line-height-body);
}

@media (max-width: 640px) {
  .navigation-header__content {
    padding-inline: var(--spacing-md);
  }

  .navigation-header__actions {
    gap: 0;
  }

  .navigation-header__nav-actions--desktop,
  .navigation-header__utility-actions--desktop,
  .navigation-header__cta-actions--desktop {
    display: none;
  }

  .navigation-header__mobile-menu {
    display: block;
  }
}
</style>
