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
    setSidebarOpen: (open: boolean) => void;
    toggleSidebar: () => void;
    setLoading: (loading: boolean) => void;
    addNotification: (notification: Omit<Notification, 'id'>) => void;
    removeNotification: (id: string) => void;
    clearNotifications: () => void;
}

type UiStore = UiState & UiActions;

export const useUiStore = create<UiStore>()(
    persist(
        (set) => ({
            // State
            theme: 'light',
            sidebarOpen: false,
            loading: false,
            notifications: [],

            // Actions
            setTheme: (theme) =>
                set({
                    theme,
                }),

            toggleTheme: () =>
                set((state) => ({
                    theme: state.theme === 'light' ? 'dark' : 'light',
                })),

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
