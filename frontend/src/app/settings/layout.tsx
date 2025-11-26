'use client';

import { Box, List, ListItemButton, ListItemIcon, ListItemText, Typography, Container } from '@mui/material';
import { usePathname, useRouter } from 'next/navigation';
import SettingsIcon from '@mui/icons-material/Settings';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';
import ProtectedRoute from '@/components/shared/ProtectedRoute';

const menuItems = [
    { path: '/settings', label: '通用', icon: SettingsIcon, description: '基本偏好设置' },
    { path: '/settings/ai', label: 'AI', icon: SmartToyIcon, description: 'AI 功能配置' },
    { path: '/settings/profile', label: '个人信息', icon: PersonIcon, description: '账户信息管理' },
    { path: '/settings/security', label: '安全', icon: LockIcon, description: '密码与安全' },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();

    return (
        <ProtectedRoute>
            <Box
                sx={{
                    minHeight: '100vh',
                    bgcolor: '#f5f5f7',
                    pt: { xs: 2, md: 6 },
                    pb: 8,
                }}
            >
                <Container maxWidth="lg">
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: { xs: 'column', md: 'row' },
                            gap: 4,
                        }}
                    >
                        {/* 侧边导航 */}
                        <Box
                            sx={{
                                width: { xs: '100%', md: 280 },
                                flexShrink: 0,
                            }}
                        >
                            <Box
                                sx={{
                                    bgcolor: 'white',
                                    borderRadius: '18px',
                                    overflow: 'hidden',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                                }}
                            >
                                <List sx={{ p: 1 }}>
                                    {menuItems.map((item, index) => {
                                        const Icon = item.icon;
                                        const isActive = pathname === item.path;

                                        return (
                                            <ListItemButton
                                                key={item.path}
                                                onClick={() => router.push(item.path)}
                                                sx={{
                                                    borderRadius: '12px',
                                                    mb: index < menuItems.length - 1 ? 0.5 : 0,
                                                    py: 1.5,
                                                    px: 2,
                                                    bgcolor: isActive ? '#f5f5f7' : 'transparent',
                                                    transition: 'all 0.2s ease',
                                                    '&:hover': {
                                                        bgcolor: isActive ? '#f5f5f7' : '#fafafa',
                                                    },
                                                }}
                                            >
                                                <ListItemIcon sx={{ minWidth: 40 }}>
                                                    <Icon
                                                        sx={{
                                                            fontSize: 22,
                                                            color: isActive ? '#0071e3' : '#86868b',
                                                        }}
                                                    />
                                                </ListItemIcon>
                                                <ListItemText
                                                    primary={item.label}
                                                    primaryTypographyProps={{
                                                        fontWeight: isActive ? 600 : 500,
                                                        fontSize: '0.95rem',
                                                        color: isActive ? '#1d1d1f' : '#1d1d1f',
                                                    }}
                                                />
                                            </ListItemButton>
                                        );
                                    })}
                                </List>
                            </Box>
                        </Box>

                        {/* 主内容区 */}
                        <Box sx={{ flex: 1, minWidth: 0 }}>{children}</Box>
                    </Box>
                </Container>
            </Box>
        </ProtectedRoute>
    );
}
