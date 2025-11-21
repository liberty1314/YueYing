'use client';

import { useState } from 'react';
import { Box, Typography, Chip, Rating, Stack, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CheckIcon from '@mui/icons-material/Check';
import { AppleCard } from '@/components/ui';
import { userItemsApi } from '@/lib/api';
import type { ItemType } from '@/types';

interface SearchResult {
    id: string;
    external_id: string;
    title: string;
    original_title?: string;
    description?: string;
    poster_url?: string;
    backdrop_url?: string;
    release_date?: string;
    year?: string;
    rating?: number;
}

interface SearchCardProps {
    result: SearchResult;
    contentType: ItemType;
    source: string;
}

export default function SearchCard({ result, contentType, source }: SearchCardProps) {
    const [added, setAdded] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleAdd = async () => {
        try {
            setLoading(true);

            await userItemsApi.create({
                external_id: result.external_id,
                source: source,
                content_type: contentType,
                title: result.title,
                original_title: result.original_title,
                description: result.description,
                poster_url: result.poster_url,
                backdrop_url: result.backdrop_url,
                release_date: result.release_date,
                year: result.year,
                status: 'want_to_watch',
                rating: result.rating,
            });

            setAdded(true);
        } catch (error) {
            console.error('添加失败:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AppleCard hover sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Poster */}
            <Box
                sx={{
                    height: 300,
                    bgcolor: 'grey.200',
                    borderRadius: '12px 12px 0 0',
                    overflow: 'hidden',
                    position: 'relative',
                }}
            >
                {result.poster_url ? (
                    <img
                        src={result.poster_url}
                        alt={result.title}
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
            </Box>

            {/* Content */}
            <Box sx={{ p: 2, flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Typography
                    variant="h6"
                    sx={{
                        fontWeight: 600,
                        mb: 1,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                    }}
                >
                    {result.title}
                </Typography>

                {result.original_title && result.original_title !== result.title && (
                    <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ mb: 1, display: 'block' }}
                    >
                        {result.original_title}
                    </Typography>
                )}

                {result.description && (
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
                        {result.description}
                    </Typography>
                )}

                <Box sx={{ mt: 'auto' }}>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                        {result.year && (
                            <Chip label={result.year} size="small" variant="outlined" sx={{ borderRadius: 1 }} />
                        )}
                    </Stack>

                    {result.rating && (
                        <Rating value={result.rating / 2} readOnly size="small" precision={0.5} />
                    )}
                </Box>
            </Box>
        </AppleCard>
    );
}
