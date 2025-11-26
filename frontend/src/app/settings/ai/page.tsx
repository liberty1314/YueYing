'use client';

import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Switch,
    Button,
    CircularProgress,
    Alert,
    Snackbar,
    Divider,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { userSettingsApi, type UserSettings } from '@/lib/api/userSettings';

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
                    bgcolor: 'rgba(0,0,0,0.01)',
                },
            }}
        >
            <Box sx={{ flex: 1, pr: 3 }}>
                <Typography
                    sx={{
                        fontSize: '1rem',
                        fontWeight: 500,
                        color: '#1d1d1f',
                        mb: 0.5,
                    }}
                >
                    {title}
                </Typography>
                <Typography
                    sx={{
                        fontSize: '0.875rem',
                        color: '#6e6e73',
                        lineHeight: 1.5,
                    }}
                >
                    {description}
                </Typography>
            </Box>
            <Switch
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
                disabled={disabled}
                sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                        color: '#0071e3',
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: '#0071e3',
                    },
                }}
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
            {children}
        </Box>
    );
}

export default function AISettingsPage() {
    const [settings, setSettings] = useState<UserSettings | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            setIsLoading(true);
            const data = await userSettingsApi.getSettings();
            setSettings(data);
        } catch (err) {
            setError('加载设置失败');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        if (!settings) return;

        setIsSaving(true);
        setSaveSuccess(false);
        setError('');

        try {
            await userSettingsApi.updateSettings({
                auto_generate_tags: settings.auto_generate_tags,
            });
            setSaveSuccess(true);
        } catch (err) {
            setError('保存设置失败');
            console.error(err);
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

    if (!settings) {
        return (
            <Alert
                severity="error"
                sx={{
                    borderRadius: '12px',
                    bgcolor: '#fff5f5',
                    border: '1px solid #feb2b2',
                }}
            >
                加载设置失败
            </Alert>
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

            {/* AI 功能设置 */}
            <SettingSection title="自动化功能">
                <SettingItem
                    title="自动生成标签"
                    description="添加新内容时自动使用 AI 生成相关标签"
                    checked={settings.auto_generate_tags}
                    onChange={(checked) =>
                        setSettings({
                            ...settings,
                            auto_generate_tags: checked,
                        })
                    }
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
