'use client';

import { useState } from 'react';
import { Box, Typography, Chip, Rating, Stack, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CheckIcon from '@mui/icons-material/Check';
import { AppleCard } from '@/components/ui';
import { userItemsApi } from '@/lib/api';
import type { UserItem } from '@/types';
import { statusLabels, statusColors, typeLabels } from '@/lib/adapters/userItemAdapter';

interface RecommendationCardProps {
    item: UserItem;
}

export default function RecommendationCard({ item }: RecommendationCardProps) {
    const [added, setAdded] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleAdd = async () => {
        try {
            setLoading(true);

            await userItemsApi.create({
                external_id: item.external_id,
                source: item.source,
                content_type: item.content_type,
                title: item.title,
                original_title: item.original_title,
                description: item.description,
                poster_url: item.poster_url,
                backdrop_url: item.backdrop_url,
                release_date: item.release_date,
                year: item.year,
                status: 'want_to_watch',
                rating: item.rating,
            });

            setAdded(true);
        } catch (error) {
            console.error('添加失败:', error);
        } finally {
            setLoading(false);
        }
    };

    const coverImage = item.poster_url || item.backdrop_url;

    return (
        <AppleCard hover sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Cover Image */}
            <Box
                sx={{
                    height: 300,
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

                {/* Add Button */}
                <IconButton
                    onClick={handleAdd}
                    disabled={loading || added}
                    sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        bgcolor: added ? 'success.main' : 'rgba(255, 255, 255, 0.9)',
                        color: added ? 'white' : 'primary.main',
                        '&:hover': {
                            bgcolor: added ? 'success.dark' : 'rgba(255, 255, 255, 1)',
                        },
                        '&.Mui-disabled': {
                            bgcolor: 'success.main',
                            color: 'white',
                        },
                    }}
                >
                    {added ? <CheckIcon /> : <AddIcon />}
                </IconButton>

                {/* Recommendation Badge */}
                <Chip
                    label="推荐"
                    size="small"
                    color="primary"
                    sx={{
                        position: 'absolute',
                        top: 8,
                        left: 8,
                        fontWeight: 600,
                    }}
                />
            </Box>

            {/* Content */}
            <Box sx={{ p: 2, flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h6" noWrap sx={{ fontWeight: 600, mb: 1 }}>
                    {item.title}
                </Typography>

                {item.description && (
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                            mb: 2,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical',
                        }}
                    >
                        {item.description}
                    </Typography>
                )}

                <Box sx={{ mt: 'auto' }}>
                    <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                        <Chip
                            label={typeLabels[item.content_type]}
                            size="small"
                            variant="outlined"
                            sx={{ borderRadius: 1 }}
                        />
                        {item.year && (
                            <Chip label={item.year} size="small" variant="outlined" sx={{ borderRadius: 1 }} />
                        )}
                    </Stack>

                    {item.rating && (
                        <Rating value={item.rating / 2} readOnly size="small" precision={0.5} />
                    )}
                </Box>
            </Box>
        </AppleCard>
    );
}
