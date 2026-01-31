/**
 * adminUIStore - 后台管理 UI 状态管理
 * 
 * 功能：
 * - 管理侧边栏折叠状态
 * - 持久化用户偏好到 localStorage
 * 
 * 验证需求: 3.8, 8.2, 8.3, 14.1, 14.2
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AdminUIState {
  sidebarCollapsed: boolean;
}

interface AdminUIActions {
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
}

type AdminUIStore = AdminUIState & AdminUIActions;

export const useAdminUIStore = create<AdminUIStore>()(
  persist(
    (set) => ({
      // State
      sidebarCollapsed: false,

      // Actions
      setSidebarCollapsed: (collapsed) =>
        set({
          sidebarCollapsed: collapsed,
        }),

      toggleSidebar: () =>
        set((state) => ({
          sidebarCollapsed: !state.sidebarCollapsed,
        })),
    }),
    {
      name: 'admin-ui-storage',
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    }
  )
);
