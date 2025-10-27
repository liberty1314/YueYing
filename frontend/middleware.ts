/**
 * Next.js 中间件
 * 
 * 处理受保护路由的访问控制
 */

export { default } from 'next-auth/middleware'

export const config = {
  matcher: [
    '/profile/:path*',
    '/settings/:path*',
    '/dashboard/:path*',
  ],
}

