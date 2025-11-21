'use client';

import { Box } from '@mui/material';

interface AppLayoutProps {
    children: React.ReactNode;
    showNavbar?: boolean;
    transparentNavbar?: boolean;
    fullWidth?: boolean;
}

/**
 * 应用统一布局组件
 * 
 * 提供一致的页面布局，包括导航栏和内容区域
 */
export default function AppLayout({
    children,
    showNavbar = true,
    transparentNavbar = false,
    fullWidth = false,
}: AppLayoutProps) {
    return (
        <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    pt: showNavbar ? 8 : 0,
                    width: '100%',
                    maxWidth: fullWidth ? '100%' : undefined,
                }}
            >
                {children}
            </Box>
        </Box>
    );
}
