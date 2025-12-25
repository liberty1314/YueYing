'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { Loading } from '@/components/ui';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requireAuth?: boolean;
}

// 开发模式：设置为 true 时跳过所有路由保护
const DEV_MODE_SKIP_AUTH = false;

/**
 * ProtectedRoute - 客户端路由保护组件
 * 
 * ⚠️ 注意：此组件已被 middleware.ts 替代，用于服务端拦截
 * 
 * 现在推荐使用 Next.js Middleware 进行认证拦截，避免客户端渲染后再跳转的问题
 * 
 * @deprecated 请使用 middleware.ts 进行服务端认证拦截
 */
export function ProtectedRoute({ children, requireAuth = true }: ProtectedRouteProps) {
    const { isAuthenticated, isLoading } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        // 开发模式下跳过认证检查
        if (DEV_MODE_SKIP_AUTH) {
            return;
        }

        if (!isLoading) {
            if (requireAuth && !isAuthenticated) {
                router.push('/login');
            } else if (!requireAuth && isAuthenticated) {
                router.push('/');
            }
        }
    }, [isAuthenticated, isLoading, requireAuth, router]);

    // 开发模式下直接渲染子组件
    if (DEV_MODE_SKIP_AUTH) {
        return <>{children}</>;
    }

    if (isLoading) {
        return <Loading message="正在验证身份..." fullScreen />;
    }

    if (requireAuth && !isAuthenticated) {
        return <Loading message="跳转到登录页面..." fullScreen />;
    }

    if (!requireAuth && isAuthenticated) {
        return <Loading message="跳转到主页面..." fullScreen />;
    }

    return <>{children}</>;
}

export default ProtectedRoute;
