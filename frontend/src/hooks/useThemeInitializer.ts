"use client"

import { useEffect } from 'react';
import { useUiStore } from '@/stores/uiStore';

/**
 * useThemeInitializer - 主题初始化 Hook
 * 
 * 在应用启动时初始化主题设置
 * 优先级：localStorage > 系统偏好 > 默认 light
 * 
 * 功能：
 * - 从 localStorage 恢复保存的主题
 * - 检测系统主题偏好（prefers-color-scheme）
 * - 应用主题到 DOM
 * - 监听系统主题变化
 * 
 * 验证需求: 10.1, 10.2, 10.6, 10.7, 14.1, 14.2, 14.3
 */
export function useThemeInitializer() {
  const initializeTheme = useUiStore((state) => state.initializeTheme);

  useEffect(() => {
    // 初始化主题
    initializeTheme();

    // 监听系统主题偏好变化
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      // 只有在没有保存的主题偏好时才响应系统主题变化
      const savedTheme = localStorage.getItem('ui-storage');
      if (!savedTheme) {
        const systemTheme = e.matches ? 'dark' : 'light';
        useUiStore.getState().setTheme(systemTheme);
      }
    };

    // 添加监听器
    mediaQuery.addEventListener('change', handleChange);

    // 清理函数
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [initializeTheme]);
}
