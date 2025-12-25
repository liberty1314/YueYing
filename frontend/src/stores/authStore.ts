import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';
import { authApi } from '@/lib/api';
import { setAuthTokenCookie, removeAuthTokenCookie } from '@/lib/cookies';

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    initialized: boolean;
}

interface AuthActions {
    setUser: (user: User | null) => void;
    setToken: (token: string | null) => void;
    login: (user: User, token: string) => void;
    logout: () => void;
    setLoading: (loading: boolean) => void;
    initialize: () => Promise<void>;
    refreshToken: () => Promise<void>;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
    persist(
        (set, get) => ({
            // State
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: true,
            initialized: false,

            // Actions
            setUser: (user) =>
                set({
                    user,
                    isAuthenticated: !!user,
                }),

            setToken: (token) =>
                set({
                    token,
                }),

            login: (user, token) => {
                set({
                    user,
                    token,
                    isAuthenticated: true,
                    isLoading: false,
                });
                // 将 token 保存到 cookie，供 middleware 使用
                setAuthTokenCookie(token);
            },

            logout: () => {
                set({
                    user: null,
                    token: null,
                    isAuthenticated: false,
                    isLoading: false,
                });
                // 清除本地存储和 cookie
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('auth-storage');
                }
                removeAuthTokenCookie();
            },

            setLoading: (loading) =>
                set({
                    isLoading: loading,
                }),

            initialize: async () => {
                const { token } = get();
                if (token) {
                    try {
                        const user = await authApi.getCurrentUser();
                        set({
                            user,
                            isAuthenticated: true,
                            isLoading: false,
                            initialized: true,
                        });
                        // 确保 cookie 中也有 token
                        setAuthTokenCookie(token);
                    } catch (error) {
                        // Token 无效，清除认证状态
                        set({
                            user: null,
                            token: null,
                            isAuthenticated: false,
                            isLoading: false,
                            initialized: true,
                        });
                        // 清除 cookie
                        removeAuthTokenCookie();
                    }
                } else {
                    set({
                        isLoading: false,
                        initialized: true,
                    });
                }
            },

            refreshToken: async () => {
                try {
                    const response = await authApi.refreshToken();
                    set({
                        user: response.user,
                        token: response.access_token,
                        isAuthenticated: true,
                    });
                } catch (error) {
                    // 刷新失败，清除认证状态
                    get().logout();
                }
            },
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({
                user: state.user,
                token: state.token,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);
