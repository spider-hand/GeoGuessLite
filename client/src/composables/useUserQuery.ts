import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { computed, toValue, type MaybeRefOrGetter } from 'vue'

import useApi from '@/composables/useApi'
import {
  Configuration,
  DefaultApi,
  type CreateUser200Response,
  type CreateUserRequest,
  type GetCurrentUser200Response,
  type UpdateUser200Response,
  type UpdateUserRequest,
} from '@/services'

type CreateUserVariables = {
  createUserRequest: CreateUserRequest
  idToken: string
}

const useUserQuery = (userId?: MaybeRefOrGetter<string | null>) => {
  const { apiConfig } = useApi()
  const usersApi = new DefaultApi(apiConfig)
  const queryClient = useQueryClient()
  const normalizedUserId = computed(() => toValue(userId) ?? null)
  const userQuery = useQuery<GetCurrentUser200Response>({
    queryKey: computed(() => ['user', normalizedUserId.value]),
    enabled: computed(() => normalizedUserId.value !== null),
    queryFn: async () => usersApi.getCurrentUser(),
    staleTime: Infinity,
  })

  const createUserMutation = useMutation({
    mutationFn: async ({ createUserRequest, idToken }: CreateUserVariables) => {
      const authenticatedUsersApi = new DefaultApi(
        new Configuration({
          basePath: import.meta.env.VITE_API_BASE_URL,
          accessToken: idToken,
        }),
      )

      return authenticatedUsersApi.createUser({ createUserRequest })
    },
    onSuccess: (user: CreateUser200Response) => {
      queryClient.invalidateQueries({ queryKey: ['user', user.userId] })
    },
  })

  const updateUserMutation = useMutation({
    mutationFn: async (updateUserRequest: UpdateUserRequest) => {
      return usersApi.updateUser({ updateUserRequest })
    },
    onSuccess: (user: UpdateUser200Response) => {
      queryClient.invalidateQueries({ queryKey: ['user', user.userId] })
    },
  })

  const deleteUserMutation = useMutation({
    mutationFn: async () => usersApi.deleteUser(),
  })

  return {
    createUser: createUserMutation.mutate,
    createUserAsync: createUserMutation.mutateAsync,
    deleteUser: deleteUserMutation.mutate,
    deleteUserAsync: deleteUserMutation.mutateAsync,
    isCreatingUser: createUserMutation.isPending,
    isDeletingUser: deleteUserMutation.isPending,
    isLoadingUser: userQuery.isLoading,
    isUpdatingUser: updateUserMutation.isPending,
    refetchUser: userQuery.refetch,
    updateUser: updateUserMutation.mutate,
    updateUserAsync: updateUserMutation.mutateAsync,
    user: userQuery.data,
  }
}

export default useUserQuery
