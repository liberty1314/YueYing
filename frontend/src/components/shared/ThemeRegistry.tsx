'use client';

import * as React from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { lightTheme, darkTheme } from '@/lib/theme';
import { useUiStore } from '@/stores/uiStore';
import { themeScript } from '@/lib/theme-script';

/**
 * ThemeRegistry - 主题注册组件
 * 
 * 集成 MUI 主题系统和 Zustand 主题状态管理
 * 确保主题在整个应用中保持同步
 * 
 * 功能：
 * - 初始化主题（从 localStorage 或系统偏好）
 * - 同步 MUI 主题和 document.documentElement 的 class
 * - 提供 MUI 主题上下文
 * - 防止主题闪烁（FOUC）
 * 
 * 验证需求: 10.1, 10.2, 10.6, 10.7, 14.1, 14.2, 14.3
 */
export default function ThemeRegistry({ children }: { children: React.ReactNode }) {
    const { theme, initializeTheme } = useUiStore();

    // 初始化主题
    React.useEffect(() => {
        initializeTheme();
    }, [initializeTheme]);

    // 监听系统主题偏好变化
    React.useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        
        const handleChange = (e: MediaQueryListEvent) => {
            // 只有在没有保存的主题偏好时才响应系统主题变化
            const savedTheme = localStorage.getItem('ui-storage');
            if (!savedTheme) {
                const systemTheme = e.matches ? 'dark' : 'light';
                useUiStore.getState().setTheme(systemTheme);
            }
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    const muiTheme = theme === 'dark' ? darkTheme : lightTheme;

    return (
        <>
            {/* 内联脚本防止主题闪烁 */}
            <script
                dangerouslySetInnerHTML={{ __html: themeScript }}
                suppressHydrationWarning
            />
            <AppRouterCacheProvider options={{ enableCssLayer: true }}>
                <MuiThemeProvider theme={muiTheme}>
                    <CssBaseline enableColorScheme />
                    {children}
                </MuiThemeProvider>
            </AppRouterCacheProvider>
        </>
    );
}
