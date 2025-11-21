'use client';

import { useState } from 'react';
import {
    Box,
    Typography,
    FormControlLabel,
    Switch,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Button,
    CircularProgress,
    Alert,
} from '@mui/material';
import { AppleCard } from '@/components/ui';
import { useUiStore } from '@/stores/uiStore';

export default function SettingsPage() {
    const { theme, setTheme } = useUiStore();
    const [language, setLanguage] = useState('zh-CN');
    const [autoSave, setAutoSave] = useState(true);
    const [notifications, setNotifications] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        setSaveSuccess(false);

        try {
            // 模拟保存
            await new Promise((resolve) => setTimeout(resolve, 500));
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (error) {
            console.error('保存设置失败:', error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
                通用设置
            </Typography>

            {saveSuccess && (
                <Alert severity="success" sx={{ mb: 3 }}>
                    设置已保存
                </Alert>
            )}

            {/* 外观设置 */}
            <AppleCard sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                    外观
                </Typography>

                <FormControl fullWidth sx={{ mb: 3 }}>
                    <InputLabel>主题模式</InputLabel>
                    <Select
                        value={theme}
                        label="主题模式"
                        onChange={(e) => setTheme(e.target.value as 'light' | 'dark')}
                    >
                        <MenuItem value="light">浅色</MenuItem>
                        <MenuItem value="dark">深色</MenuItem>
                    </Select>
                </FormControl>

                <FormControl fullWidth>
                    <InputLabel>语言</InputLabel>
                    <Select
                        value={language}
                        label="语言"
                        onChange={(e) => setLanguage(e.target.value)}
                    >
                        <MenuItem value="zh-CN">简体中文</MenuItem>
                        <MenuItem value="en-US">English</MenuItem>
                    </Select>
                </FormControl>
            </AppleCard>

            {/* 行为设置 */}
            <AppleCard sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                    行为
                </Typography>

                <FormControlLabel
                    control={
                        <Switch checked={autoSave} onChange={(e) => setAutoSave(e.target.checked)} />
                    }
                    label="自动保存"
                    sx={{ mb: 2, display: 'block' }}
                />

                <FormControlLabel
                    control={
                        <Switch
                            checked={notifications}
                            onChange={(e) => setNotifications(e.target.checked)}
                        />
                    }
                    label="启用通知"
                    sx={{ display: 'block' }}
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
                    {isSaving ? <CircularProgress size={24} /> : '保存设置'}
                </Button>
            </Box>
        </Box>
    );
}
