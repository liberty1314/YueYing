"use client"

import { useEffect } from 'react';
import { useThemeInitializer } from '@/hooks/useThemeInitializer';

interface ThemeProviderProps {
  children: React.ReactNode;
}

/**
 * ThemeProvider - 主题提供者组件
 * 
 * 在应用根部初始化主题系统
 * 确保主题在客户端渲染前正确应用，避免闪烁
 * 
 * 功能：
 * - 初始化主题设置
 * - 防止主题闪烁（FOUC - Flash of Unstyled Content）
 * - 提供主题上下文给子组件
 * 
 * 验证需求: 10.1, 10.2, 10.6, 10.7, 14.1, 14.2, 14.3
 */
export function ThemeProvider({ children }: ThemeProviderProps) {
  // 使用主题初始化 hook
  useThemeInitializer();

  return <>{children}</>;
}
