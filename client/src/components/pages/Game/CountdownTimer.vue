<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

defineOptions({
  name: 'GameCountdownTimer',
})

const props = defineProps<{
  startedAtMs: number
}>()

const emit = defineEmits<{
  expired: []
}>()

const DURATION_MS = 60_000
const DANGER_THRESHOLD_MS = 10_000
const TICK_INTERVAL_MS = 100

const nowMs = ref(Date.now())
const hasExpired = ref(false)
let timeoutId: number | null = null

const remainingMs = computed(() => Math.max(0, props.startedAtMs + DURATION_MS - nowMs.value))
const displaySeconds = computed(() => Math.floor(remainingMs.value / 1_000))
const formattedTime = computed(() => {
  const minutes = Math.floor(displaySeconds.value / 60)
  const seconds = displaySeconds.value % 60

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
})
const isDanger = computed(() => remainingMs.value > 0 && remainingMs.value < DANGER_THRESHOLD_MS)

const tick = () => {
  nowMs.value = Date.now()
  timeoutId = window.setTimeout(tick, TICK_INTERVAL_MS)
}

watch(remainingMs, (nextRemainingMs) => {
  if (nextRemainingMs === 0 && !hasExpired.value) {
    hasExpired.value = true
    emit('expired')
  }
})

watch(
  () => props.startedAtMs,
  () => {
    hasExpired.value = false
    nowMs.value = Date.now()
  },
)

onMounted(tick)

onBeforeUnmount(() => {
  if (timeoutId !== null) {
    window.clearTimeout(timeoutId)
  }
})
</script>

<template>
  <section class="countdown-timer" role="timer">
    <span class="countdown-timer__value" :class="{ 'countdown-timer__value--danger': isDanger }">
      {{ formattedTime }}
    </span>
  </section>
</template>

<style scoped>
.countdown-timer {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 84px;
  min-height: 44px;
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--hairline);
  border-radius: var(--radius-token-lg);
  background-color: transparent;
}

.countdown-timer__value {
  color: var(--on-dark);
  font-family: var(--font-number);
  font-size: var(--font-size-number-md);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-copy);
  letter-spacing: var(--letter-spacing-default);
  font-variant-numeric: tabular-nums;
}

.countdown-timer__value--danger {
  color: var(--danger);
}
</style>
