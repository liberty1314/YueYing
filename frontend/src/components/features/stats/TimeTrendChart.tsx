'use client';

import { Box, Typography } from '@mui/material';
import { AppleCard } from '@/components/ui';

interface TimeTrendData {
    date: string;
    count: number;
}

interface TimeTrendChartProps {
    data: TimeTrendData[];
}

export default function TimeTrendChart({ data }: TimeTrendChartProps) {
    const maxCount = Math.max(...data.map((item) => item.count), 1);

    if (data.length === 0) {
        return (
            <AppleCard sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                    时间趋势
                </Typography>
                <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography color="text.secondary">暂无数据</Typography>
                </Box>
            </AppleCard>
        );
    }

    return (
        <AppleCard sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                时间趋势
            </Typography>

            <Box sx={{ position: 'relative', height: 200 }}>
                {/* Y-axis labels */}
                <Box
                    sx={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        bottom: 20,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        pr: 2,
                    }}
                >
                    <Typography variant="caption" color="text.secondary">
                        {maxCount}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        {Math.floor(maxCount / 2)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        0
                    </Typography>
                </Box>

                {/* Chart area */}
                <Box
                    sx={{
                        ml: 4,
                        height: '100%',
                        display: 'flex',
                        alignItems: 'flex-end',
                        gap: 0.5,
                        pb: 3,
                    }}
                >
                    {data.map((item, index) => {
                        const height = (item.count / maxCount) * 100;

                        return (
                            <Box
                                key={index}
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
                                    }}
                                />

                                {/* Date label */}
                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{
                                        transform: 'rotate(-45deg)',
                                        transformOrigin: 'center',
                                        fontSize: '0.65rem',
                                    }}
                                >
                                    {new Date(item.date).toLocaleDateString('zh-CN', {
                                        month: 'short',
                                        day: 'numeric',
                                    })}
                                </Typography>
                            </Box>
                        );
                    })}
                </Box>
            </Box>
        </AppleCard>
    );
}
