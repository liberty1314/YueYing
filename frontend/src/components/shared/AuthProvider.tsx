'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { Loading } from '@/components/ui';

interface AuthProviderProps {
    children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const { initialize, initialized, isLoading } = useAuthStore();

    useEffect(() => {
        initialize();
    }, [initialize]);

    if (!initialized || isLoading) {
        return <Loading message="正在初始化..." fullScreen />;
    }

    return <>{children}</>;
}

export default AuthProvider;
