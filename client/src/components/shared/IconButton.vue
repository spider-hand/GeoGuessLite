<script setup lang="ts">
import { computed } from 'vue'

type IconButtonSize = 'md' | 'compact'

defineOptions({
  name: 'SharedIconButton',
})

const props = withDefaults(
  defineProps<{
    ariaLabel: string
    size?: IconButtonSize
    disabled?: boolean
    type?: 'button' | 'submit' | 'reset'
  }>(),
  {
    size: 'md',
    disabled: false,
    type: 'button',
  },
)

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const classNames = computed(() => [
  'icon-button',
  `icon-button--${props.size}`,
  {
    'icon-button--disabled': props.disabled,
  },
])

const handleClick = (event: MouseEvent) => {
  if (props.disabled) {
    event.preventDefault()
    event.stopPropagation()
    return
  }

  emit('click', event)
}
</script>

<template>
  <button
    :aria-label="ariaLabel"
    :class="classNames"
    :disabled="disabled"
    :type="type"
    @click="handleClick"
  >
    <slot />
  </button>
</template>

<style scoped>
.icon-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: var(--radius-token-full);
  padding: 0;
  background: transparent;
  color: var(--body);
  cursor: pointer;
  transition:
    color 160ms ease,
    opacity 160ms ease;
}

.icon-button :deep(svg) {
  display: block;
}

.icon-button:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--info-ring) 50%, transparent);
  outline-offset: 2px;
}

.icon-button:hover:not(.icon-button--disabled) {
  color: var(--primary);
}

.icon-button--md {
  width: 40px;
  height: 40px;
}

.icon-button--compact {
  width: 28px;
  height: 28px;
}

.icon-button--disabled {
  color: var(--muted);
  cursor: not-allowed;
}
</style>
