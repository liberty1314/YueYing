/**
 * Next.js 中间件
 * 
 * 处理受保护路由的访问控制
 * 游客只能访问首页(/)、登录页(/login)和注册页(/register)
 */

export { default } from 'next-auth/middleware'

export const config = {
  matcher: [
    '/library/:path*',      // 我的记录
    '/discover/:path*',     // 探索发现
    '/explore/:path*',      // 搜索探索
    '/stats/:path*',        // 统计
    '/settings/:path*',     // 设置
    '/admin/:path*',        // 管理后台
    '/profile/:path*',      // 个人资料
    '/dashboard/:path*',    // 仪表板
  ],
}

