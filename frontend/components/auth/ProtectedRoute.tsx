'use client'

/**
 * 受保护路由组件（简化版）
 * 
 * ## 使用场景
 * 
 * 此组件仅用于 Middleware 无法处理的特殊场景：
 * 1. 在客户端组件中需要显示会话加载状态
 * 2. 在客户端组件中需要访问会话上下文
 * 
 * ## 重要说明
 * 
 * - **优先使用 Server Component**: 大多数情况下应该使用 Server Component + 服务端认证工具
 * - **Middleware 已处理基本认证**: 实际的认证重定向由服务端 Middleware 处理
 * - **此组件不执行权限检查**: 仅用于 UI 状态管理
 * 
 * ## 使用示例
 * 
 * ```typescript
 * // 仅在客户端组件中使用
 * 'use client'
 * 
 * import ProtectedRoute from '@/components/auth/ProtectedRoute'
 * 
 * export default function ClientPage() {
 *   return (
 *     <ProtectedRoute>
 *       <div>Protected Content</div>
 *     </ProtectedRoute>
 *   )
 * }
 * ```
 * 
 * ## 推荐做法
 * 
 * 优先使用 Server Component：
 * 
 * ```typescript
 * // 推荐：使用 Server Component
 * import { getServerSession, redirectToLogin } from '@/lib/auth/server-auth'
 * 
 * export default async function ServerPage() {
 *   const session = await getServerSession()
 *   if (!session) {
 *     redirectToLogin('/protected-page')
 *   }
 *   
 *   return <div>Protected Content</div>
 * }
 * ```
 * 
 * @see {@link file://./lib/auth/README.md} 完整的认证文档
 */

import { useSession } from 'next-auth/react'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { status } = useSession()

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

  // 已登录，渲染子组件
  // 注意：如果未登录，middleware 会在到达这里之前重定向
  return <>{children}</>
}

