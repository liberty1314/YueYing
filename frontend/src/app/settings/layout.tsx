'use client';

import { Box, List, ListItemButton, ListItemIcon, ListItemText, Typography } from '@mui/material';
import { usePathname, useRouter } from 'next/navigation';
import SettingsIcon from '@mui/icons-material/Settings';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';
import ProtectedRoute from '@/components/shared/ProtectedRoute';

const menuItems = [
    { path: '/settings', label: '通用设置', icon: SettingsIcon },
    { path: '/settings/ai', label: 'AI 设置', icon: SmartToyIcon },
    { path: '/settings/profile', label: '个人信息', icon: PersonIcon },
    { path: '/settings/security', label: '安全设置', icon: LockIcon },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();

    return (
        <ProtectedRoute>
            <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
                {/* 侧边栏 */}
                <Box
                    sx={{
                        width: 280,
                        borderRight: 1,
                        borderColor: 'divider',
                        p: 3,
                    }}
                >
                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
                        设置
                    </Typography>
                    <List>
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.path;

                            return (
                                <ListItemButton
                                    key={item.path}
                                    onClick={() => router.push(item.path)}
                                    sx={{
                                        borderRadius: 2,
                                        mb: 1,
                                        bgcolor: isActive ? 'action.selected' : 'transparent',
                                        '&:hover': {
                                            bgcolor: isActive ? 'action.selected' : 'action.hover',
                                        },
                                    }}
                                >
                                    <ListItemIcon>
                                        <Icon color={isActive ? 'primary' : 'inherit'} />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={item.label}
                                        primaryTypographyProps={{
                                            fontWeight: isActive ? 600 : 400,
                                        }}
                                    />
                                </ListItemButton>
                            );
                        })}
                    </List>
                </Box>

                {/* 主内容区 */}
                <Box sx={{ flex: 1, p: 4 }}>{children}</Box>
            </Box>
        </ProtectedRoute>
    );
}
