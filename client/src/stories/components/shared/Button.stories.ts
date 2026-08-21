import type { Meta, StoryObj } from '@storybook/vue3-vite'
import Button from '@/components/shared/Button.vue'

const meta = {
  title: 'Components/Shared/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'tertiary', 'success', 'danger'],
    },
    size: {
      control: 'select',
      options: ['md', 'compact'],
    },
    pill: { control: 'boolean' },
    disabled: { control: 'boolean' },
    loading: { control: 'boolean' },
    type: {
      control: 'select',
      options: ['button', 'submit', 'reset'],
    },
  },
  args: {
    variant: 'primary',
    size: 'md',
    pill: false,
    disabled: false,
    loading: false,
    type: 'button',
  },
  render: (args) => ({
    components: { Button },
    setup: () => ({ args }),
    template: '<Button v-bind="args">Button</Button>',
  }),
} satisfies Meta<typeof Button>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
