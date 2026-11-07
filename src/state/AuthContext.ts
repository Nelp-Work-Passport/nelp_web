import { createContext } from 'react'
import type { Role, User } from '../api/types'
import type { RegisterInput } from '../api/endpoints'

export interface AuthState {
  user: User | null
  /** True until the stored token has been checked against the server. */
  loading: boolean
  /** The phone a sign-up is waiting to confirm, so the code page knows it. */
  awaitingConfirmation: string | null
}

export interface AuthValue extends AuthState {
  signIn: (phone: string, pin: string) => Promise<User>
  signUp: (input: RegisterInput) => Promise<User>
  confirmPhone: (code: string) => Promise<User>
  signOut: () => void
  refresh: () => Promise<void>
  /** True when the signed-in user holds this role. */
  hasRole: (role: Role) => boolean
}

export const AuthContext = createContext<AuthValue | null>(null)
