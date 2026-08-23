import { beforeEach, expect, it, vi } from 'vitest'
import { ref } from 'vue'

type MockFirebaseUser = {
  displayName?: string | null
  isAnonymous?: boolean
  uid?: string
}

const currentUser = ref<MockFirebaseUser | null>(null)
const mockGetCurrentUser = vi.fn()
const mockSignInAnonymously = vi.fn()
const mockSignInWithPopup = vi.fn()
const mockSignOut = vi.fn()
const mockCreateUserAsync = vi.fn()
const mockRefetchUser = vi.fn()
const user = ref<{ displayName: string; country?: string } | undefined>(undefined)

vi.mock('vuefire', () => ({
  getCurrentUser: () => mockGetCurrentUser(),
  useCurrentUser: () => currentUser,
  useFirebaseAuth: () => ({ name: 'auth' }),
  useIsCurrentUserLoaded: () => ref(true),
}))

vi.mock('firebase/auth', () => ({
  signInAnonymously: (...args: unknown[]) => mockSignInAnonymously(...args),
  signInWithPopup: (...args: unknown[]) => mockSignInWithPopup(...args),
  signOut: (...args: unknown[]) => mockSignOut(...args),
}))

vi.mock('@/lib/firebase', () => ({
  firebaseAuth: { name: 'auth' },
  googleAuthProvider: { name: 'google' },
}))

vi.mock('@/composables/useUserQuery', () => ({
  default: () => ({
    createUserAsync: (...args: unknown[]) => mockCreateUserAsync(...args),
    isCreatingUser: ref(false),
    isLoadingUser: ref(false),
    refetchUser: (...args: unknown[]) => mockRefetchUser(...args),
    user,
  }),
}))

beforeEach(() => {
  currentUser.value = null
  user.value = undefined
  mockGetCurrentUser.mockReset()
  mockSignInAnonymously.mockReset()
  mockSignInWithPopup.mockReset()
  mockSignOut.mockReset()
  mockCreateUserAsync.mockReset()
  mockRefetchUser.mockReset()
})

it('should expose registered user state from the current user profile', async () => {
  currentUser.value = { uid: 'user-123', displayName: 'Ignored Firebase Name' }
  user.value = { displayName: 'Taylor Swift', country: 'JP' }
  const { default: useAuth } = await import('@/composables/useAuth')

  const auth = useAuth()

  expect(auth.username.value).toBe('Taylor Swift')
  expect(auth.userCountry.value).toBe('JP')
  expect(auth.isAuthenticatedUser.value).toBe(true)
  expect(auth.isRegisteredUser.value).toBe(true)
})

it('should treat anonymous users as unregistered guests', async () => {
  currentUser.value = { uid: 'guest-123', isAnonymous: true }
  const { default: useAuth } = await import('@/composables/useAuth')

  const auth = useAuth()

  expect(auth.username.value).toBe('Guest')
  expect(auth.isAuthenticatedUser.value).toBe(true)
  expect(auth.isAnonymousUser.value).toBe(true)
  expect(auth.isRegisteredUser.value).toBe(false)
})

it('should reuse an existing Firebase user for anonymous sign-in', async () => {
  const existingUser = { uid: 'user-123' }
  mockGetCurrentUser.mockResolvedValue(existingUser)
  const { signInAnonymouslyIfNeeded } = await import('@/composables/useAuth')

  await expect(signInAnonymouslyIfNeeded()).resolves.toBe(existingUser)
  expect(mockSignInAnonymously).not.toHaveBeenCalled()
})

it('should create an anonymous Firebase user when no user exists', async () => {
  mockGetCurrentUser.mockResolvedValue(null)
  mockSignInAnonymously.mockResolvedValue({ user: { uid: 'guest-123' } })
  const { signInAnonymouslyIfNeeded } = await import('@/composables/useAuth')

  await expect(signInAnonymouslyIfNeeded()).resolves.toEqual({ uid: 'guest-123' })
})

it('should create and refresh the user after Google sign-up', async () => {
  mockGetCurrentUser.mockResolvedValue(null)
  mockSignInWithPopup.mockResolvedValue({ user: { displayName: 'Taylor Swift' } })
  mockCreateUserAsync.mockResolvedValue({})
  const { default: useAuth } = await import('@/composables/useAuth')

  await useAuth().signUpWithGoogle()

  expect(mockCreateUserAsync).toHaveBeenCalledWith({ displayName: 'Taylor Swift' })
  expect(mockRefetchUser).toHaveBeenCalledOnce()
})

it('should sign out an anonymous user before Google sign-up', async () => {
  mockGetCurrentUser.mockResolvedValue({ isAnonymous: true })
  mockSignInWithPopup.mockResolvedValue({ user: { displayName: 'Taylor Swift' } })
  mockCreateUserAsync.mockResolvedValue({})
  const { default: useAuth } = await import('@/composables/useAuth')

  await useAuth().signUpWithGoogle()

  expect(mockSignOut).toHaveBeenCalledOnce()
})

it('should sign out when the Google user has no display name', async () => {
  mockSignInWithPopup.mockResolvedValue({ user: { displayName: '  ' } })
  const { default: useAuth } = await import('@/composables/useAuth')

  await expect(useAuth().signUpWithGoogle()).rejects.toThrow(
    'Authenticated user must have a display name.',
  )
  expect(mockCreateUserAsync).not.toHaveBeenCalled()
  expect(mockSignOut).toHaveBeenCalledOnce()
})

it('should sign out when user creation fails', async () => {
  mockSignInWithPopup.mockResolvedValue({ user: { displayName: 'Taylor Swift' } })
  mockCreateUserAsync.mockRejectedValue(new Error('failed'))
  const { default: useAuth } = await import('@/composables/useAuth')

  await expect(useAuth().signUpWithGoogle()).rejects.toThrow('failed')
  expect(mockSignOut).toHaveBeenCalledOnce()
})
