<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import Avatar from '@/components/shared/Avatar.vue'
import type { WithFriendsParticipant } from '@/types/game'
import { countryFlagSrc } from '@/utils/game'

defineOptions({ name: 'WithFriendsParticipantList' })

const MAX_PLAYERS = 100

const props = defineProps<{
  participants: Array<WithFriendsParticipant>
}>()

const { t } = useI18n()
</script>

<template>
  <section class="with-friends-participant-list">
    <header class="with-friends-participant-list__header">
      <h2>{{ t('components.pages.Game.WithFriendsParticipantList.title') }}</h2>
      <span>
        {{
          t('components.pages.Game.WithFriendsParticipantList.count', {
            count: props.participants.length,
            maximum: MAX_PLAYERS,
          })
        }}
      </span>
    </header>

    <ul
      class="with-friends-participant-list__players"
      :aria-label="t('components.pages.Game.WithFriendsParticipantList.title')"
    >
      <li
        v-for="participant in props.participants"
        :key="participant.userId"
        class="with-friends-participant-list__player"
        :class="{ 'with-friends-participant-list__player--offline': !participant.isConnected }"
      >
        <Avatar :name="participant.displayName" size="sm" />
        <span class="with-friends-participant-list__identity">
          <span class="with-friends-participant-list__name">
            {{ participant.displayName }}
          </span>
          <img
            v-if="participant.country"
            :src="countryFlagSrc(participant.country)"
            :alt="participant.country.toUpperCase()"
            width="24"
            height="18"
          />
          <span v-if="participant.isHost" class="with-friends-participant-list__host">
            {{ t('components.pages.Game.WithFriendsParticipantList.host') }}
          </span>
        </span>
        <span
          class="with-friends-participant-list__status"
          :class="{
            'with-friends-participant-list__status--online': participant.isConnected,
          }"
        >
          {{
            participant.isConnected
              ? t('components.pages.Game.WithFriendsParticipantList.connected')
              : t('components.pages.Game.WithFriendsParticipantList.disconnected')
          }}
        </span>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.with-friends-participant-list {
  width: min(100%, 760px);
  padding: var(--spacing-lg);
  border: 1px solid var(--hairline);
  border-radius: var(--radius-token-xl);
  background-color: var(--surface-card-dark);
}

.with-friends-participant-list__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

.with-friends-participant-list__header h2,
.with-friends-participant-list__header span {
  margin: 0;
}

.with-friends-participant-list__header h2 {
  color: var(--on-dark);
  font-size: var(--font-size-title-md);
}

.with-friends-participant-list__header > span {
  color: var(--muted-strong);
  font-family: var(--font-number);
  font-size: var(--font-size-number-sm);
}

.with-friends-participant-list__players {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--spacing-xs);
  max-height: 440px;
  margin: 0;
  padding: 0;
  overflow-y: auto;
  list-style: none;
}

.with-friends-participant-list__player {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: var(--spacing-sm);
  min-width: 0;
  padding: var(--spacing-sm);
  border: 1px solid var(--hairline);
  border-radius: var(--radius-token-lg);
  background-color: var(--surface-elevated-dark);
}

.with-friends-participant-list__player--offline {
  opacity: 0.62;
}

.with-friends-participant-list__identity {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  min-width: 0;
}

.with-friends-participant-list__identity img {
  flex: 0 0 auto;
}

.with-friends-participant-list__name {
  max-width: 100%;
  overflow: hidden;
  color: var(--on-dark);
  font-weight: var(--font-weight-semibold);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.with-friends-participant-list__host,
.with-friends-participant-list__status {
  font-size: var(--font-size-caption);
}

.with-friends-participant-list__host {
  flex: 0 0 auto;
  padding: var(--spacing-xxs) var(--spacing-xs);
  border-radius: var(--radius-token-pill);
  background-color: var(--primary);
  color: var(--on-primary);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-copy);
}

.with-friends-participant-list__status {
  color: var(--muted-strong);
  white-space: nowrap;
}

.with-friends-participant-list__status--online {
  color: var(--success);
}

@media (max-width: 680px) {
  .with-friends-participant-list {
    padding: var(--spacing-md);
  }
}
</style>
