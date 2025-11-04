'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SessionProvider, useSession } from 'next-auth/react'
import { ThemeProvider } from 'next-themes'
import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'

// 同步 NextAuth session 到 authStore
function AuthSync() {
  const { data: session, status } = useSession()
  const { setUser, setToken, logout } = useAuthStore()

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      // 同步用户信息到 authStore
      setUser({
        id: session.user.id,
        email: session.user.email || '',
        name: session.user.name || '',
        avatar: session.user.image,
        role: session.user.role || 'user',
      })
      setToken(session.accessToken)
    } else if (status === 'unauthenticated') {
      // 用户未登录，清除 authStore
      logout()
    }
  }, [session, status, setUser, setToken, logout])

  return null
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // 全局配置
            staleTime: 60 * 1000, // 1分钟
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  )

  return (
    <SessionProvider>
      <AuthSync />
      <QueryClientProvider client={queryClient}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </QueryClientProvider>
    </SessionProvider>
  )
}

