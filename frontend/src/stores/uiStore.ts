import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UiState {
    theme: 'light' | 'dark';
    sidebarOpen: boolean;
    loading: boolean;
    notifications: Notification[];
}

interface Notification {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    duration?: number;
}

interface UiActions {
    setTheme: (theme: 'light' | 'dark') => void;
    toggleTheme: () => void;
    initializeTheme: () => void;
    setSidebarOpen: (open: boolean) => void;
    toggleSidebar: () => void;
    setLoading: (loading: boolean) => void;
    addNotification: (notification: Omit<Notification, 'id'>) => void;
    removeNotification: (id: string) => void;
    clearNotifications: () => void;
}

type UiStore = UiState & UiActions;

/**
 * 应用主题到 DOM
 * 更新 document.documentElement 的 class 和 CSS 变量
 */
const applyTheme = (theme: 'light' | 'dark') => {
    if (typeof window === 'undefined') return;

    const root = document.documentElement;
    
    // 更新 class
    if (theme === 'dark') {
        root.classList.add('dark');
    } else {
        root.classList.remove('dark');
    }
    
    // CSS 变量会通过 globals.css 中的 .dark 选择器自动更新
    // 不需要手动设置每个变量
};

/**
 * 检测系统主题偏好
 */
const getSystemTheme = (): 'light' | 'dark' => {
    if (typeof window === 'undefined') return 'light';
    
    return window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
};

/**
 * 从 localStorage 获取保存的主题
 */
const getSavedTheme = (): 'light' | 'dark' | null => {
    if (typeof window === 'undefined') return null;
    
    try {
        const saved = localStorage.getItem('ui-storage');
        if (saved) {
            const parsed = JSON.parse(saved);
            return parsed.state?.theme || null;
        }
    } catch (error) {
        console.error('Failed to parse saved theme:', error);
    }
    
    return null;
};

export const useUiStore = create<UiStore>()(
    persist(
        (set, get) => ({
            // State
            theme: 'light',
            sidebarOpen: false,
            loading: false,
            notifications: [],

            // Actions
            setTheme: (theme) => {
                applyTheme(theme);
                set({ theme });
            },

            toggleTheme: () => {
                const currentTheme = get().theme;
                const newTheme = currentTheme === 'light' ? 'dark' : 'light';
                applyTheme(newTheme);
                set({ theme: newTheme });
            },

            /**
             * 初始化主题
             * 优先级：localStorage > 系统偏好 > 默认 light
             */
            initializeTheme: () => {
                const savedTheme = getSavedTheme();
                const systemTheme = getSystemTheme();
                const initialTheme = savedTheme || systemTheme;
                
                applyTheme(initialTheme);
                set({ theme: initialTheme });
            },

            setSidebarOpen: (open) =>
                set({
                    sidebarOpen: open,
                }),

            toggleSidebar: () =>
                set((state) => ({
                    sidebarOpen: !state.sidebarOpen,
                })),

            setLoading: (loading) =>
                set({
                    loading,
                }),

            addNotification: (notification) =>
                set((state) => ({
                    notifications: [
                        ...state.notifications,
                        {
                            ...notification,
                            id: Math.random().toString(36).substring(7),
                        },
                    ],
                })),

            removeNotification: (id) =>
                set((state) => ({
                    notifications: state.notifications.filter((n) => n.id !== id),
                })),

            clearNotifications: () =>
                set({
                    notifications: [],
                }),
        }),
        {
            name: 'ui-storage',
            partialize: (state) => ({
                theme: state.theme,
                sidebarOpen: state.sidebarOpen,
            }),
        }
    )
);
