<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

import DailyChallengeSection from '@/components/pages/User/DailyChallengeSection.vue'
import FriendsGamesSection from '@/components/pages/User/FriendsGamesSection.vue'
import SinglePlayerGamesSection from '@/components/pages/User/SinglePlayerGamesSection.vue'
import UserProfileSection from '@/components/pages/User/UserProfileSection.vue'
import NavigationFooter from '@/components/shared/NavigationFooter.vue'
import NavigationHeader from '@/components/shared/NavigationHeader.vue'

defineOptions({ name: 'UserPage' })

type UserTab = 'profile' | 'singlePlayerGames' | 'friendsGames' | 'dailyChallenge'

const { t } = useI18n()
const activeTab = ref<UserTab>('profile')
const tabs: Array<UserTab> = ['profile', 'singlePlayerGames', 'friendsGames', 'dailyChallenge']
</script>

<template>
  <main class="user-page">
    <NavigationHeader />
    <section class="user-page__content">
      <div class="user-page__tabs-scroll">
        <div class="user-page__tabs" role="tablist">
          <button
            v-for="tab in tabs"
            :key="tab"
            class="user-page__tab"
            :class="{ 'user-page__tab--selected': activeTab === tab }"
            type="button"
            role="tab"
            :aria-selected="activeTab === tab"
            @click="activeTab = tab"
          >
            {{ t(`components.pages.User.${tab}`) }}
          </button>
        </div>
      </div>
      <UserProfileSection v-if="activeTab === 'profile'" />
      <SinglePlayerGamesSection v-else-if="activeTab === 'singlePlayerGames'" />
      <FriendsGamesSection v-else-if="activeTab === 'friendsGames'" />
      <DailyChallengeSection v-else />
    </section>
    <NavigationFooter />
  </main>
</template>

<style scoped>
.user-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: var(--on-primary);
}
.user-page__content {
  flex: 1;
  width: min(100%, 1280px);
  margin: 0 auto;
  padding: var(--spacing-xl);
}
.user-page__tabs-scroll {
  max-width: 100%;
  overflow-x: auto;
}
.user-page__tabs {
  display: flex;
  gap: var(--spacing-xs);
  width: max-content;
}
.user-page__tab {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  min-height: 40px;
  padding: 0 var(--spacing-xs) var(--spacing-xs);
  border: 0;
  background: transparent;
  color: var(--muted);
  font: inherit;
  white-space: nowrap;
  cursor: pointer;
}
.user-page__tab::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 25%;
  height: 3px;
  background: transparent;
  transform: translateX(-50%);
}
.user-page__tab:hover,
.user-page__tab:focus-visible,
.user-page__tab--selected {
  color: var(--on-dark);
}
.user-page__tab:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--info-ring) 50%, transparent);
  outline-offset: 2px;
}
.user-page__tab--selected::after {
  background: var(--primary);
}
@media (max-width: 640px) {
  .user-page__content {
    padding: var(--spacing-lg);
  }
}
</style>
