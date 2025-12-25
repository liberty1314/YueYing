import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 公开路由（不需要认证）
const publicRoutes = ['/login', '/register'];

// 首页路由（允许未登录访问）
const homeRoute = '/';

// API 路由（不拦截）
const apiRoutes = ['/api'];

// 需要系统设置控制的路由
const protectedRoutes = {
    '/analytics': 'enable_stats',
    '/assistant': 'enable_ai_assistant',
    '/recommendations': 'enable_explore',
    '/discover': 'enable_explore',
} as const;

// 缓存系统设置（避免每次请求都调用API）
let settingsCache: {
    data: any;
    timestamp: number;
} | null = null;

const CACHE_DURATION = 10 * 1000; // 10秒缓存（缩短缓存时间以便更快响应设置变化）

// 添加调试日志开关（生产环境可以关闭）
const DEBUG = process.env.NODE_ENV === 'development';

function debugLog(...args: any[]) {
    if (DEBUG) {
        console.log('[Middleware]', ...args);
    }
}

// 导出清除缓存的函数（供 API 路由调用）
export function clearSettingsCache() {
    debugLog('Clearing settings cache');
    settingsCache = null;
}

async function getSystemSettings(request: NextRequest): Promise<any> {
    // 检查是否有强制刷新参数（用于调试）
    const forceRefresh = request.nextUrl.searchParams.get('_refresh_settings') === '1';

    // 检查缓存
    if (!forceRefresh && settingsCache && Date.now() - settingsCache.timestamp < CACHE_DURATION) {
        debugLog('Using cached settings:', settingsCache.data);
        return settingsCache.data;
    }

    try {
        // 在 Docker 环境中，middleware 需要使用内部服务名访问后端
        // 优先使用内部服务名，如果不存在则使用公开 URL
        const internalApiUrl = process.env.INTERNAL_API_URL || 'http://backend:8000';
        const publicApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

        // Middleware 在服务端运行，使用内部 URL
        const baseUrl = internalApiUrl;
        const settingsUrl = `${baseUrl}/api/system-settings/public`;

        debugLog('Fetching system settings from:', settingsUrl);

        const response = await fetch(settingsUrl, {
            headers: {
                'Content-Type': 'application/json',
            },
            // 禁用缓存，确保获取最新数据
            cache: 'no-store',
        });

        if (!response.ok) {
            console.error('[Middleware] Failed to fetch system settings:', response.status);
            // 如果获取失败，返回保守的默认值（全部禁用，更安全）
            return {
                enable_stats: false,
                enable_ai_assistant: false,
                enable_explore: false,
                allow_anonymous_home_access: true,
            };
        }

        const data = await response.json();
        debugLog('Fetched system settings:', data);

        // 更新缓存
        settingsCache = {
            data,
            timestamp: Date.now(),
        };

        return data;
    } catch (error) {
        console.error('[Middleware] Error fetching system settings:', error);
        // 出错时返回保守的默认值（全部禁用，更安全）
        return {
            enable_stats: false,
            enable_ai_assistant: false,
            enable_explore: false,
            allow_anonymous_home_access: true,
        };
    }
}

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    debugLog('Processing request:', pathname);

    // 不拦截 API 路由
    if (apiRoutes.some((route) => pathname.startsWith(route))) {
        debugLog('Skipping API route:', pathname);
        return NextResponse.next();
    }

    // 不拦截静态资源
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/static') ||
        pathname.includes('.')
    ) {
        debugLog('Skipping static resource:', pathname);
        return NextResponse.next();
    }

    // 从 cookie 获取认证状态
    const authCookie = request.cookies.get('auth-token');
    const isAuthenticated = !!authCookie?.value;
    debugLog('Authentication status:', isAuthenticated);

    // 检查是否是受保护的路由（需要系统设置控制）
    const protectedRoute = Object.keys(protectedRoutes).find(route =>
        pathname.startsWith(route)
    );

    if (protectedRoute) {
        debugLog('Protected route detected:', protectedRoute);

        // 获取系统设置
        const settings = await getSystemSettings(request);
        const requiredSetting = protectedRoutes[protectedRoute as keyof typeof protectedRoutes];
        const isEnabled = settings[requiredSetting];

        debugLog(`Checking setting ${requiredSetting}:`, isEnabled);

        // 检查功能是否启用
        if (!isEnabled) {
            debugLog(`Feature ${requiredSetting} is disabled, redirecting...`);

            // 功能未启用
            if (!isAuthenticated) {
                // 未登录用户重定向到登录页
                debugLog('Redirecting unauthenticated user to login');
                const loginUrl = new URL('/login', request.url);
                loginUrl.searchParams.set('redirect', pathname);
                return NextResponse.redirect(loginUrl);
            } else {
                // 已登录用户重定向到首页
                debugLog('Redirecting authenticated user to home');
                return NextResponse.redirect(new URL('/', request.url));
            }
        } else {
            debugLog(`Feature ${requiredSetting} is enabled, allowing access`);
        }
    }

    // 如果是首页，允许访问
    if (pathname === homeRoute) {
        debugLog('Home route, allowing access');
        return NextResponse.next();
    }

    // 如果是公开路由
    if (publicRoutes.includes(pathname)) {
        debugLog('Public route:', pathname);
        // 已登录用户访问登录/注册页，重定向到首页
        if (isAuthenticated) {
            debugLog('Authenticated user accessing public route, redirecting to home');
            return NextResponse.redirect(new URL('/', request.url));
        }
        return NextResponse.next();
    }

    // 其他路由需要认证
    if (!isAuthenticated) {
        debugLog('Unauthenticated user accessing protected route, redirecting to login');
        // 未登录用户重定向到登录页
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
    }

    debugLog('Allowing access to:', pathname);
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
