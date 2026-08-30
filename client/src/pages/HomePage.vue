<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import heroImage from '@/assets/hero.png'
import useAuth from '@/composables/useAuth'
import DailyChallengeCard from '@/components/pages/Home/DailyChallengeCard.vue'
import PlayWithFriendsCard from '@/components/pages/Home/PlayWithFriendsCard.vue'
import RandomMatchCard from '@/components/pages/Home/RandomMatchCard.vue'
import SinglePlayerCard from '@/components/pages/Home/SinglePlayerCard.vue'
import NavigationFooter from '@/components/shared/NavigationFooter.vue'
import NavigationHeader from '@/components/shared/NavigationHeader.vue'
import SignUpPromptModal from '@/components/shared/SignUpPromptModal.vue'
import useSinglePlayerGameQuery from '@/composables/useSinglePlayerGameQuery'

const router = useRouter()
const { isCurrentUserLoaded, isRegisteredUser, signInAnonymously, signUpWithGoogle } = useAuth()
const { createGameAsync } = useSinglePlayerGameQuery(null)
const isStartingSinglePlayer = ref(false)
const isCreatingFriendsRoom = ref(false)
const isEnteringFriendsRoom = ref(false)
const isSignUpPromptOpen = ref(false)
const isSigningUp = ref(false)

const handleStartSinglePlayer = async () => {
  if (isStartingSinglePlayer.value) {
    return
  }

  isStartingSinglePlayer.value = true

  try {
    await signInAnonymously()
    const game = await createGameAsync()
    await router.push({ name: 'single-player-game', params: { gameId: game.id } })
  } catch (error) {
    console.error(error)
  } finally {
    isStartingSinglePlayer.value = false
  }
}
const openSignUpPrompt = () => {
  isSignUpPromptOpen.value = true
}
const closeSignUpPrompt = () => {
  isSignUpPromptOpen.value = false
}
const ensureRegisteredUser = () => {
  if (!isCurrentUserLoaded.value || !isRegisteredUser.value) {
    openSignUpPrompt()
    return false
  }

  return true
}
const handleCreateFriendsRoom = async () => {
  if (!ensureRegisteredUser() || isCreatingFriendsRoom.value || isEnteringFriendsRoom.value) {
    return
  }

  await router.push('/game/with-friends/scaffold')
}
const handleEnterFriendsRoom = async (roomKey: string) => {
  if (!ensureRegisteredUser() || isCreatingFriendsRoom.value || isEnteringFriendsRoom.value) {
    return
  }

  void roomKey
  await router.push('/game/with-friends/scaffold')
}
const handleJoinRandomMatch = async () => {
  await router.push('/game/random-match')
}
const handleStartDailyChallenge = async () => {
  if (!ensureRegisteredUser()) {
    return
  }

  await router.push('/game/daily-challenge')
}
const handleSignUp = async () => {
  if (isSigningUp.value) {
    return
  }

  isSigningUp.value = true

  try {
    await signUpWithGoogle()
    closeSignUpPrompt()
    await router.push('/')
  } catch (error) {
    console.error(error)
  } finally {
    isSigningUp.value = false
  }
}
</script>

<template>
  <main class="home-page">
    <NavigationHeader />

    <section class="home-page__content">
      <div class="home-page__hero">
        <img class="home-page__hero-image" :src="heroImage" alt="Hero Image" />
      </div>

      <div class="home-page__cards">
        <SinglePlayerCard
          :disabled="isStartingSinglePlayer || isCreatingFriendsRoom || isEnteringFriendsRoom"
          :is-starting-game="isStartingSinglePlayer"
          @start-single-player="handleStartSinglePlayer"
        />
        <PlayWithFriendsCard
          :disabled="isStartingSinglePlayer || isCreatingFriendsRoom || isEnteringFriendsRoom"
          :is-creating-room="isCreatingFriendsRoom"
          :is-entering-room="isEnteringFriendsRoom"
          @create-friends-room="handleCreateFriendsRoom"
          @enter-friends-room="handleEnterFriendsRoom"
        />
        <DailyChallengeCard
          :disabled="isStartingSinglePlayer || isCreatingFriendsRoom || isEnteringFriendsRoom"
          :has-played-today="false"
          @start-daily-challenge="handleStartDailyChallenge"
        />
        <RandomMatchCard
          :disabled="isStartingSinglePlayer || isCreatingFriendsRoom || isEnteringFriendsRoom"
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
