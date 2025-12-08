'use client';

import { useState, useEffect } from 'react';
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
import { api, APIError } from '@/lib/apiClient';
import { Switch } from '@/components/ui';

interface SettingItemProps {
    title: string;
    description: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
    disabled?: boolean;
}

function SettingItem({ title, description, checked, onChange, disabled }: SettingItemProps) {
    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                py: 2.5,
                px: 3,
                transition: 'background-color 0.2s ease',
                '&:hover': {
                    bgcolor: (theme) => theme.palette.mode === 'dark'
                        ? 'rgba(255,255,255,0.03)'
                        : 'rgba(0,0,0,0.01)',
                },
            }}
        >
            <Box sx={{ flex: 1, pr: 3 }}>
                <Typography
                    sx={{
                        fontSize: '1rem',
                        fontWeight: 500,
                        color: (theme) => theme.palette.mode === 'dark' ? '#ffffff' : '#1d1d1f',
                        mb: 0.5,
                    }}
                >
                    {title}
                </Typography>
                <Typography
                    sx={{
                        fontSize: '0.875rem',
                        color: (theme) => theme.palette.mode === 'dark' ? '#a0a0a0' : '#6e6e73',
                        lineHeight: 1.5,
                    }}
                >
                    {description}
                </Typography>
            </Box>
            <Switch
                checked={checked}
                onChange={onChange}
                disabled={disabled}
            />
        </Box>
    );
}

interface SettingSectionProps {
    title: string;
    children: React.ReactNode;
}

function SettingSection({ title, children }: SettingSectionProps) {
    return (
        <Box
            sx={{
                bgcolor: (theme) => theme.palette.mode === 'dark' ? '#1a1a1a' : 'white',
                borderRadius: '18px',
                overflow: 'hidden',
                boxShadow: (theme) => theme.palette.mode === 'dark'
                    ? '0 2px 8px rgba(0,0,0,0.3)'
                    : '0 2px 8px rgba(0,0,0,0.04)',
                mb: 3,
            }}
        >
            <Box sx={{ px: 3, pt: 3, pb: 1 }}>
                <Typography
                    sx={{
                        fontSize: '1.125rem',
                        fontWeight: 600,
                        color: (theme) => theme.palette.mode === 'dark' ? '#ffffff' : '#1d1d1f',
                        letterSpacing: '-0.01em',
                    }}
                >
                    {title}
                </Typography>
            </Box>
            <Divider sx={{
                borderColor: (theme) => theme.palette.mode === 'dark'
                    ? 'rgba(255,255,255,0.1)'
                    : 'rgba(0,0,0,0.06)'
            }} />
            {children}
        </Box>
    );
}

export default function SettingsPage() {
    const [autoSave, setAutoSave] = useState(true);
    const [notifications, setNotifications] = useState(true);
    const [strictSearchFilter, setStrictSearchFilter] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            setIsLoading(true);
            const data = await api.get<{
                auto_generate_tags: boolean;
                enable_strict_search_filter: boolean;
            }>('/settings', true);

            setStrictSearchFilter(data.enable_strict_search_filter);
        } catch (err) {
            if (err instanceof APIError) {
                setError(err.detail);
            } else {
                setError('加载设置失败');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        setSaveSuccess(false);
        setError(null);

        try {
            await api.put(
                '/settings',
                {
                    enable_strict_search_filter: strictSearchFilter,
                },
                true
            );
            setSaveSuccess(true);
        } catch (err) {
            if (err instanceof APIError) {
                setError(err.detail);
            } else {
                setError('保存设置失败');
            }
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: 400,
                }}
            >
                <CircularProgress sx={{ color: '#0071e3' }} />
            </Box>
        );
    }

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

            {/* 行为设置 */}
            <SettingSection title="行为">
                <SettingItem
                    title="自动保存"
                    description="编辑内容时自动保存，无需手动点击保存按钮"
                    checked={autoSave}
                    onChange={setAutoSave}
                />
                <Divider sx={{ borderColor: 'rgba(0,0,0,0.06)' }} />
                <SettingItem
                    title="启用通知"
                    description="接收系统通知和更新提醒"
                    checked={notifications}
                    onChange={setNotifications}
                />
            </SettingSection>

            {/* 搜索设置 */}
            <SettingSection title="搜索">
                <SettingItem
                    title="严格搜索过滤"
                    description="启用后，搜索结果只显示标题中包含关键词的内容，可以有效减少不相关的结果"
                    checked={strictSearchFilter}
                    onChange={setStrictSearchFilter}
                />
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
                    {isSaving ? <CircularProgress size={24} sx={{ color: 'white' }} /> : '保存设置'}
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
                    设置已保存
                </Alert>
            </Snackbar>
        </Box>
    );
}
