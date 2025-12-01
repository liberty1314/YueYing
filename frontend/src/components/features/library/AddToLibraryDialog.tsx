'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
    DialogTitle,
    DialogContent,
    DialogActions,
    Box,
    MenuItem,
    Alert,
    Collapse,
    Typography,
} from '@mui/material';
import { AppleButton, AppleInput, AppleDialog } from '@/components/ui';
import { addToLibrary } from '@/utils/library';
import type { ItemStatus } from '@/types';
import { statusLabels } from '@/lib/adapters/userItemAdapter';

const addToLibrarySchema = z.object({
    status: z.enum(['want_to_watch', 'watching', 'watched']),
    rating: z.number().min(0).max(10).optional().nullable(),
    notes: z.string().optional(),
    progress: z.number().min(0).optional().nullable(),
    started_at: z.string().optional(),
    completed_at: z.string().optional(),
});

type AddToLibraryFormData = z.infer<typeof addToLibrarySchema>;

interface AddToLibraryDialogProps {
    open: boolean;
    content: any;
    onClose: () => void;
    onSuccess: () => void;
}

const itemStatuses: { value: ItemStatus; label: string }[] = [
    { value: 'want_to_watch', label: statusLabels.want_to_watch },
    { value: 'watching', label: statusLabels.watching },
    { value: 'watched', label: statusLabels.watched },
];

export default function AddToLibraryDialog({
    open,
    content,
    onClose,
    onSuccess,
}: AddToLibraryDialogProps) {
    const [error, setError] = useState<string>('');
    const [loading, setLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        watch,
        control,
    } = useForm<AddToLibraryFormData>({
        resolver: zodResolver(addToLibrarySchema),
        defaultValues: {
            status: 'want_to_watch',
            rating: undefined,
            notes: '',
            progress: undefined,
            started_at: undefined,
            completed_at: undefined,
        },
    });

    const currentStatus = watch('status');

    const onSubmit = async (data: AddToLibraryFormData) => {
        console.log('=== AddToLibraryDialog onSubmit ===');
        console.log('Form data:', data);
        console.log('Content:', content);

        if (!content) {
            console.error('Content is null, cannot submit');
            setError('内容信息缺失，无法添加');
            return;
        }

        try {
            setLoading(true);
            setError('');

            // 处理null值，转换为undefined
            const cleanedData = {
                rating: data.rating ?? undefined,
                progress: data.progress ?? undefined,
                notes: data.notes,
                started_at: data.started_at,
                completed_at: data.completed_at,
            };

            // 合并content和表单数据
            const itemToAdd = {
                ...content,
                ...cleanedData,
                status: data.status,
            };

            console.log('Item to add:', itemToAdd);

            const result = await addToLibrary(itemToAdd, data.status);

            console.log('Add result:', result);

            if (result.success) {
                reset();
                onSuccess();
                onClose();
            } else {
                setError(result.message);
            }
        } catch (err: unknown) {
            console.error('Add to library error:', err);
            setError(err instanceof Error ? err.message : '添加失败，请重试');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (!loading) {
            reset({
                status: 'want_to_watch',
                rating: undefined,
                notes: '',
                progress: undefined,
                started_at: undefined,
                completed_at: undefined,
            });
            setError('');
            onClose();
        }
    };

    const contentTitle = content?.title || content?.name || content?.name_cn || '未知内容';

    return (
        <AppleDialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{
                fontSize: '24px',
                fontWeight: 600,
                px: 4,
                pt: 4,
                pb: 2,
            }}>
                添加到收藏库
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontSize: '14px', fontWeight: 400 }}>
                    {contentTitle}
                </Typography>
            </DialogTitle>

            <form onSubmit={handleSubmit(onSubmit, (errors) => {
                console.log('=== Form validation errors ===');
                console.log('Errors:', errors);
            })}>
                <DialogContent sx={{ px: 4, py: 3 }}>
                    {error && (
                        <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }}>
                            {error}
                        </Alert>
                    )}

                    {Object.keys(errors).length > 0 && (
                        <Alert severity="warning" sx={{ mb: 3, borderRadius: 3 }}>
                            表单验证失败，请检查输入
                        </Alert>
                    )}

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        {/* 状态选择 - 必填，放在最前面 */}
                        <Controller
                            name="status"
                            control={control}
                            render={({ field }) => (
                                <AppleInput
                                    label="观看状态 *"
                                    select
                                    fullWidth
                                    error={!!errors.status}
                                    helperText={errors.status?.message || '请选择观看状态'}
                                    {...field}
                                >
                                    {itemStatuses.map((status) => (
                                        <MenuItem key={status.value} value={status.value}>
                                            {status.label}
                                        </MenuItem>
                                    ))}
                                </AppleInput>
                            )}
                        />

                        {/* 在看状态 - 显示进度和开始日期 */}
                        <Collapse in={currentStatus === 'watching'} timeout="auto">
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                <AppleInput
                                    label="观看进度（可选）"
                                    type="number"
                                    placeholder="例如：第5集、第100页"
                                    fullWidth
                                    error={!!errors.progress}
                                    helperText={errors.progress?.message || '当前观看到第几集/第几页'}
                                    slotProps={{ htmlInput: { min: 0, step: 1 } }}
                                    {...register('progress', {
                                        setValueAs: (v) => v === '' || isNaN(v) ? undefined : Number(v)
                                    })}
                                />
                                <AppleInput
                                    label="开始日期（可选）"
                                    type="date"
                                    fullWidth
                                    error={!!errors.started_at}
                                    helperText={errors.started_at?.message}
                                    slotProps={{ inputLabel: { shrink: true } }}
                                    {...register('started_at')}
                                />
                            </Box>
                        </Collapse>

                        {/* 已看状态 - 显示评分、观看感受和完成日期 */}
                        <Collapse in={currentStatus === 'watched'} timeout="auto">
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                <AppleInput
                                    label="评分（可选）"
                                    type="number"
                                    placeholder="0-10分"
                                    fullWidth
                                    error={!!errors.rating}
                                    helperText={errors.rating?.message || '给这部作品打个分吧'}
                                    slotProps={{ htmlInput: { min: 0, max: 10, step: 1 } }}
                                    {...register('rating', {
                                        setValueAs: (v) => v === '' || isNaN(v) ? undefined : Number(v)
                                    })}
                                />
                                <AppleInput
                                    label="观看感受（可选）"
                                    placeholder="分享你的观看感受..."
                                    multiline
                                    rows={4}
                                    fullWidth
                                    error={!!errors.notes}
                                    helperText={errors.notes?.message}
                                    {...register('notes')}
                                />
                                <AppleInput
                                    label="完成日期（可选）"
                                    type="date"
                                    fullWidth
                                    error={!!errors.completed_at}
                                    helperText={errors.completed_at?.message}
                                    slotProps={{ inputLabel: { shrink: true } }}
                                    {...register('completed_at')}
                                />
                            </Box>
                        </Collapse>

                        {/* 想看状态 - 只显示备注 */}
                        <Collapse in={currentStatus === 'want_to_watch'} timeout="auto">
                            <AppleInput
                                label="备注（可选）"
                                placeholder="添加一些备注..."
                                multiline
                                rows={3}
                                fullWidth
                                error={!!errors.notes}
                                helperText={errors.notes?.message}
                                {...register('notes')}
                            />
                        </Collapse>
                    </Box>
                </DialogContent>

                <DialogActions sx={{
                    px: 4,
                    pb: 4,
                    pt: 2,
                    gap: 2,
                    justifyContent: 'flex-end',
                }}>
                    <AppleButton
                        variant="ghost"
                        onClick={handleClose}
                        disabled={loading}
                        sx={{ minWidth: 100, height: 44 }}
                    >
                        取消
                    </AppleButton>
                    <AppleButton
                        variant="primary"
                        type="submit"
                        disabled={loading}
                        onClick={(e) => {
                            console.log('Button clicked!');
                            console.log('Button type:', e.currentTarget.type);
                        }}
                        sx={{ minWidth: 100, height: 44 }}
                    >
                        {loading ? '添加中...' : '添加'}
                    </AppleButton>
                </DialogActions>
            </form>
        </AppleDialog>
    );
}
