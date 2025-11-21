'use client';

import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Box,
    Typography,
    Chip,
    Rating,
    Stack,
    Divider,
} from '@mui/material';
import { AppleButton } from '@/components/ui';
import type { UserItem } from '@/types';
import { statusLabels, statusColors, typeLabels } from '@/lib/adapters/userItemAdapter';

interface ItemDetailDialogProps {
    open: boolean;
    item: UserItem | null;
    onClose: () => void;
    onEdit: () => void;
    onDelete: () => void;
}

export default function ItemDetailDialog({
    open,
    item,
    onClose,
    onEdit,
    onDelete,
}: ItemDetailDialogProps) {
    if (!item) return null;

    const coverImage = item.poster_url || item.backdrop_url;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ fontWeight: 600 }}>{item.title}</DialogTitle>

            <DialogContent>
                <Box sx={{ display: 'flex', gap: 3 }}>
                    {/* Cover Image */}
                    {coverImage && (
                        <Box
                            sx={{
                                width: 200,
                                height: 280,
                                borderRadius: 2,
                                overflow: 'hidden',
                                flexShrink: 0,
                                bgcolor: 'grey.200',
                            }}
                        >
                            <img
                                src={coverImage}
                                alt={item.title}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                }}
                            />
                        </Box>
                    )}

                    {/* Details */}
                    <Box sx={{ flex: 1 }}>
                        <Stack spacing={2}>
                            {/* Type and Status */}
                            <Box>
                                <Stack direction="row" spacing={1}>
                                    <Chip
                                        label={typeLabels[item.content_type]}
                                        variant="outlined"
                                        sx={{ borderRadius: 1 }}
                                    />
                                    <Chip
                                        label={statusLabels[item.status]}
                                        color={statusColors[item.status]}
                                        sx={{ borderRadius: 1 }}
                                    />
                                </Stack>
                            </Box>

                            <Divider />

                            {/* Original Title */}
                            {item.original_title && (
                                <Box>
                                    <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 500 }}>
                                        原标题
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {item.original_title}
                                    </Typography>
                                </Box>
                            )}

                            {/* Description */}
                            {item.description && (
                                <Box>
                                    <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 500 }}>
                                        简介
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {item.description}
                                    </Typography>
                                </Box>
                            )}

                            {/* Rating */}
                            {item.rating && (
                                <Box>
                                    <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 500 }}>
                                        评分
                                    </Typography>
                                    <Stack direction="row" alignItems="center" spacing={1}>
                                        <Rating value={item.rating} readOnly precision={0.5} />
                                        <Typography variant="body2" color="text.secondary">
                                            {item.rating}/10
                                        </Typography>
                                    </Stack>
                                </Box>
                            )}

                            {/* Release Info */}
                            {(item.release_date || item.year) && (
                                <Box>
                                    <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 500 }}>
                                        发布信息
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {item.release_date || item.year}
                                    </Typography>
                                </Box>
                            )}

                            {/* Notes */}
                            {item.notes && (
                                <Box>
                                    <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 500 }}>
                                        笔记
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {item.notes}
                                    </Typography>
                                </Box>
                            )}

                            {/* Dates */}
                            <Box>
                                <Typography variant="caption" color="text.secondary">
                                    创建时间：{new Date(item.created_at).toLocaleString('zh-CN')}
                                </Typography>
                                <br />
                                <Typography variant="caption" color="text.secondary">
                                    更新时间：{new Date(item.updated_at).toLocaleString('zh-CN')}
                                </Typography>
                            </Box>
                        </Stack>
                    </Box>
                </Box>
            </DialogContent>

            <DialogActions sx={{ p: 3, pt: 0 }}>
                <AppleButton variant="ghost" onClick={onClose}>
                    关闭
                </AppleButton>
                <AppleButton variant="secondary" onClick={onEdit}>
                    编辑
                </AppleButton>
                <AppleButton
                    variant="primary"
                    onClick={onDelete}
                    sx={{
                        bgcolor: 'error.main',
                        '&:hover': {
                            bgcolor: 'error.dark',
                        },
                    }}
                >
                    删除
                </AppleButton>
            </DialogActions>
        </Dialog>
    );
}
