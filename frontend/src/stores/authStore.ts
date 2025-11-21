import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';
import { authApi } from '@/lib/api';

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

            login: (user, token) =>
                set({
                    user,
                    token,
                    isAuthenticated: true,
                    isLoading: false,
                }),

            logout: () => {
                set({
                    user: null,
                    token: null,
                    isAuthenticated: false,
                    isLoading: false,
                });
                // 清除本地存储
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('auth-storage');
                }
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
                    } catch (error) {
                        // Token 无效，清除认证状态
                        set({
                            user: null,
                            token: null,
                            isAuthenticated: false,
                            isLoading: false,
                            initialized: true,
                        });
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
