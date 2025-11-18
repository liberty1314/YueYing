/**
 * Next.js 中间件
 * 
 * 服务端权限检查入口：
 * - 公开路由：登录页(/login)、注册页(/register) - 无需认证
 * - 首页(/)：允许访问，但在 Server Component 中根据系统设置决定是否需要登录
 * - 管理员路由(/admin/*)：需要管理员权限（在 Server Component 中进一步检查）
 * - 其他所有路由：需要认证
 * 
 * 权限检查流程：
 * 1. Middleware 检查基本认证（是否有 token）
 * 2. Server Component 检查细粒度权限（如管理员角色、系统设置等）
 */

import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'
import { isPublicRoute, isAdminRoute, isHomeRoute, buildLoginUrl } from '@/lib/auth/middleware-helpers'

export default withAuth(
  function middleware(req) {
    try {
      const { pathname } = req.nextUrl
      const token = req.nextauth.token

      // 已通过认证的请求会到达这里
      // 记录访问日志（仅在开发环境）
      if (process.env.NODE_ENV === 'development') {
        console.log(JSON.stringify({
          event: 'middleware_access',
          pathname,
          authenticated: !!token,
          role: token?.role || 'anonymous',
          timestamp: new Date().toISOString(),
        }))
      }

      // 管理员路由需要在 Server Component 中进一步检查角色
      // 这里只确保用户已认证
      if (isAdminRoute(pathname)) {
        if (!token) {
          // 未认证用户访问管理员路由，重定向到登录页
          const loginUrl = buildLoginUrl(pathname)
          console.warn(JSON.stringify({
            event: 'auth_check_failed',
            path: pathname,
            reason: 'no_token_admin_route',
            redirect: loginUrl,
            timestamp: new Date().toISOString(),
          }))
          return NextResponse.redirect(new URL(loginUrl, req.url))
        }
        // 已认证用户，允许通过（角色检查在 Server Component 中进行）
        if (process.env.NODE_ENV === 'development') {
          console.log(JSON.stringify({
            event: 'admin_route_access',
            path: pathname,
            role: token.role,
            timestamp: new Date().toISOString(),
          }))
        }
      }

      // 所有其他已认证的请求都允许通过
      return NextResponse.next()
    } catch (error) {
      // 捕获异常，返回安全的默认响应
      console.error(JSON.stringify({
        event: 'middleware_error',
        path: req.nextUrl.pathname,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      }))
      const loginUrl = buildLoginUrl(req.nextUrl.pathname)
      return NextResponse.redirect(new URL(loginUrl, req.url))
    }
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        try {
          const { pathname } = req.nextUrl

          // 公开路由：无需认证
          if (isPublicRoute(pathname)) {
            if (process.env.NODE_ENV === 'development') {
              console.log(JSON.stringify({
                event: 'public_route_access',
                path: pathname,
                timestamp: new Date().toISOString(),
              }))
            }
            return true
          }

          // 首页：允许访问（访问控制在 Server Component 中根据系统设置决定）
          if (isHomeRoute(pathname)) {
            if (process.env.NODE_ENV === 'development') {
              console.log(JSON.stringify({
                event: 'home_route_access',
                path: pathname,
                authenticated: !!token,
                timestamp: new Date().toISOString(),
              }))
            }
            return true
          }

          // 管理员路由：需要认证（角色检查在 Server Component 中进行）
          if (isAdminRoute(pathname)) {
            if (!token) {
              console.warn(JSON.stringify({
                event: 'auth_check_failed',
                path: pathname,
                reason: 'no_token_admin_route',
                timestamp: new Date().toISOString(),
              }))
              return false
            }
            // 有 token，允许通过到 middleware 函数进行进一步处理
            return true
          }

          // 其他所有路由：需要认证
          if (!token) {
            console.warn(JSON.stringify({
              event: 'auth_check_failed',
              path: pathname,
              reason: 'no_token_protected_route',
              timestamp: new Date().toISOString(),
            }))
            return false
          }

          return true
        } catch (error) {
          // 捕获异常，返回安全的默认值
          console.error(JSON.stringify({
            event: 'authorization_callback_error',
            path: req.nextUrl.pathname,
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString(),
          }))
          return false
        }
      },
    },
    pages: {
      signIn: '/login',
    },
  }
)

export const config = {
  matcher: [
    /*
     * 匹配所有路径，除了：
     * - api 路由
     * - _next/static (静态文件)
     * - _next/image (图片优化)
     * - favicon.ico (网站图标)
     * - public 文件夹中的文件
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|_next).*)',
  ],
}

