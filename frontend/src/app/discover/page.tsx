'use client';

import { useState, useEffect } from 'react';
import { Box, Typography, Tabs, Tab, CircularProgress } from '@mui/material';
import ProtectedRoute from '@/components/shared/ProtectedRoute';
import { AppleCard } from '@/components/ui';
import RecommendationList from '@/components/features/recommendations/RecommendationList';
import type { UserItem } from '@/types';

type RecommendationType = 'collaborative' | 'content_based' | 'hybrid';

export default function DiscoverPage() {
    const [recommendationType, setRecommendationType] =
        useState<RecommendationType>('hybrid');
    const [recommendations, setRecommendations] = useState<UserItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchRecommendations = async () => {
            try {
                setLoading(true);
                setError('');

                // TODO: 实际调用推荐 API
                // const response = await recommendationsApi.get(recommendationType);
                // setRecommendations(response);

                // 模拟数据
                await new Promise((resolve) => setTimeout(resolve, 500));
                setRecommendations([]);
            } catch (err: unknown) {
                setError(err instanceof Error ? err.message : '获取推荐失败');
            } finally {
                setLoading(false);
            }
        };

        fetchRecommendations();
    }, [recommendationType]);

    const handleTabChange = (event: React.SyntheticEvent, newValue: RecommendationType) => {
        setRecommendationType(newValue);
    };

    return (
        <ProtectedRoute>
            <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pt: 8 }}>
                {/* Header */}
                <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
                    <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 3 }}>
                        为你推荐
                    </Typography>

                    <Tabs
                        value={recommendationType}
                        onChange={handleTabChange}
                        sx={{
                            '& .MuiTab-root': {
                                textTransform: 'none',
                                fontWeight: 500,
                            },
                        }}
                    >
                        <Tab label="智能推荐" value="hybrid" />
                        <Tab label="协同过滤" value="collaborative" />
                        <Tab label="内容推荐" value="content_based" />
                    </Tabs>
                </Box>

                {/* Content */}
                <Box sx={{ p: 3 }}>
                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                            <CircularProgress />
                        </Box>
                    ) : error ? (
                        <AppleCard sx={{ p: 4, textAlign: 'center' }}>
                            <Typography color="error">{error}</Typography>
                        </AppleCard>
                    ) : recommendations.length === 0 ? (
                        <AppleCard sx={{ p: 4, textAlign: 'center' }}>
                            <Typography variant="h6" gutterBottom>
                                暂无推荐
                            </Typography>
                            <Typography color="text.secondary">
                                添加更多内容到你的收藏，我们将为你提供个性化推荐
                            </Typography>
                        </AppleCard>
                    ) : (
                        <RecommendationList recommendations={recommendations} />
                    )}
                </Box>
            </Box>
        </ProtectedRoute>
    );
}
