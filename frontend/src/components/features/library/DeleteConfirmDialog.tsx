'use client';

import { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Typography,
    Alert,
} from '@mui/material';
import { AppleButton } from '@/components/ui';
import { userItemsApi } from '@/lib/api';
import type { UserItem } from '@/types';

interface DeleteConfirmDialogProps {
    open: boolean;
    item: UserItem | null;
    onClose: () => void;
    onSuccess: () => void;
}

export default function DeleteConfirmDialog({
    open,
    item,
    onClose,
    onSuccess,
}: DeleteConfirmDialogProps) {
    const [error, setError] = useState<string>('');
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        if (!item) return;

        try {
            setLoading(true);
            setError('');

            await userItemsApi.delete(item.id);
            onSuccess();
            onClose();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : '删除失败，请重试');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (!loading) {
            setError('');
            onClose();
        }
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
            <DialogTitle sx={{ fontWeight: 600 }}>确认删除</DialogTitle>

            <DialogContent>
                {error && (
                    <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                        {error}
                    </Alert>
                )}

                <Typography>
                    确定要删除 <strong>{item?.title}</strong> 吗？此操作无法撤销。
                </Typography>
            </DialogContent>

            <DialogActions sx={{ p: 3, pt: 0 }}>
                <AppleButton variant="ghost" onClick={handleClose} disabled={loading}>
                    取消
                </AppleButton>
                <AppleButton
                    variant="primary"
                    onClick={handleDelete}
                    disabled={loading}
                    sx={{
                        bgcolor: 'error.main',
                        '&:hover': {
                            bgcolor: 'error.dark',
                        },
                    }}
                >
                    {loading ? '删除中...' : '删除'}
                </AppleButton>
            </DialogActions>
        </Dialog>
    );
}
