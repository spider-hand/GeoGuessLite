<script setup lang="ts">
import { computed } from 'vue'

type AvatarSize = 'md' | 'sm'

defineOptions({
  name: 'SharedAvatar',
})

const props = defineProps<{
  name: string
  size: AvatarSize
}>()

const normalizedName = computed(() => props.name.trim())

const initials = computed(() => {
  const words = normalizedName.value
    .split(/\s+/)
    .map((word) => word.replace(/[^\p{L}\p{N}]/gu, ''))
    .filter(Boolean)

  if (words.length === 0) {
    return '?'
  }

  if (words.length === 1) {
    return words[0]!.slice(0, 2).toUpperCase()
  }

  return `${words[0]![0]}${words[1]![0]}`.toUpperCase()
})

const backgroundColor = computed(() => {
  const colorKey = normalizedName.value.toLocaleLowerCase()

  if (colorKey.length === 0) {
    return 'var(--surface-card-dark)'
  }

  let hash = 0

  for (const character of colorKey) {
    hash = (hash * 31 + character.codePointAt(0)!) >>> 0
  }

  const hue = hash % 360
  const saturation = 68 + (hash % 11)
  const lightness = 40 + ((hash >> 4) % 8)

  return `hsl(${hue} ${saturation}% ${lightness}%)`
})
</script>

<template>
  <span
    class="avatar"
    :class="`avatar--${props.size}`"
    :style="{ backgroundColor }"
    aria-hidden="true"
  >
    {{ initials }}
  </span>
</template>

<style scoped>
.avatar {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-token-full);
  color: var(--on-dark);
  font-family: var(--font-body);
  font-weight: var(--font-weight-semibold);
  line-height: 1;
  text-transform: uppercase;
}

.avatar--md {
  width: 40px;
  height: 40px;
  font-size: var(--font-size-body-md);
}

.avatar--sm {
  width: 32px;
  height: 32px;
  font-size: var(--font-size-body-sm);
}
</style>
