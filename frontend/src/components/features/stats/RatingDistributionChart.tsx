'use client';

import { Box, Typography, Stack } from '@mui/material';
import { AppleCard } from '@/components/ui';

interface RatingDistributionData {
    rating: number;
    count: number;
}

interface RatingDistributionChartProps {
    data: RatingDistributionData[];
}

export default function RatingDistributionChart({ data }: RatingDistributionChartProps) {
    const maxCount = Math.max(...data.map((item) => item.count), 1);

    if (data.length === 0 || maxCount === 0) {
        return (
            <AppleCard sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                    评分分布
                </Typography>
                <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography color="text.secondary">暂无数据</Typography>
                </Box>
            </AppleCard>
        );
    }

    return (
        <AppleCard sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                评分分布
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1, height: 200 }}>
                {data.map((item) => {
                    const height = (item.count / maxCount) * 100;

                    return (
                        <Box
                            key={item.rating}
                            sx={{
                                flex: 1,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: 1,
                            }}
                        >
                            {/* Bar */}
                            <Box
                                sx={{
                                    width: '100%',
                                    height: `${height}%`,
                                    bgcolor: 'primary.main',
                                    borderRadius: '4px 4px 0 0',
                                    transition: 'height 0.3s ease',
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    justifyContent: 'center',
                                    pt: 1,
                                }}
                            >
                                {item.count > 0 && (
                                    <Typography variant="caption" sx={{ color: 'white', fontWeight: 600 }}>
                                        {item.count}
                                    </Typography>
                                )}
                            </Box>

                            {/* Label */}
                            <Typography variant="caption" color="text.secondary">
                                {item.rating}
                            </Typography>
                        </Box>
                    );
                })}
            </Box>
        </AppleCard>
    );
}
