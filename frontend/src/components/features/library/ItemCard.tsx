'use client';

import { useState } from 'react';
import {
    Box,
    Typography,
    Chip,
    IconButton,
    Menu,
    MenuItem,
    Rating,
    Stack,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { AppleCard } from '@/components/ui';
import type { UserItem } from '@/types';
import { statusLabels, statusColors, typeLabels } from '@/lib/adapters/userItemAdapter';

interface ItemCardProps {
    item: UserItem;
    onRefresh: () => void;
    onView: (item: UserItem) => void;
    onEdit: (item: UserItem) => void;
    onDelete: (item: UserItem) => void;
    variant?: 'grid' | 'list';
}

export default function ItemCard({
    item,
    onRefresh,
    onView,
    onEdit,
    onDelete,
    variant = 'grid',
}: ItemCardProps) {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleView = () => {
        onView(item);
        handleMenuClose();
    };

    const handleEdit = () => {
        onEdit(item);
        handleMenuClose();
    };

    const handleDelete = () => {
        onDelete(item);
        handleMenuClose();
    };

    // 获取封面图片
    const coverImage = item.poster_url || item.backdrop_url;

    if (variant === 'list') {
        return (
            <AppleCard hover sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {/* Cover Image */}
                    {coverImage && (
                        <Box
                            sx={{
                                width: 60,
                                height: 80,
                                borderRadius: 1,
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

                    {/* Content */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                            <Typography variant="h6" noWrap sx={{ fontWeight: 600 }}>
                                {item.title}
                            </Typography>
                            <Chip
                                label={typeLabels[item.content_type]}
                                size="small"
                                variant="outlined"
                                sx={{ borderRadius: 1 }}
                            />
                        </Stack>

                        <Stack direction="row" alignItems="center" spacing={2}>
                            <Chip
                                label={statusLabels[item.status]}
                                size="small"
                                color={statusColors[item.status]}
                                sx={{ borderRadius: 1 }}
                            />
                            {item.rating && (
                                <Rating value={item.rating} readOnly size="small" precision={0.5} />
                            )}
                        </Stack>
                    </Box>

                    {/* Actions */}
                    <IconButton onClick={handleMenuOpen}>
                        <MoreVertIcon />
                    </IconButton>
                </Box>
            </AppleCard>
        );
    }

    return (
        <AppleCard hover sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Cover Image */}
            <Box
                sx={{
                    height: 200,
                    bgcolor: 'grey.200',
                    borderRadius: '12px 12px 0 0',
                    overflow: 'hidden',
                    position: 'relative',
                }}
            >
                {coverImage ? (
                    <img
                        src={coverImage}
                        alt={item.title}
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                        }}
                    />
                ) : (
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '100%',
                            color: 'text.secondary',
                        }}
                    >
                        <Typography variant="body2">暂无封面</Typography>
                    </Box>
                )}

                {/* Actions */}
                <IconButton
                    onClick={handleMenuOpen}
                    sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        bgcolor: 'rgba(255, 255, 255, 0.9)',
                        '&:hover': {
                            bgcolor: 'rgba(255, 255, 255, 1)',
                        },
                    }}
                >
                    <MoreVertIcon />
                </IconButton>
            </Box>

            {/* Content */}
            <Box sx={{ p: 2, flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h6" noWrap sx={{ fontWeight: 600, mb: 1 }}>
                    {item.title}
                </Typography>

                <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                    <Chip
                        label={typeLabels[item.content_type]}
                        size="small"
                        variant="outlined"
                        sx={{ borderRadius: 1 }}
                    />
                    <Chip
                        label={statusLabels[item.status]}
                        size="small"
                        color={statusColors[item.status]}
                        sx={{ borderRadius: 1 }}
                    />
                </Stack>

                {item.rating && (
                    <Box sx={{ mt: 'auto' }}>
                        <Rating value={item.rating} readOnly size="small" precision={0.5} />
                    </Box>
                )}
            </Box>

            {/* Menu */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
                <MenuItem onClick={handleView}>
                    <VisibilityIcon sx={{ mr: 1 }} />
                    查看详情
                </MenuItem>
                <MenuItem onClick={handleEdit}>
                    <EditIcon sx={{ mr: 1 }} />
                    编辑
                </MenuItem>
                <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
                    <DeleteIcon sx={{ mr: 1 }} />
                    删除
                </MenuItem>
            </Menu>
        </AppleCard>
    );
}
