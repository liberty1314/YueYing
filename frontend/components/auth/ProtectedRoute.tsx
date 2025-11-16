'use client'

/**
 * 受保护路由组件
 * 
 * 用于保护需要登录才能访问的页面
 * 未登录时显示 toast 提示并跳转到登录页
 */

import { useSession } from 'next-auth/react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useEffect, useRef } from 'react'
import { useToast } from '@/hooks/use-toast'

interface ProtectedRouteProps {
  children: React.ReactNode
  redirectTo?: string
  showToast?: boolean
  toastMessage?: string
}

export default function ProtectedRoute({
  children,
  redirectTo = '/login',
  showToast = true,
  toastMessage = '请先登录才能访问此页面',
}: ProtectedRouteProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const hasShownToast = useRef(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      // 构建回调 URL（当前页面的完整路径）
      const currentPath = pathname || '/'
      const queryString = searchParams?.toString()
      const callbackUrl = queryString ? `${currentPath}?${queryString}` : currentPath

      // 显示 toast 提示（只显示一次）
      if (showToast && !hasShownToast.current) {
        toast({
          title: '需要登录',
          description: toastMessage,
          variant: 'default',
        })
        hasShownToast.current = true
      }

      // 跳转到登录页，并保存回调 URL
      const loginUrl = `${redirectTo}?callbackUrl=${encodeURIComponent(callbackUrl)}`
      router.push(loginUrl)
    }
  }, [status, router, redirectTo, pathname, searchParams, showToast, toastMessage, toast])

  // 加载中状态
  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-sm text-muted-foreground">加载中...</p>
        </div>
      </div>
    )
  }

  // 未登录状态（正在跳转）
  if (status === 'unauthenticated') {
    return null
  }

  // 已登录，渲染子组件
  return <>{children}</>
}

