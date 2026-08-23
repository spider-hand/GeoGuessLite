import { computed } from 'vue'
import { getCurrentUser, useCurrentUser, useFirebaseAuth, useIsCurrentUserLoaded } from 'vuefire'
import { signInAnonymously, signInWithPopup, signOut } from 'firebase/auth'

import useUserQuery from '@/composables/useUserQuery'
import { firebaseAuth, googleAuthProvider } from '@/lib/firebase'

export const signInAnonymouslyIfNeeded = async () => {
  const currentUser = await getCurrentUser()

  if (currentUser) {
    return currentUser
  }

  return (await signInAnonymously(firebaseAuth)).user
}

const useAuth = () => {
  const isCurrentUserLoaded = useIsCurrentUserLoaded()
  const currentUser = useCurrentUser()
  const auth = useFirebaseAuth()!
  const userId = computed(() => {
    if (!currentUser.value || currentUser.value.isAnonymous) {
      return null
    }

    return currentUser.value.uid
  })
  const { createUserAsync, isCreatingUser, isLoadingUser, refetchUser, user } = useUserQuery(userId)
  const isAuthenticatedUser = computed(() => !!currentUser.value)
  const isAnonymousUser = computed(() => currentUser.value?.isAnonymous ?? false)
  const isRegisteredUser = computed(
    () => isAuthenticatedUser.value && !isAnonymousUser.value && !!user.value,
  )
  const username = computed(() =>
    currentUser.value?.isAnonymous
      ? 'Guest'
      : (user.value?.displayName ?? currentUser.value?.displayName?.trim() ?? 'Guest'),
  )
  const userCountry = computed(() =>
    currentUser.value?.isAnonymous ? undefined : (user.value?.country ?? undefined),
  )

  const signUpWithGoogle = async () => {
    const currentFirebaseUser = await getCurrentUser()

    if (currentFirebaseUser?.isAnonymous) {
      await signOut(firebaseAuth)
    }

    const credential = await signInWithPopup(auth, googleAuthProvider)
    const displayName = credential.user.displayName?.trim()

    if (!displayName) {
      await signOut(auth)
      throw new Error('Authenticated user must have a display name.')
    }

    try {
      await createUserAsync({ displayName })
      await refetchUser()
    } catch (error) {
      await signOut(auth)
      throw error
    }

    return credential
  }

  const signInAnonymously = async () => signInAnonymouslyIfNeeded()

  const signOutUser = async () => signOut(auth)

  return {
    currentUser,
    isAnonymousUser,
    isAuthenticatedUser,
    isCreatingUser,
    isCurrentUserLoaded,
    isLoadingUser,
    isRegisteredUser,
    signInAnonymously,
    signUpWithGoogle,
    signOutUser,
    user,
    userCountry,
    username,
  }
}

export default useAuth
