'use client';

import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    FormControlLabel,
    Switch,
    Button,
    CircularProgress,
    Alert,
} from '@mui/material';
import { AppleCard } from '@/components/ui';
import { userSettingsApi, type UserSettings } from '@/lib/api/userSettings';

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
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (err) {
            setError('保存设置失败');
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!settings) {
        return (
            <Box>
                <Alert severity="error">加载设置失败</Alert>
            </Box>
        );
    }

    return (
        <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
                AI 设置
            </Typography>

            {saveSuccess && (
                <Alert severity="success" sx={{ mb: 3 }}>
                    设置已保存
                </Alert>
            )}

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            {/* AI 功能设置 */}
            <AppleCard sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                    自动化功能
                </Typography>

                <FormControlLabel
                    control={
                        <Switch
                            checked={settings.auto_generate_tags}
                            onChange={(e) =>
                                setSettings({
                                    ...settings,
                                    auto_generate_tags: e.target.checked,
                                })
                            }
                        />
                    }
                    label="自动生成标签"
                    sx={{ mb: 1, display: 'block' }}
                />
                <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
                    添加新内容时自动使用 AI 生成相关标签
                </Typography>
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
                    {isSaving ? <CircularProgress size={24} /> : '保存设置'}
                </Button>
            </Box>
        </Box>
    );
}
