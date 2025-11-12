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

// 安全的存储实现：在服务器端使用内存存储，客户端使用 localStorage
const getStorage = () => {
  if (typeof window === 'undefined') {
    // 服务器端：返回一个简单的内存存储实现
    return {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    }
  }
  // 客户端：使用 localStorage
  return localStorage
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
      storage: createJSONStorage(() => getStorage()),
      // 当状态从 localStorage 恢复完成后，将 isLoading 设置为 false
      onRehydrateStorage: () => (state) => {
        state?.setIsLoading(false)
      },
    }
  )
)

