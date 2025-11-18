'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SessionProvider, useSession } from 'next-auth/react'
import { ThemeProvider } from 'next-themes'
import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { GlobalTaskNotifications } from '@/components/common/GlobalTaskNotifications'

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
            // 全局配置 - 优化缓存策略
            staleTime: 5 * 60 * 1000, // 5分钟 - 数据在5分钟内被认为是新鲜的
            gcTime: 10 * 60 * 1000, // 10分钟 - 缓存保留时间（原 cacheTime）
            refetchOnWindowFocus: false, // 窗口聚焦时不重新请求
            refetchOnMount: false, // 组件挂载时不自动重新请求（如果有缓存）
            refetchOnReconnect: false, // 网络重连时不自动重新请求
            retry: 1, // 失败重试1次
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
        >
          {/* 全局任务通知 - 无论在哪个页面都能收到后台任务完成通知 */}
          <GlobalTaskNotifications />
          {children}
        </ThemeProvider>
      </QueryClientProvider>
    </SessionProvider>
  )
}

