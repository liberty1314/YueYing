import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 公开路由（不需要认证）
const publicRoutes = ['/login', '/register'];

// 首页路由（允许未登录访问）
const homeRoute = '/';

// API 路由（不拦截）
const apiRoutes = ['/api'];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // 不拦截 API 路由
    if (apiRoutes.some((route) => pathname.startsWith(route))) {
        return NextResponse.next();
    }

    // 不拦截静态资源
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/static') ||
        pathname.includes('.')
    ) {
        return NextResponse.next();
    }

    // 从 cookie 或 localStorage 获取认证状态
    // 注意：middleware 运行在服务端，无法直接访问 localStorage
    // 我们需要从 cookie 中读取 token
    const authCookie = request.cookies.get('auth-token');
    const isAuthenticated = !!authCookie?.value;

    // 如果是首页，允许访问
    if (pathname === homeRoute) {
        return NextResponse.next();
    }

    // 如果是公开路由
    if (publicRoutes.includes(pathname)) {
        // 已登录用户访问登录/注册页，重定向到首页
        if (isAuthenticated) {
            return NextResponse.redirect(new URL('/', request.url));
        }
        return NextResponse.next();
    }

    // 其他路由需要认证
    if (!isAuthenticated) {
        // 未登录用户重定向到登录页
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

// 配置 matcher，指定哪些路由需要经过 middleware
export const config = {
    matcher: [
        /*
         * 匹配所有路由，除了：
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
