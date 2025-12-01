'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Box,
    Typography,
    Button,
    CircularProgress,
    Alert,
    Snackbar,
    Divider,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { AuthInput } from '@/components/ui/AuthInput';

interface SettingSectionProps {
    title: string;
    description?: string;
    children: React.ReactNode;
}

function SettingSection({ title, description, children }: SettingSectionProps) {
    return (
        <Box
            sx={{
                bgcolor: 'white',
                borderRadius: '18px',
                overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                mb: 3,
            }}
        >
            <Box sx={{ px: 3, pt: 3, pb: 1 }}>
                <Typography
                    sx={{
                        fontSize: '1.125rem',
                        fontWeight: 600,
                        color: '#1d1d1f',
                        letterSpacing: '-0.01em',
                    }}
                >
                    {title}
                </Typography>
                {description && (
                    <Typography
                        sx={{
                            fontSize: '0.875rem',
                            color: '#6e6e73',
                            mt: 0.5,
                        }}
                    >
                        {description}
                    </Typography>
                )}
            </Box>
            <Divider sx={{ borderColor: 'rgba(0,0,0,0.06)' }} />
            <Box sx={{ p: 3 }}>{children}</Box>
        </Box>
    );
}

export default function SecurityPage() {
    const router = useRouter();
    const { logout } = useAuthStore();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleChangePassword = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            setError('请填写所有字段');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('两次输入的新密码不一致');
            return;
        }

        if (newPassword.length < 8) {
            setError('新密码长度至少为 8 位');
            return;
        }

        setIsSaving(true);
        setSaveSuccess(false);
        setError('');

        try {
            // 调用后端 API 修改密码
            await authApi.changePassword({
                old_password: currentPassword,
                new_password: newPassword,
            });

            // 修改成功后，显示成功提示
            setSaveSuccess(true);
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');

            // 2秒后自动退出登录并跳转到首页
            setTimeout(() => {
                logout();
                router.push('/');
            }, 2000);
        } catch (err: any) {
            // 处理错误提示
            const errorMessage = err?.message || err?.detail || '修改密码失败';
            setError(errorMessage);
            console.error('Change password error:', err);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Box>
            {error && (
                <Alert
                    severity="error"
                    sx={{
                        mb: 3,
                        borderRadius: '12px',
                        bgcolor: '#fff5f5',
                        border: '1px solid #feb2b2',
                    }}
                >
                    {error}
                </Alert>
            )}

            {/* 修改密码 */}
            <SettingSection
                title="修改密码"
                description="定期更换密码可以提高账户安全性"
            >
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <Box>
                        <Typography
                            sx={{
                                fontSize: '0.875rem',
                                fontWeight: 500,
                                color: '#1d1d1f',
                                mb: 1,
                            }}
                        >
                            当前密码
                        </Typography>
                        <AuthInput
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            placeholder="请输入当前密码"
                            icon={
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            }
                        />
                    </Box>

                    <Box>
                        <Typography
                            sx={{
                                fontSize: '0.875rem',
                                fontWeight: 500,
                                color: '#1d1d1f',
                                mb: 1,
                            }}
                        >
                            新密码
                        </Typography>
                        <AuthInput
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="请输入新密码（至少 8 位）"
                            icon={
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                </svg>
                            }
                        />
                    </Box>

                    <Box>
                        <Typography
                            sx={{
                                fontSize: '0.875rem',
                                fontWeight: 500,
                                color: '#1d1d1f',
                                mb: 1,
                            }}
                        >
                            确认新密码
                        </Typography>
                        <AuthInput
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="请再次输入新密码"
                            icon={
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            }
                        />
                    </Box>
                </Box>
            </SettingSection>

            {/* 保存按钮 */}
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    pt: 2,
                }}
            >
                <Button
                    variant="contained"
                    size="large"
                    onClick={handleChangePassword}
                    disabled={isSaving}
                    sx={{
                        minWidth: 140,
                        height: 48,
                        borderRadius: '24px',
                        bgcolor: '#0071e3',
                        fontSize: '1rem',
                        fontWeight: 500,
                        textTransform: 'none',
                        boxShadow: 'none',
                        '&:hover': {
                            bgcolor: '#0077ed',
                            boxShadow: '0 4px 12px rgba(0,113,227,0.25)',
                        },
                        '&:active': {
                            bgcolor: '#006edb',
                        },
                        '&.Mui-disabled': {
                            bgcolor: '#e5e5e7',
                            color: '#86868b',
                        },
                    }}
                >
                    {isSaving ? <CircularProgress size={24} sx={{ color: 'white' }} /> : '修改密码'}
                </Button>
            </Box>

            {/* 成功提示 */}
            <Snackbar
                open={saveSuccess}
                autoHideDuration={3000}
                onClose={() => setSaveSuccess(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    icon={<CheckCircleIcon />}
                    sx={{
                        borderRadius: '12px',
                        bgcolor: '#34c759',
                        color: 'white',
                        '& .MuiAlert-icon': {
                            color: 'white',
                        },
                    }}
                >
                    密码修改成功，2秒后自动退出登录...
                </Alert>
            </Snackbar>
        </Box>
    );
}
