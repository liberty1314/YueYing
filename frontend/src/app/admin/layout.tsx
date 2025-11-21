'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Box,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Typography,
    Divider,
} from '@mui/material';
import { usePathname } from 'next/navigation';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import KeyIcon from '@mui/icons-material/Key';
import DescriptionIcon from '@mui/icons-material/Description';
import SettingsIcon from '@mui/icons-material/Settings';
import StorageIcon from '@mui/icons-material/Storage';
import ProtectedRoute from '@/components/shared/ProtectedRoute';
import { useAuthStore } from '@/stores/authStore';

const menuItems = [
    { path: '/admin', label: '仪表盘', icon: DashboardIcon },
    { path: '/admin/users', label: '用户管理', icon: PeopleIcon },
    { path: '/admin/llm-config', label: 'LLM 配置', icon: SmartToyIcon },
    { path: '/admin/api-keys', label: 'API 密钥', icon: KeyIcon },
    { path: '/admin/logs', label: '系统日志', icon: DescriptionIcon },
    { path: '/admin/system', label: '系统设置', icon: SettingsIcon },
    { path: '/admin/rag', label: 'RAG 管理', icon: StorageIcon },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const { user } = useAuthStore();

    // 检查管理员权限
    useEffect(() => {
        if (user && !user.is_admin) {
            router.push('/');
        }
    }, [user, router]);

    if (!user?.is_admin) {
        return null;
    }

    return (
        <ProtectedRoute>
            <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default', pt: 8 }}>
                {/* 侧边栏 */}
                <Box
                    sx={{
                        width: 280,
                        borderRight: 1,
                        borderColor: 'divider',
                        p: 3,
                    }}
                >
                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                        管理后台
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        系统管理与配置
                    </Typography>

                    <Divider sx={{ mb: 2 }} />

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
                <Box sx={{ flex: 1, p: 4, overflow: 'auto' }}>{children}</Box>
            </Box>
        </ProtectedRoute>
    );
}
