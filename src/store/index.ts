import { create } from 'zustand'

interface AppState {
  token: string | null
  setToken: (token: string | null) => void
  user: any | null
  setUser: (user: any | null) => void
}

export const useStore = create<AppState>((set) => ({
  token: localStorage.getItem('admin_token') || null,
  setToken: (token) => {
    if (token) localStorage.setItem('admin_token', token)
    else localStorage.removeItem('admin_token')
    set({ token })
  },
  user: null,
  setUser: (user) => set({ user }),
}))
