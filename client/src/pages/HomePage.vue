<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import heroImage from '@/assets/hero.png'
import DailyChallengeCard from '@/components/pages/Home/DailyChallengeCard.vue'
import PlayWithFriendsCard from '@/components/pages/Home/PlayWithFriendsCard.vue'
import RandomMatchCard from '@/components/pages/Home/RandomMatchCard.vue'
import SinglePlayerCard from '@/components/pages/Home/SinglePlayerCard.vue'
import NavigationFooter from '@/components/shared/NavigationFooter.vue'
import NavigationHeader from '@/components/shared/NavigationHeader.vue'
import SignUpPromptModal from '@/components/shared/SignUpPromptModal.vue'

const router = useRouter()
const isCreatingFriendsRoom = ref(false)
const isEnteringFriendsRoom = ref(false)
const isSignUpPromptOpen = ref(false)
const isSigningUp = ref(false)

const handleStartSinglePlayer = async () => {
  await router.push('/game/single-player')
}
const handleCreateFriendsRoom = async () => {
  await router.push('/game/with-friends/scaffold')
}
const handleEnterFriendsRoom = async (roomKey: string) => {
  void roomKey
  await router.push('/game/with-friends/scaffold')
}
const handleJoinRandomMatch = async () => {
  await router.push('/game/random-match')
}
const handleStartDailyChallenge = async () => {
  await router.push('/game/daily-challenge')
}
const openSignUpPrompt = () => {
  isSignUpPromptOpen.value = true
}
const closeSignUpPrompt = () => {
  isSignUpPromptOpen.value = false
}
const handleSignUp = () => closeSignUpPrompt()
</script>

<template>
  <main class="home-page">
    <NavigationHeader @sign-up="openSignUpPrompt" />

    <section class="home-page__content">
      <div class="home-page__hero">
        <img class="home-page__hero-image" :src="heroImage" alt="Hero Image" />
      </div>

      <div class="home-page__cards">
        <SinglePlayerCard
          :disabled="isCreatingFriendsRoom || isEnteringFriendsRoom"
          @start-single-player="handleStartSinglePlayer"
        />
        <PlayWithFriendsCard
          :disabled="isCreatingFriendsRoom || isEnteringFriendsRoom"
          :is-creating-room="isCreatingFriendsRoom"
          :is-entering-room="isEnteringFriendsRoom"
          @create-friends-room="handleCreateFriendsRoom"
          @enter-friends-room="handleEnterFriendsRoom"
        />
        <DailyChallengeCard
          :disabled="isCreatingFriendsRoom || isEnteringFriendsRoom"
          :has-played-today="false"
          @start-daily-challenge="handleStartDailyChallenge"
        />
        <RandomMatchCard
          :disabled="isCreatingFriendsRoom || isEnteringFriendsRoom"
          :online-players="40"
          @join-random-match="handleJoinRandomMatch"
        />
      </div>
    </section>

    <SignUpPromptModal
      v-if="isSignUpPromptOpen"
      :is-open="isSignUpPromptOpen"
      :is-signing-up="isSigningUp"
      @close="closeSignUpPrompt"
      @sign-up="handleSignUp"
    />

    <NavigationFooter />
  </main>
</template>

<style scoped>
.home-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: var(--on-primary);
}

.home-page__content {
  flex: 1;
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(280px, 440px);
  align-items: stretch;
  gap: var(--spacing-lg);
  width: min(100%, 1280px);
  margin: 0 auto;
  padding: var(--spacing-xl) var(--spacing-lg);
}

.home-page__hero {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100%;
}

.home-page__hero-image {
  display: block;
  width: 100%;
  max-width: 560px;
  height: auto;
  object-fit: contain;
}

.home-page__cards {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  align-self: center;
}

@media (max-width: 960px) {
  .home-page__content {
    grid-template-columns: 1fr;
  }

  .home-page__hero {
    min-height: 200px;
  }

  .home-page__hero-image {
    max-height: 200px;
    margin: 0 auto;
  }

  .home-page__cards {
    align-self: stretch;
  }
}

@media (max-width: 480px) {
  .home-page__content {
    padding: var(--spacing-lg) var(--spacing-md);
  }

  .home-page__hero {
    min-height: 200px;
  }

  .home-page__hero-image {
    max-height: 200px;
  }
}
</style>
