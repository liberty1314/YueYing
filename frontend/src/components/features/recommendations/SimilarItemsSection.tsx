'use client';

import { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { AppleCard } from '@/components/ui';
import RecommendationList from './RecommendationList';
import type { UserItem } from '@/types';

interface SimilarItemsSectionProps {
    itemId: number;
    contentType: string;
}

export default function SimilarItemsSection({ itemId, contentType }: SimilarItemsSectionProps) {
    const [similarItems, setSimilarItems] = useState<UserItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchSimilarItems = async () => {
            try {
                setLoading(true);
                setError('');

                // TODO: 实际调用相似内容 API
                // const response = await recommendationsApi.getSimilar(itemId);
                // setSimilarItems(response);

                // 模拟数据
                await new Promise((resolve) => setTimeout(resolve, 500));
                setSimilarItems([]);
            } catch (err: unknown) {
                setError(err instanceof Error ? err.message : '获取相似内容失败');
            } finally {
                setLoading(false);
            }
        };

        fetchSimilarItems();
    }, [itemId]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <AppleCard sx={{ p: 3, textAlign: 'center' }}>
                <Typography color="error" variant="body2">
                    {error}
                </Typography>
            </AppleCard>
        );
    }

    if (similarItems.length === 0) {
        return (
            <AppleCard sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                    暂无相似内容推荐
                </Typography>
            </AppleCard>
        );
    }

    return (
        <Box>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                相似推荐
            </Typography>
            <RecommendationList recommendations={similarItems} />
        </Box>
    );
}
