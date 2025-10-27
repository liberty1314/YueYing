'use client'

/**
 * 受保护路由组件
 * 
 * 用于保护需要登录才能访问的页面
 */

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

interface ProtectedRouteProps {
  children: React.ReactNode
  redirectTo?: string
}

export default function ProtectedRoute({
  children,
  redirectTo = '/login',
}: ProtectedRouteProps) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(redirectTo)
    }
  }, [status, router, redirectTo])

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return null
  }

  return <>{children}</>
}

