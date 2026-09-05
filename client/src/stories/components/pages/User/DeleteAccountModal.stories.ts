import type { Meta, StoryObj } from '@storybook/vue3-vite'

import DeleteAccountModal from '@/components/pages/User/DeleteAccountModal.vue'

const meta = {
  title: 'Components/Pages/User/DeleteAccountModal',
  component: DeleteAccountModal,
  tags: ['autodocs'],
  args: { errorMessage: null, isDeleting: false, isOpen: true },
} satisfies Meta<typeof DeleteAccountModal>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const Deleting: Story = { args: { isDeleting: true } }
export const Failed: Story = { args: { errorMessage: 'Unable to delete your account.' } }
