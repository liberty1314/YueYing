'use client';

import { Grid, Box, Typography } from '@mui/material';
import { AppleCard } from '@/components/ui';
import CollectionsIcon from '@mui/icons-material/Collections';
import StarIcon from '@mui/icons-material/Star';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import BookmarkIcon from '@mui/icons-material/Bookmark';

interface OverviewData {
    total: number;
    averageRating: number;
    totalWatched: number;
    totalWatching: number;
    totalWantToWatch: number;
}

interface OverviewCardsProps {
    data: OverviewData;
}

const cards = [
    {
        title: '总收藏',
        key: 'total' as keyof OverviewData,
        icon: CollectionsIcon,
        color: '#007AFF',
    },
    {
        title: '平均评分',
        key: 'averageRating' as keyof OverviewData,
        icon: StarIcon,
        color: '#FF9500',
        suffix: ' / 10',
    },
    {
        title: '已完成',
        key: 'totalWatched' as keyof OverviewData,
        icon: CheckCircleIcon,
        color: '#34C759',
    },
    {
        title: '进行中',
        key: 'totalWatching' as keyof OverviewData,
        icon: PlayCircleIcon,
        color: '#5856D6',
    },
    {
        title: '想看/想玩',
        key: 'totalWantToWatch' as keyof OverviewData,
        icon: BookmarkIcon,
        color: '#FF3B30',
    },
];

export default function OverviewCards({ data }: OverviewCardsProps) {
    return (
        <Grid container spacing={3}>
            {cards.map((card) => {
                const Icon = card.icon;
                const value = data[card.key];
                const displayValue =
                    card.key === 'averageRating' ? value.toFixed(1) : value.toString();

                return (
                    <Grid size={{ xs: 12, sm: 6, md: 2.4 }} key={card.key}>
                        <AppleCard
                            sx={{
                                p: 3,
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                position: 'relative',
                                overflow: 'hidden',
                            }}
                        >
                            {/* Background Icon */}
                            <Box
                                sx={{
                                    position: 'absolute',
                                    top: -10,
                                    right: -10,
                                    opacity: 0.1,
                                }}
                            >
                                <Icon sx={{ fontSize: 100, color: card.color }} />
                            </Box>

                            {/* Content */}
                            <Box sx={{ position: 'relative', zIndex: 1 }}>
                                <Icon sx={{ fontSize: 32, color: card.color, mb: 1 }} />
                                <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                                    {displayValue}
                                    {card.suffix}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {card.title}
                                </Typography>
                            </Box>
                        </AppleCard>
                    </Grid>
                );
            })}
        </Grid>
    );
}
