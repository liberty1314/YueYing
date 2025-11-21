'use client';

import { Box, Typography, Stack } from '@mui/material';
import { AppleCard } from '@/components/ui';
import { typeLabels } from '@/lib/adapters/userItemAdapter';

interface TypeDistributionData {
    type: string;
    count: number;
}

interface TypeDistributionChartProps {
    data: TypeDistributionData[];
}

const colors = ['#007AFF', '#34C759', '#FF9500', '#FF3B30', '#5856D6'];

export default function TypeDistributionChart({ data }: TypeDistributionChartProps) {
    const total = data.reduce((sum, item) => sum + item.count, 0);

    if (total === 0) {
        return (
            <AppleCard sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                    类型分布
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
                类型分布
            </Typography>

            <Stack spacing={2}>
                {data.map((item, index) => {
                    const percentage = ((item.count / total) * 100).toFixed(1);
                    const color = colors[index % colors.length];

                    return (
                        <Box key={item.type}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                    {typeLabels[item.type] || item.type}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {item.count} ({percentage}%)
                                </Typography>
                            </Box>
                            <Box
                                sx={{
                                    height: 8,
                                    bgcolor: 'grey.200',
                                    borderRadius: 1,
                                    overflow: 'hidden',
                                }}
                            >
                                <Box
                                    sx={{
                                        height: '100%',
                                        width: `${percentage}%`,
                                        bgcolor: color,
                                        transition: 'width 0.3s ease',
                                    }}
                                />
                            </Box>
                        </Box>
                    );
                })}
            </Stack>
        </AppleCard>
    );
}
