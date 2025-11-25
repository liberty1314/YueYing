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
import { api, APIError } from '@/lib/apiClient';

export default function SettingsPage() {
    const [autoSave, setAutoSave] = useState(true);
    const [notifications, setNotifications] = useState(true);
    const [strictSearchFilter, setStrictSearchFilter] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // 加载用户设置
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
            // 可以在这里加载其他设置
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
            setTimeout(() => setSaveSuccess(false), 3000);
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

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            {isLoading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                </Box>
            )}

            {!isLoading && (
                <>
                    {/* 行为设置 */}
                    <AppleCard sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                            行为
                        </Typography>

                        <Box sx={{ mb: 3 }}>
                            <FormControlLabel
                                control={
                                    <Switch checked={autoSave} onChange={(e) => setAutoSave(e.target.checked)} />
                                }
                                label="自动保存"
                                sx={{ display: 'block' }}
                            />
                            <Typography variant="body2" color="text.secondary" sx={{ ml: 4, mt: 1 }}>
                                编辑内容时自动保存，无需手动点击保存按钮
                            </Typography>
                        </Box>

                        <Box>
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
                            <Typography variant="body2" color="text.secondary" sx={{ ml: 4, mt: 1 }}>
                                接收系统通知和更新提醒
                            </Typography>
                        </Box>
                    </AppleCard>

                    {/* 搜索设置 */}
                    <AppleCard sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                            搜索
                        </Typography>

                        <FormControlLabel
                            control={
                                <Switch
                                    checked={strictSearchFilter}
                                    onChange={(e) => setStrictSearchFilter(e.target.checked)}
                                />
                            }
                            label="严格搜索过滤"
                            sx={{ display: 'block' }}
                        />
                        <Typography variant="body2" color="text.secondary" sx={{ ml: 4, mt: 1 }}>
                            启用后，搜索结果只显示标题中包含关键词的内容，可以有效减少不相关的结果
                        </Typography>
                    </AppleCard>
                </>
            )}

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
