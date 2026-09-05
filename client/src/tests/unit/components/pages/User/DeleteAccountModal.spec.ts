import { expect, it } from 'vitest'
import { render } from 'vitest-browser-vue'

import DeleteAccountModal from '@/components/pages/User/DeleteAccountModal.vue'
import { createAppI18n } from '@/i18n'

const renderModal = () =>
  render(DeleteAccountModal, {
    props: { errorMessage: null, isDeleting: false, isOpen: true },
    global: { plugins: [createAppI18n()] },
  })

it('should reject an incorrect confirmation', async () => {
  const screen = renderModal()

  await screen.getByPlaceholder('Type Delete to continue').fill('delete')
  await screen.getByRole('button', { name: 'Delete', exact: true }).click()

  await expect.element(screen.getByText('Type Delete to continue')).toBeVisible()
  expect(screen.emitted('delete')).toBeUndefined()
})

it('should emit delete for the exact confirmation', async () => {
  const screen = renderModal()

  await screen.getByPlaceholder('Type Delete to continue').fill('Delete')
  await screen.getByRole('button', { name: 'Delete', exact: true }).click()

  expect(screen.emitted('delete')).toEqual([[]])
})
