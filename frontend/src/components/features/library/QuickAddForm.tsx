'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
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
} from '@mui/material';
import { AppleButton, AppleInput } from '@/components/ui';
import { userItemsApi } from '@/lib/api';
import type { ItemType, ItemStatus } from '@/types';
import { createManualItemRequest, typeLabels, statusLabels } from '@/lib/adapters/userItemAdapter';

const addItemSchema = z.object({
    title: z.string().min(1, '请输入标题'),
    content_type: z.enum(['movie', 'tv', 'anime', 'book']),
    status: z.enum(['want_to_watch', 'watching', 'watched']),
    rating: z.number().min(0).max(10).optional(),
    notes: z.string().optional(),
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
    } = useForm<AddItemFormData>({
        resolver: zodResolver(addItemSchema),
        defaultValues: {
            content_type: 'movie',
            status: 'want_to_watch',
        },
    });

    const onSubmit = async (data: AddItemFormData) => {
        try {
            setLoading(true);
            setError('');

            const requestData = createManualItemRequest(data);
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
            reset();
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
                        <AppleInput
                            label="标题"
                            placeholder="请输入标题"
                            fullWidth
                            error={!!errors.title}
                            helperText={errors.title?.message}
                            {...register('title')}
                        />

                        <AppleInput
                            label="类型"
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

                        <AppleInput
                            label="状态"
                            select
                            fullWidth
                            error={!!errors.status}
                            helperText={errors.status?.message}
                            {...register('status')}
                        >
                            {itemStatuses.map((status) => (
                                <MenuItem key={status.value} value={status.value}>
                                    {status.label}
                                </MenuItem>
                            ))}
                        </AppleInput>

                        <AppleInput
                            label="评分（可选）"
                            type="number"
                            placeholder="0-10"
                            fullWidth
                            error={!!errors.rating}
                            helperText={errors.rating?.message}
                            inputProps={{ min: 0, max: 10, step: 1 }}
                            {...register('rating', { valueAsNumber: true })}
                        />

                        <AppleInput
                            label="笔记（可选）"
                            placeholder="添加一些笔记..."
                            multiline
                            rows={4}
                            fullWidth
                            error={!!errors.notes}
                            helperText={errors.notes?.message}
                            {...register('notes')}
                        />
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
