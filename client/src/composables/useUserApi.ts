import useApi from '@/composables/useApi'
import { DefaultApi, type GetUser200Response } from '@/services'

const useUserApi = () => {
  const { apiConfig } = useApi()
  const usersApi = new DefaultApi(apiConfig)

  const getUser = async (userId: string): Promise<GetUser200Response> => {
    return usersApi.getUser({ userId })
  }

  return { getUser }
}

export default useUserApi
