<script setup lang="ts">
import { Users } from '@lucide/vue'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useField } from 'vee-validate'

import Button from '@/components/shared/Button.vue'

defineOptions({
  name: 'HomePlayWithFriendsCard',
})

const props = defineProps<{
  disabled: boolean
  isCreatingRoom: boolean
  isEnteringRoom: boolean
}>()

const emit = defineEmits<{
  createFriendsRoom: []
  enterFriendsRoom: [roomKey: string]
}>()

const { t } = useI18n()

const {
  errorMessage,
  handleBlur,
  meta,
  setValue,
  validate,
  value: roomKey,
} = useField<string>(
  'roomKey',
  (value) =>
    /^\d{6}$/.test(value ?? '') || t('components.pages.Home.PlayWithFriendsCard.roomKeyError'),
  {
    initialValue: '',
    validateOnMount: false,
  },
)

const shouldShowRoomKeyError = computed(
  () => (meta.dirty || meta.touched) && Boolean(errorMessage.value),
)

const isEnterRoomDisabled = computed(
  () => props.disabled || roomKey.value.length !== 6 || Boolean(errorMessage.value),
)

const normalizeRoomKey = (value: string) => {
  return value.replace(/\D/g, '').slice(0, 6)
}

const handleRoomKeyInput = (event: Event) => {
  const input = event.target as HTMLInputElement
  const normalizedValue = normalizeRoomKey(input.value)

  input.value = normalizedValue
  setValue(normalizedValue, true)
}

const emitCreateFriendsRoom = () => {
  emit('createFriendsRoom')
}

const submitEnterFriendsRoom = async () => {
  const validationResult = await validate()

  if (!validationResult.valid) {
    return
  }

  emit('enterFriendsRoom', roomKey.value)
}
</script>

<template>
  <section class="play-with-friends-card">
    <div class="play-with-friends-card__title">
      <Users class="play-with-friends-card__title-icon" :size="20" />
      <h2 class="play-with-friends-card__title-label">
        {{ t('components.pages.Home.PlayWithFriendsCard.title') }}
      </h2>
    </div>

    <Button
      class="play-with-friends-card__create-button"
      :disabled="props.disabled"
      :loading="props.isCreatingRoom"
      @click="emitCreateFriendsRoom"
    >
      {{ t('components.pages.Home.PlayWithFriendsCard.createRoom') }}
    </Button>

    <p class="play-with-friends-card__separator">
      {{ t('components.pages.Home.PlayWithFriendsCard.or') }}
    </p>

    <form
      class="play-with-friends-card__join-group"
      novalidate
      @submit.prevent="submitEnterFriendsRoom"
    >
      <div class="play-with-friends-card__input-group">
        <input
          class="play-with-friends-card__input"
          :class="{
            'play-with-friends-card__input--invalid': shouldShowRoomKeyError,
          }"
          :placeholder="t('components.pages.Home.PlayWithFriendsCard.roomKey')"
          :value="roomKey"
          :disabled="props.disabled"
          inputmode="numeric"
          maxlength="6"
          type="text"
          @blur="handleBlur"
          @input="handleRoomKeyInput"
          @keydown.enter.prevent="submitEnterFriendsRoom"
        />

        <p v-if="shouldShowRoomKeyError" class="play-with-friends-card__error">
          {{ errorMessage }}
        </p>
      </div>

      <Button
        class="play-with-friends-card__enter-button"
        :disabled="isEnterRoomDisabled"
        :loading="props.isEnteringRoom"
        type="submit"
      >
        {{ t('components.pages.Home.PlayWithFriendsCard.enterRoom') }}
      </Button>
    </form>
  </section>
</template>

<style scoped>
.play-with-friends-card {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  width: min(100%, 440px);
  padding: var(--spacing-lg);
  border: 1px solid var(--hairline);
  border-radius: var(--radius-token-xl);
  background-color: var(--surface-card-dark);
  color: var(--on-dark);
}

.play-with-friends-card__title {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.play-with-friends-card__title-icon {
  flex-shrink: 0;
}

.play-with-friends-card__title-label {
  margin: 0;
  font-family: var(--font-body);
  font-size: var(--font-size-title-md);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-title-md);
  color: var(--on-dark);
}

.play-with-friends-card__create-button,
.play-with-friends-card__enter-button {
  width: 100%;
}

.play-with-friends-card__separator {
  margin: 0;
  color: var(--muted);
  font-family: var(--font-body);
  font-size: var(--font-size-body-sm);
  line-height: var(--line-height-body);
  text-align: center;
}

.play-with-friends-card__join-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.play-with-friends-card__input-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.play-with-friends-card__input {
  width: 100%;
  min-height: 40px;
  border: 1px solid var(--hairline);
  border-radius: var(--radius-token-lg);
  padding: 10px 16px;
  background-color: var(--surface-elevated-dark);
  color: var(--on-dark);
  font-family: var(--font-body);
  font-size: var(--font-size-body-md);
  line-height: var(--line-height-body);
}

.play-with-friends-card__input::placeholder {
  color: var(--muted);
}

.play-with-friends-card__input:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--info-ring) 50%, transparent);
  outline-offset: 2px;
}

.play-with-friends-card__input--invalid {
  border-color: var(--danger);
}

.play-with-friends-card__error {
  margin: 0;
  color: var(--danger);
  font-family: var(--font-body);
  font-size: var(--font-size-caption);
  line-height: var(--line-height-copy);
}

@media (max-width: 480px) {
  .play-with-friends-card {
    padding: var(--spacing-md);
  }
}
</style>
