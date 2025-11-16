/**
 * Next.js 中间件
 * 
 * 全局路由保护：
 * - 公开页面：登录页(/login)、注册页(/register)
 * - 首页(/)：根据系统设置决定是否需要登录（在页面组件中检查）
 * - 其他所有页面：需要登录
 */

import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    // 中间件逻辑：已通过认证的请求会到达这里
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl

        // 如果有 token，说明已登录，允许访问所有页面
        if (token) return true

        // 未登录时的处理
        // 公开页面：登录、注册
        const publicPages = ['/login', '/register']
        if (publicPages.includes(pathname)) {
          return true
        }

        // 首页特殊处理：允许访问，但在页面组件中根据系统设置决定是否重定向
        if (pathname === '/') {
          return true
        }

        // 其他所有页面都需要登录
        return false
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

