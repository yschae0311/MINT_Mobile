import * as SecureStore from 'expo-secure-store'
import { create } from 'zustand'

import { fetchMe } from '../api/mintApi'
import type { User } from '../types'

const TOKEN_KEY = 'mint.access_token'

interface AuthState {
  token: string | null
  user: User | null
  hydrated: boolean
  setSession: (token: string, user: User) => Promise<void>
  restoreSession: () => Promise<void>
  clearSession: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  hydrated: false,

  setSession: async (token, user) => {
    await SecureStore.setItemAsync(TOKEN_KEY, token, {
      keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    })
    set({ token, user, hydrated: true })
  },

  restoreSession: async () => {
    const token = await SecureStore.getItemAsync(TOKEN_KEY)
    if (!token) {
      set({ token: null, user: null, hydrated: true })
      return
    }
    set({ token })
    try {
      const user = await fetchMe()
      set({ user, hydrated: true })
    } catch {
      await SecureStore.deleteItemAsync(TOKEN_KEY)
      set({ token: null, user: null, hydrated: true })
    }
  },

  clearSession: async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY)
    set({ token: null, user: null, hydrated: true })
  },
}))
