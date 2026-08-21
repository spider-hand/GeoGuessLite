<script setup lang="ts">
import { X } from '@lucide/vue'
import { useTemplateRef } from 'vue'
import { useI18n } from 'vue-i18n'

import useOnClickOutside from '@/composables/useOnClickOutside'
import Button from '@/components/shared/Button.vue'

defineOptions({
  name: 'SharedSignUpPromptModal',
})

const props = defineProps<{
  isOpen: boolean
  isSigningUp: boolean
}>()

const emit = defineEmits<{
  close: []
  signUp: []
}>()

const { t } = useI18n()
const panel = useTemplateRef<HTMLElement>('panel')

const emitClose = () => {
  emit('close')
}

const emitSignUp = () => {
  emit('signUp')
}

useOnClickOutside({
  root: panel,
  close: () => {
    if (!props.isOpen) {
      return
    }

    emitClose()
  },
})
</script>

<template>
  <Transition appear name="sign-up-prompt-modal-fade">
    <div
      v-if="props.isOpen"
      class="sign-up-prompt-modal"
      role="presentation"
      @click.self="emitClose"
    >
      <div
        ref="panel"
        class="sign-up-prompt-modal__panel"
        role="dialog"
        aria-modal="true"
        :aria-label="t('components.shared.SignUpPromptModal.title')"
      >
        <button
          class="sign-up-prompt-modal__close-button"
          type="button"
          :aria-label="t('components.shared.SignUpPromptModal.close')"
          @click="emitClose"
        >
          <X :size="20" aria-hidden="true" />
        </button>

        <div class="sign-up-prompt-modal__content">
          <h2 class="sign-up-prompt-modal__title">
            {{ t('components.shared.SignUpPromptModal.title') }}
          </h2>

          <p class="sign-up-prompt-modal__description">
            {{ t('components.shared.SignUpPromptModal.description') }}
          </p>

          <Button
            class="sign-up-prompt-modal__cta"
            :loading="props.isSigningUp"
            @click="emitSignUp"
          >
            {{ t('components.shared.SignUpPromptModal.signUp') }}
          </Button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.sign-up-prompt-modal {
  position: fixed;
  inset: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-lg);
  background-color: color-mix(in srgb, black 48%, transparent);
}

.sign-up-prompt-modal__panel {
  position: relative;
  width: min(100%, 420px);
  padding: var(--spacing-xl);
  border: 1px solid var(--hairline);
  border-radius: var(--radius-token-xl);
  background-color: var(--surface-card-dark);
  box-shadow: 0 24px 48px color-mix(in srgb, black 36%, transparent);
}

.sign-up-prompt-modal__close-button {
  position: absolute;
  top: var(--spacing-md);
  right: var(--spacing-md);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: var(--muted);
  cursor: pointer;
}

.sign-up-prompt-modal__close-button:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--info-ring) 50%, transparent);
  outline-offset: 2px;
}

.sign-up-prompt-modal__content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.sign-up-prompt-modal__title {
  margin: 0;
  color: var(--on-dark);
  font-family: var(--font-body);
  font-size: var(--font-size-title-lg);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-title-md);
}

.sign-up-prompt-modal__description {
  margin: 0;
  color: var(--muted);
  font-family: var(--font-body);
  font-size: var(--font-size-body-md);
  line-height: var(--line-height-body);
}

.sign-up-prompt-modal__cta {
  width: 100%;
  margin-top: var(--spacing-sm);
}

.sign-up-prompt-modal-fade-enter-active,
.sign-up-prompt-modal-fade-leave-active {
  transition: opacity 180ms ease;
}

.sign-up-prompt-modal-fade-enter-active .sign-up-prompt-modal__panel,
.sign-up-prompt-modal-fade-leave-active .sign-up-prompt-modal__panel {
  transition:
    opacity 180ms ease,
    transform 180ms ease;
}

.sign-up-prompt-modal-fade-enter-from,
.sign-up-prompt-modal-fade-leave-to {
  opacity: 0;
}

.sign-up-prompt-modal-fade-enter-from .sign-up-prompt-modal__panel,
.sign-up-prompt-modal-fade-leave-to .sign-up-prompt-modal__panel {
  opacity: 0;
  transform: translateY(12px);
}

@media (max-width: 480px) {
  .sign-up-prompt-modal {
    padding: var(--spacing-md);
  }

  .sign-up-prompt-modal__panel {
    padding: var(--spacing-lg);
  }
}
</style>
