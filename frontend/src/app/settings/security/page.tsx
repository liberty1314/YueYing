'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Box,
    Typography,
    TextField,
    Button,
    CircularProgress,
    Alert,
    Snackbar,
    Divider,
    InputAdornment,
    IconButton,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';

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
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
                        <TextField
                            fullWidth
                            type={showCurrentPassword ? 'text' : 'password'}
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            placeholder="请输入当前密码"
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                            edge="end"
                                        >
                                            {showCurrentPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '12px',
                                    bgcolor: '#f5f5f7',
                                    '& fieldset': {
                                        borderColor: 'transparent',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: '#d2d2d7',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: '#0071e3',
                                        borderWidth: '2px',
                                    },
                                },
                            }}
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
                        <TextField
                            fullWidth
                            type={showNewPassword ? 'text' : 'password'}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="请输入新密码（至少 8 位）"
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                            edge="end"
                                        >
                                            {showNewPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '12px',
                                    bgcolor: '#f5f5f7',
                                    '& fieldset': {
                                        borderColor: 'transparent',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: '#d2d2d7',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: '#0071e3',
                                        borderWidth: '2px',
                                    },
                                },
                            }}
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
                        <TextField
                            fullWidth
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="请再次输入新密码"
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            edge="end"
                                        >
                                            {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '12px',
                                    bgcolor: '#f5f5f7',
                                    '& fieldset': {
                                        borderColor: 'transparent',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: '#d2d2d7',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: '#0071e3',
                                        borderWidth: '2px',
                                    },
                                },
                            }}
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
