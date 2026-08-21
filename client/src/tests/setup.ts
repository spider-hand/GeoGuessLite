import { vi } from 'vitest'

vi.mock('@/lib/firebase', () => ({
  firebaseApp: {},
  firebaseAuth: { currentUser: null },
  googleAuthProvider: {},
  getFirebaseDatabase: vi.fn(() => ({})),
}))
