'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { Loading } from '@/components/ui';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requireAuth?: boolean;
}

export function ProtectedRoute({ children, requireAuth = true }: ProtectedRouteProps) {
    const { isAuthenticated, isLoading } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading) {
            if (requireAuth && !isAuthenticated) {
                router.push('/login');
            } else if (!requireAuth && isAuthenticated) {
                router.push('/');
            }
        }
    }, [isAuthenticated, isLoading, requireAuth, router]);

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
