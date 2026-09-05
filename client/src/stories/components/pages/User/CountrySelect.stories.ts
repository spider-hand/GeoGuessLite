import type { Meta, StoryObj } from '@storybook/vue3-vite'

import CountrySelect from '@/components/pages/User/CountrySelect.vue'

const meta = {
  title: 'Components/Pages/User/CountrySelect',
  component: CountrySelect,
  tags: ['autodocs'],
  args: { country: 'JP' },
} satisfies Meta<typeof CountrySelect>

export default meta
type Story = StoryObj<typeof meta>

export const Selected: Story = {}
export const NoCountry: Story = { args: { country: null } }
