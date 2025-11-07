import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface User {
  id: string
  email: string
  name?: string
  avatar?: string
  role: 'user' | 'admin'
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isAdmin: boolean
  isLoading: boolean  // 新增：跟踪 auth 状态是否正在从 localStorage 加载
  setUser: (user: User | null) => void
  setToken: (token: string | null) => void
  logout: () => void
  setIsLoading: (isLoading: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isAdmin: false,
      isLoading: true,  // 初始状态为 loading
      setUser: (user) =>
        set({ 
          user, 
          isAuthenticated: user !== null,
          isAdmin: user?.role === 'admin'
        }),
      setToken: (token) => set({ token }),
      logout: () =>
        set({ user: null, token: null, isAuthenticated: false, isAdmin: false }),
      setIsLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      // 当状态从 localStorage 恢复完成后，将 isLoading 设置为 false
      onRehydrateStorage: () => (state) => {
        state?.setIsLoading(false)
      },
    }
  )
)

