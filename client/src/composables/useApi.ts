import { useCurrentUser } from 'vuefire'

import { firebaseAuth } from '@/lib/firebase'
import { Configuration } from '@/services'

const useApi = () => {
  const currentUser = useCurrentUser()
  const apiConfig = new Configuration({
    basePath: import.meta.env.VITE_API_BASE_URL,
    accessToken: async () => {
      const authenticatedUser = firebaseAuth.currentUser ?? currentUser.value
      return authenticatedUser?.getIdToken() ?? ''
    },
  })

  return { apiConfig }
}

export default useApi
