import { useCallback, useEffect, useMemo, useReducer } from 'react'
import { getToken, setToken } from '../api/client'
import * as api from '../api/endpoints'
import { AuthContext, type AuthState, type AuthValue } from './AuthContext'
import type { User } from '../api/types'

type AuthAction =
  | { type: 'restored'; user: User | null }
  | { type: 'signed-in'; user: User }
  | { type: 'awaiting-confirmation'; phone: string }
  | { type: 'confirmed'; user: User }
  | { type: 'signed-out' }

function reducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'restored':
      return { ...state, user: action.user, loading: false }
    case 'signed-in':
      return { ...state, user: action.user, loading: false }
    case 'awaiting-confirmation':
      return { ...state, awaitingConfirmation: action.phone }
    case 'confirmed':
      return { ...state, user: action.user, awaitingConfirmation: null }
    case 'signed-out':
      return { user: null, loading: false, awaitingConfirmation: null }
  }
}

/**
 * Who is signed in.
 *
 * The token is the only thing that survives a reload; the user is fetched
 * back from `/api/auth/me` on start, so a token the server has since
 * rejected cannot leave the app showing a signed-in shell.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {
    user: null,
    loading: Boolean(getToken()),
    awaitingConfirmation: null,
  })

  useEffect(() => {
    if (!getToken()) {
      dispatch({ type: 'restored', user: null })
      return
    }
    let cancelled = false
    api
      .me()
      .then((user) => {
        if (!cancelled) dispatch({ type: 'restored', user })
      })
      .catch(() => {
        if (!cancelled) dispatch({ type: 'restored', user: null })
      })
    return () => {
      cancelled = true
    }
  }, [])

  const signIn = useCallback(async (phone: string, pin: string) => {
    const auth = await api.login(phone, pin)
    setToken(auth.access_token)
    dispatch({ type: 'signed-in', user: auth.user })
    return auth.user
  }, [])

  const signUp = useCallback(async (input: api.RegisterInput) => {
    const auth = await api.register(input)
    setToken(auth.access_token)
    dispatch({ type: 'signed-in', user: auth.user })
    dispatch({ type: 'awaiting-confirmation', phone: auth.user.phone })
    return auth.user
  }, [])

  const confirmPhone = useCallback(async (code: string) => {
    const user = await api.confirmPhone(code)
    dispatch({ type: 'confirmed', user })
    return user
  }, [])

  const signOut = useCallback(() => {
    setToken(null)
    dispatch({ type: 'signed-out' })
  }, [])

  const refresh = useCallback(async () => {
    if (!getToken()) return
    try {
      dispatch({ type: 'restored', user: await api.me() })
    } catch {
      dispatch({ type: 'signed-out' })
    }
  }, [])

  const value = useMemo<AuthValue>(
    () => ({
      ...state,
      signIn,
      signUp,
      confirmPhone,
      signOut,
      refresh,
      hasRole: (role) => Boolean(state.user?.roles.includes(role)),
    }),
    [state, signIn, signUp, confirmPhone, signOut, refresh],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
