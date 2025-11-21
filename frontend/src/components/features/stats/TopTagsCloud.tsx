'use client';

import { Box, Typography, Chip } from '@mui/material';
import { AppleCard } from '@/components/ui';

interface TopTagData {
    tag: string;
    count: number;
}

interface TopTagsCloudProps {
    data: TopTagData[];
}

export default function TopTagsCloud({ data }: TopTagsCloudProps) {
    if (data.length === 0) {
        return (
            <AppleCard sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                    热门标签
                </Typography>
                <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography color="text.secondary">暂无数据</Typography>
                </Box>
            </AppleCard>
        );
    }

    // 计算字体大小和颜色
    const maxCount = Math.max(...data.map((tag) => tag.count));
    const minSize = 0.875; // 14px
    const maxSize = 2; // 32px

    const getFontSize = (count: number) => {
        const ratio = (count - 1) / (maxCount - 1 || 1);
        return minSize + ratio * (maxSize - minSize);
    };

    const colors = ['#007AFF', '#34C759', '#FF9500', '#FF3B30', '#5856D6', '#AF52DE', '#FF2D55'];

    return (
        <AppleCard sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                热门标签
            </Typography>

            <Box
                sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 2,
                    alignItems: 'center',
                    justifyContent: 'center',
                    py: 2,
                }}
            >
                {data.map((tag, index) => {
                    const fontSize = getFontSize(tag.count);
                    const color = colors[index % colors.length];

                    return (
                        <Chip
                            key={tag.tag}
                            label={`${tag.tag} (${tag.count})`}
                            sx={{
                                fontSize: `${fontSize}rem`,
                                fontWeight: 500,
                                bgcolor: `${color}15`,
                                color: color,
                                border: `1px solid ${color}40`,
                                px: 1,
                                py: fontSize * 0.5,
                                height: 'auto',
                                '& .MuiChip-label': {
                                    px: 1,
                                },
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                    bgcolor: `${color}25`,
                                    transform: 'scale(1.05)',
                                },
                            }}
                        />
                    );
                })}
            </Box>
        </AppleCard>
    );
}
