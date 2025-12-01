'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Box,
    MenuItem,
    Alert,
    Collapse,
} from '@mui/material';
import { AppleButton, AppleInput } from '@/components/ui';
import { userItemsApi } from '@/lib/api';
import type { ItemType, ItemStatus } from '@/types';
import { createManualItemRequest, typeLabels, statusLabels } from '@/lib/adapters/userItemAdapter';

const addItemSchema = z.object({
    title: z.string().min(1, '请输入标题'),
    content_type: z.enum(['movie', 'tv', 'anime', 'book']),
    status: z.enum(['want_to_watch', 'watching', 'watched']),
    rating: z.number().min(0).max(10).optional().nullable(),
    notes: z.string().optional(),
    progress: z.number().min(0).optional().nullable(),
    started_at: z.string().optional(),
    completed_at: z.string().optional(),
});

type AddItemFormData = z.infer<typeof addItemSchema>;

interface QuickAddFormProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const itemTypes: { value: ItemType; label: string }[] = [
    { value: 'movie', label: typeLabels.movie },
    { value: 'tv', label: typeLabels.tv },
    { value: 'anime', label: typeLabels.anime },
    { value: 'book', label: typeLabels.book },
];

const itemStatuses: { value: ItemStatus; label: string }[] = [
    { value: 'want_to_watch', label: statusLabels.want_to_watch },
    { value: 'watching', label: statusLabels.watching },
    { value: 'watched', label: statusLabels.watched },
];

export default function QuickAddForm({ open, onClose, onSuccess }: QuickAddFormProps) {
    const [error, setError] = useState<string>('');
    const [loading, setLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        watch,
        control,
    } = useForm<AddItemFormData>({
        resolver: zodResolver(addItemSchema),
        defaultValues: {
            content_type: 'movie',
            status: 'want_to_watch',
            rating: undefined,
            notes: '',
            progress: undefined,
            started_at: undefined,
            completed_at: undefined,
        },
    });

    const currentStatus = watch('status');

    const onSubmit = async (data: AddItemFormData) => {
        try {
            setLoading(true);
            setError('');

            // 处理null值，转换为undefined
            const cleanedData = {
                ...data,
                rating: data.rating ?? undefined,
                progress: data.progress ?? undefined,
            };

            const requestData = createManualItemRequest(cleanedData);
            await userItemsApi.create(requestData);
            reset();
            onSuccess();
            onClose();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : '添加失败，请重试');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (!loading) {
            reset({
                content_type: 'movie',
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

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ fontWeight: 600 }}>添加新项目</DialogTitle>

            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogContent>
                    {error && (
                        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                            {error}
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
                                    helperText={errors.status?.message || '请先选择观看状态'}
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

                        {/* 基础信息 - 所有状态都显示 */}
                        <AppleInput
                            label="标题 *"
                            placeholder="请输入标题"
                            fullWidth
                            error={!!errors.title}
                            helperText={errors.title?.message}
                            {...register('title')}
                        />

                        <AppleInput
                            label="类型 *"
                            select
                            fullWidth
                            error={!!errors.content_type}
                            helperText={errors.content_type?.message}
                            {...register('content_type')}
                        >
                            {itemTypes.map((type) => (
                                <MenuItem key={type.value} value={type.value}>
                                    {type.label}
                                </MenuItem>
                            ))}
                        </AppleInput>

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

                <DialogActions sx={{ p: 3, pt: 0 }}>
                    <AppleButton variant="ghost" onClick={handleClose} disabled={loading}>
                        取消
                    </AppleButton>
                    <AppleButton variant="primary" type="submit" disabled={loading}>
                        {loading ? '添加中...' : '添加'}
                    </AppleButton>
                </DialogActions>
            </form>
        </Dialog>
    );
}
