<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

import CountrySelect from '@/components/pages/User/CountrySelect.vue'
import DeleteAccountModal from '@/components/pages/User/DeleteAccountModal.vue'
import Avatar from '@/components/shared/Avatar.vue'
import Button from '@/components/shared/Button.vue'
import useAuth from '@/composables/useAuth'
import useCountry from '@/composables/useCountry'
import useUserQuery from '@/composables/useUserQuery'

defineOptions({ name: 'UserProfileSection' })

const { t } = useI18n()
const router = useRouter()
const { username, userCountry, signOutUser } = useAuth()
const { countryFlagAlt, countryFlagSrc } = useCountry()
const { deleteUserAsync, isDeletingUser, isUpdatingUser, updateUserAsync } = useUserQuery()
const isEditing = ref(false)
const isDeleteOpen = ref(false)
const displayName = ref('')
const selectedCountry = ref<string | null>(null)
const profileError = ref<string | null>(null)
const deleteError = ref<string | null>(null)
const nameError = computed(() =>
  displayName.value.trim() ? null : t('components.pages.User.nameRequiredError'),
)
const canSave = computed(
  () =>
    !nameError.value &&
    (displayName.value.trim() !== username.value.trim() ||
      selectedCountry.value !== (userCountry.value ?? null)),
)

const startEditing = () => {
  displayName.value = username.value
  selectedCountry.value = userCountry.value ?? null
  profileError.value = null
  isEditing.value = true
}
const cancelEditing = () => {
  isEditing.value = false
  profileError.value = null
}
const saveProfile = async () => {
  if (!canSave.value) return
  try {
    profileError.value = null
    await updateUserAsync({ displayName: displayName.value.trim(), country: selectedCountry.value })
    isEditing.value = false
  } catch (error) {
    console.error(error)
    profileError.value = t('components.pages.User.saveError')
  }
}
const deleteAccount = async () => {
  try {
    deleteError.value = null
    await deleteUserAsync()
    await signOutUser()
    await router.push('/')
  } catch (error) {
    console.error(error)
    deleteError.value = t('components.pages.User.DeleteAccountModal.deleteError')
  }
}
</script>

<template>
  <section class="user-profile-section">
    <div class="user-profile-section__heading">
      <Avatar :name="username" size="md" />
      <Button v-if="!isEditing" size="compact" @click="startEditing">
        {{ t('components.pages.User.editProfile') }}
      </Button>
    </div>
    <div class="user-profile-section__name">
      <span class="user-profile-section__label">{{ t('components.pages.User.name') }}</span>
      <template v-if="isEditing">
        <input v-model="displayName" maxlength="50" type="text" />
        <p v-if="nameError" class="user-profile-section__error">{{ nameError }}</p>
        <p v-if="profileError" class="user-profile-section__error">{{ profileError }}</p>
        <CountrySelect :country="selectedCountry" @select="selectedCountry = $event" />
        <div class="user-profile-section__actions">
          <Button variant="secondary" :disabled="isUpdatingUser" @click="cancelEditing">
            {{ t('components.pages.User.cancel') }}
          </Button>
          <Button :disabled="!canSave" :loading="isUpdatingUser" @click="saveProfile">
            {{ t('components.pages.User.saveChanges') }}
          </Button>
        </div>
      </template>
      <span v-else class="user-profile-section__display-name">
        {{ username }}
        <img
          v-if="userCountry"
          :src="countryFlagSrc(userCountry)"
          :alt="countryFlagAlt(userCountry)"
        />
      </span>
    </div>
    <Button class="user-profile-section__delete" variant="danger" @click="isDeleteOpen = true">
      {{ t('components.pages.User.deleteAccount') }}
    </Button>
  </section>
  <DeleteAccountModal
    :error-message="deleteError"
    :is-deleting="isDeletingUser"
    :is-open="isDeleteOpen"
    @close="isDeleteOpen = false"
    @delete="deleteAccount"
  />
</template>

<style scoped>
.user-profile-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  width: min(100%, 480px);
  margin-top: var(--spacing-xl);
}
.user-profile-section__heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-md);
}
.user-profile-section__name {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}
.user-profile-section__label {
  color: var(--muted);
  font-size: var(--font-size-body-sm);
}
.user-profile-section__display-name {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  color: var(--on-dark);
  font-size: var(--font-size-title-md);
  font-weight: var(--font-weight-semibold);
}
.user-profile-section__display-name img {
  width: 24px;
  height: 18px;
}
.user-profile-section__name > input {
  min-height: 40px;
  border: 1px solid var(--hairline);
  border-radius: var(--radius-token-md);
  padding: 0 var(--spacing-sm);
  background: var(--surface-card-dark);
  color: var(--on-dark);
  font: inherit;
}
.user-profile-section__name > input:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--info-ring) 50%, transparent);
  outline-offset: 2px;
}
.user-profile-section__actions {
  display: flex;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-sm);
}
.user-profile-section__delete {
  align-self: flex-start;
  margin-top: var(--spacing-lg);
}
.user-profile-section__error {
  margin: 0;
  color: var(--danger);
  font-size: var(--font-size-body-sm);
}
</style>
