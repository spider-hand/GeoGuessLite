import type { Meta, StoryObj } from '@storybook/vue3-vite'

import Avatar from '@/components/shared/Avatar.vue'

const meta = {
  title: 'Components/Shared/Avatar',
  component: Avatar,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['md', 'sm'],
    },
  },
  args: {
    name: 'Taylor Swift',
    size: 'md',
  },
} satisfies Meta<typeof Avatar>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const AlternateColor: Story = {
  args: { name: 'Olivia Rodrigo' },
}

export const SingleWord: Story = {
  args: { name: 'Taylor' },
}

export const Fallback: Story = {
  args: { name: '' },
}
