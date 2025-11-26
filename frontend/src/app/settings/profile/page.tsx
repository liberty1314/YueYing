'use client';

import { useState, useEffect, useRef } from 'react';
import {
    Box,
    Typography,
    TextField,
    Button,
    CircularProgress,
    Alert,
    Snackbar,
    Divider,
    Avatar,
    IconButton,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import { useAuthStore } from '@/stores/authStore';

interface SettingSectionProps {
    title: string;
    children: React.ReactNode;
}

function SettingSection({ title, children }: SettingSectionProps) {
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
            </Box>
            <Divider sx={{ borderColor: 'rgba(0,0,0,0.06)' }} />
            <Box sx={{ p: 3 }}>{children}</Box>
        </Box>
    );
}

// Avatar upload API function
async function uploadAvatar(file: File, token: string): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);

    // NEXT_PUBLIC_API_URL is http://localhost:8000/api (already includes /api)
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
    const response = await fetch(`${apiUrl}/user/avatar`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
        body: formData,
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || '上传失败');
    }

    return response.json();
}

export default function ProfilePage() {
    const { user, token, setUser } = useAuthStore();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [error, setError] = useState('');

    // Avatar upload states
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (user) {
            setUsername(user.username || '');
            setEmail(user.email || '');
        }
    }, [user]);

    const handleSave = async () => {
        setIsSaving(true);
        setSaveSuccess(false);
        setError('');

        try {
            // TODO: 实现更新用户信息的 API 调用
            await new Promise((resolve) => setTimeout(resolve, 1000));
            setSaveSuccess(true);
        } catch (err) {
            setError('保存失败');
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    };

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file type
        const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            setError('仅支持 JPG、PNG、WEBP 格式的图片');
            return;
        }

        // Validate file size (2MB)
        const maxSize = 2 * 1024 * 1024;
        if (file.size > maxSize) {
            setError('图片大小不能超过 2MB');
            return;
        }

        // Show preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setAvatarPreview(reader.result as string);
        };
        reader.readAsDataURL(file);

        // Upload avatar
        if (!token) {
            setError('未找到登录凭证，请重新登录');
            return;
        }

        setIsUploadingAvatar(true);
        setError('');

        try {
            const updatedUser = await uploadAvatar(file, token);

            // Update global user state immediately
            setUser(updatedUser);

            setSaveSuccess(true);
            setAvatarPreview(null); // Clear preview after successful upload
        } catch (err) {
            setError(err instanceof Error ? err.message : '上传头像失败');
            setAvatarPreview(null); // Clear preview on error
        } finally {
            setIsUploadingAvatar(false);
            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    // Get avatar URL - use preview if available, otherwise use user's avatar
    const getAvatarSrc = () => {
        if (avatarPreview) return avatarPreview;

        // Check all possible avatar field names (backend uses snake_case, frontend might convert to camelCase)
        const userObj = user as any;
        const avatarUrl = userObj?.avatar_url || userObj?.avatarUrl || userObj?.avatar;

        // Debug logging
        if (process.env.NODE_ENV === 'development') {
            console.log('[Avatar Debug] User object:', user);
            console.log('[Avatar Debug] avatar_url:', userObj?.avatar_url);
            console.log('[Avatar Debug] avatarUrl:', userObj?.avatarUrl);
            console.log('[Avatar Debug] avatar:', userObj?.avatar);
            console.log('[Avatar Debug] Final avatarUrl:', avatarUrl);
        }

        if (avatarUrl) {
            // Check if it's a relative URL, then prepend API base URL
            if (avatarUrl.startsWith('/')) {
                // Remove /api suffix from NEXT_PUBLIC_API_URL since avatar_url starts with /uploads
                const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api').replace(/\/api$/, '');
                const fullUrl = `${baseUrl}${avatarUrl}`;
                console.log('[Avatar Debug] Full URL:', fullUrl);
                return fullUrl;
            }
            return avatarUrl;
        }
        return null;
    };

    const avatarSrc = getAvatarSrc();

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
                    onClose={() => setError('')}
                >
                    {error}
                </Alert>
            )}

            {/* 头像 */}
            <SettingSection title="头像">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Box sx={{ position: 'relative' }}>
                        {avatarSrc ? (
                            <Avatar
                                src={avatarSrc}
                                sx={{
                                    width: 80,
                                    height: 80,
                                }}
                            />
                        ) : (
                            <Avatar
                                sx={{
                                    width: 80,
                                    height: 80,
                                    bgcolor: '#0071e3',
                                    fontSize: '2rem',
                                    fontWeight: 600,
                                }}
                            >
                                {username.charAt(0).toUpperCase()}
                            </Avatar>
                        )}
                        <IconButton
                            onClick={handleAvatarClick}
                            disabled={isUploadingAvatar}
                            sx={{
                                position: 'absolute',
                                bottom: -4,
                                right: -4,
                                bgcolor: 'white',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                                width: 32,
                                height: 32,
                                '&:hover': {
                                    bgcolor: '#f5f5f7',
                                },
                                '&.Mui-disabled': {
                                    bgcolor: '#e5e5e7',
                                },
                            }}
                        >
                            {isUploadingAvatar ? (
                                <CircularProgress size={16} sx={{ color: '#1d1d1f' }} />
                            ) : (
                                <PhotoCameraIcon sx={{ fontSize: 16, color: '#1d1d1f' }} />
                            )}
                        </IconButton>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={handleFileSelect}
                            style={{ display: 'none' }}
                        />
                    </Box>
                    <Box>
                        <Typography
                            sx={{
                                fontSize: '0.875rem',
                                color: '#6e6e73',
                                mb: 1,
                            }}
                        >
                            点击相机图标更换头像
                        </Typography>
                        <Typography
                            sx={{
                                fontSize: '0.75rem',
                                color: '#86868b',
                            }}
                        >
                            支持 JPG、PNG、WEBP 格式，最大 2MB
                        </Typography>
                    </Box>
                </Box>
            </SettingSection>

            {/* 基本信息 */}
            <SettingSection title="基本信息">
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
                            用户名
                        </Typography>
                        <TextField
                            fullWidth
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="请输入用户名"
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
                            邮箱
                        </Typography>
                        <TextField
                            fullWidth
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="请输入邮箱"
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
                    onClick={handleSave}
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
                    {isSaving ? <CircularProgress size={24} sx={{ color: 'white' }} /> : '保存更改'}
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
                    更新成功
                </Alert>
            </Snackbar>
        </Box>
    );
}
