<script setup lang="ts">
import { LoaderCircle } from '@lucide/vue'
import { computed } from 'vue'

type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'success' | 'danger'
type ButtonSize = 'md' | 'compact'

defineOptions({
  name: 'SharedButton',
})

const props = withDefaults(
  defineProps<{
    variant?: ButtonVariant
    size?: ButtonSize
    pill?: boolean
    disabled?: boolean
    loading?: boolean
    type?: 'button' | 'submit' | 'reset'
  }>(),
  {
    variant: 'primary',
    size: 'md',
    pill: false,
    disabled: false,
    loading: false,
    type: 'button',
  },
)

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const classNames = computed(() => [
  'button',
  `button--${props.variant}`,
  `button--${props.size}`,
  {
    'button--pill': props.pill,
    'button--disabled': props.disabled,
    'button--loading': props.loading,
  },
])

const handleClick = (event: MouseEvent) => {
  if (props.disabled || props.loading) {
    event.preventDefault()
    event.stopPropagation()
    return
  }

  emit('click', event)
}
</script>

<template>
  <button
    :aria-busy="loading"
    :class="classNames"
    :disabled="disabled || loading"
    :type="type"
    @click="handleClick"
  >
    <LoaderCircle v-if="loading" class="button__loader" :size="16" />
    <slot />
  </button>
</template>

<style scoped>
.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
  min-width: 0;
  border: 1px solid transparent;
  border-radius: var(--radius-token-md);
  font-family: var(--font-body);
  font-size: var(--font-size-button);
  font-weight: var(--font-weight-regular);
  line-height: var(--line-height-button);
  cursor: pointer;
  transition:
    background-color 160ms ease,
    border-color 160ms ease,
    color 160ms ease,
    opacity 160ms ease;
}

.button__loader {
  animation: button-spin 1s linear infinite;
}

.button:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--info-ring) 50%, transparent);
  outline-offset: 2px;
}

.button--md {
  min-height: 40px;
  padding: 12px 24px;
}

.button--compact {
  min-height: 28px;
  padding: 6px 16px;
  border-radius: var(--radius-token-sm);
}

.button--pill {
  border-radius: var(--radius-token-pill);
}

.button--primary {
  background-color: var(--primary);
  color: var(--on-primary);
}

.button--primary:hover:not(.button--disabled) {
  background-color: var(--primary-active);
}

.button--secondary {
  background-color: var(--surface-card-dark);
  color: var(--on-dark);
}

.button--secondary:hover:not(.button--disabled) {
  background-color: var(--surface-elevated-dark);
}

.button--tertiary {
  background-color: transparent;
  color: var(--body);
}

.button--tertiary:hover:not(.button--disabled) {
  color: var(--on-dark);
}

.button--success {
  background-color: var(--success);
  color: var(--on-dark);
}

.button--success:hover:not(.button--disabled) {
  background-color: color-mix(in srgb, var(--success) 88%, black);
}

.button--danger {
  background-color: var(--danger);
  color: var(--on-primary);
}

.button--danger:hover:not(.button--disabled) {
  background-color: color-mix(in srgb, var(--danger) 88%, black);
}

.button--disabled {
  cursor: not-allowed;
}

.button--loading {
  cursor: wait;
}

.button--primary.button--disabled {
  background-color: var(--primary-disabled);
  color: var(--muted);
}

.button--secondary.button--disabled {
  background-color: var(--surface-card-dark);
  border-color: var(--border-strong);
  color: var(--muted);
}

.button--tertiary.button--disabled {
  color: var(--muted);
}

.button--success.button--disabled,
.button--danger.button--disabled {
  opacity: 0.48;
}

@keyframes button-spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}
</style>
