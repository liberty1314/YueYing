'use client';

import { useState } from 'react';
import {
    Box,
    Typography,
    TextField,
    Button,
    CircularProgress,
    Alert,
    Avatar,
} from '@mui/material';
import { AppleCard } from '@/components/ui';
import { useAuthStore } from '@/stores/authStore';

export default function ProfilePage() {
    const { user } = useAuthStore();
    const [username, setUsername] = useState(user?.username || '');
    const [email, setEmail] = useState(user?.email || '');
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSave = async () => {
        setIsSaving(true);
        setSaveSuccess(false);
        setError('');

        try {
            // TODO: 实现个人信息更新 API
            await new Promise((resolve) => setTimeout(resolve, 500));
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (err) {
            setError('保存失败');
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
                个人信息
            </Typography>

            {saveSuccess && (
                <Alert severity="success" sx={{ mb: 3 }}>
                    个人信息已更新
                </Alert>
            )}

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            {/* 头像 */}
            <AppleCard sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                    头像
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Avatar
                        sx={{
                            width: 80,
                            height: 80,
                            bgcolor: 'primary.main',
                            fontSize: '2rem',
                        }}
                    >
                        {username.charAt(0).toUpperCase()}
                    </Avatar>
                    <Button variant="outlined">更换头像</Button>
                </Box>
            </AppleCard>

            {/* 基本信息 */}
            <AppleCard sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                    基本信息
                </Typography>

                <TextField
                    fullWidth
                    label="用户名"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    sx={{ mb: 3 }}
                />

                <TextField
                    fullWidth
                    label="邮箱"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </AppleCard>

            {/* 保存按钮 */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                    variant="contained"
                    size="large"
                    onClick={handleSave}
                    disabled={isSaving}
                    sx={{ minWidth: 120 }}
                >
                    {isSaving ? <CircularProgress size={24} /> : '保存'}
                </Button>
            </Box>
        </Box>
    );
}
