import { onClickOutside, useEventListener } from '@vueuse/core'
import type { Ref } from 'vue'

type UseOnClickOutsideOptions = {
  root: Ref<HTMLElement | null>
  close: () => void
}

const useOnClickOutside = ({ root, close }: UseOnClickOutsideOptions) => {
  onClickOutside(root, close)

  useEventListener(document, 'keydown', (event) => {
    if (event.key === 'Escape') {
      close()
    }
  })
}

export default useOnClickOutside
