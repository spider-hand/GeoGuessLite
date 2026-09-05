import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { computed, ref } from 'vue'
import { fn, mocked, userEvent, within } from 'storybook/test'

import UserProfileSection from '@/components/pages/User/UserProfileSection.vue'
import useAuth from '@/composables/useAuth'
import useUserQuery from '@/composables/useUserQuery'

const showProfile = () => {
  mocked(useAuth).mockReturnValue({
    username: computed(() => 'Aki Explorer'),
    userCountry: computed(() => 'JP'),
    signOutUser: fn(),
  } as unknown as ReturnType<typeof useAuth>)
  mocked(useUserQuery).mockReturnValue({
    deleteUserAsync: fn(),
    isDeletingUser: ref(false),
    isUpdatingUser: ref(false),
    updateUserAsync: fn(),
  } as unknown as ReturnType<typeof useUserQuery>)
}

const meta = {
  title: 'Components/Pages/User/UserProfileSection',
  component: UserProfileSection,
  tags: ['autodocs'],
} satisfies Meta<typeof UserProfileSection>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = { beforeEach: showProfile }
export const Editing: Story = {
  beforeEach: showProfile,
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Edit Profile' }))
  },
}
export const DeleteConfirmation: Story = {
  beforeEach: showProfile,
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Delete Account' }))
  },
}
