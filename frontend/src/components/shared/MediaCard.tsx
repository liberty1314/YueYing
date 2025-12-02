/**
 * MediaCard - 统一的媒体卡片组件
 * 
 * 基于首页设计风格，适用于首页、搜索页和我的记录页
 * 使用 Apple 风格的分离式布局：图片卡片 + 信息区域
 */

'use client';

import { Box, Typography } from '@mui/material';
import { AppleCard } from '@/components/ui';

interface MediaCardProps {
    id: number | string;
    title: string;
    posterUrl?: string;
    year?: number | string;
    rating?: number;
    onClick?: () => void;
    className?: string;
}

export default function MediaCard({
    title,
    posterUrl,
    year,
    rating,
    onClick,
    className,
}: MediaCardProps) {
    const imageUrl = posterUrl || '/placeholder.svg';

    return (
        <Box
            onClick={onClick}
            className={className}
            sx={{
                cursor: 'pointer',
                '&:hover .image-card': {
                    transform: 'translateY(-8px)',
                },
                '&:hover img': {
                    transform: 'scale(1.08)',
                },
            }}
        >
            {/* 图片卡片 - 独立容器 */}
            <AppleCard
                variant="elevated"
                className="image-card"
                sx={{
                    overflow: 'hidden',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    borderRadius: 1.5,
                }}
            >
                <Box
                    sx={{
                        position: 'relative',
                        paddingTop: '150%',
                        overflow: 'hidden',
                        bgcolor: 'grey.100',
                    }}
                >
                    <Box
                        component="img"
                        src={imageUrl}
                        alt={title}
                        sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                        }}
                        onError={(e) => {
                            e.currentTarget.src = '/placeholder.svg';
                        }}
                    />
                </Box>
            </AppleCard>

            {/* 信息区域 - 独立容器，透明背景 */}
            <Box sx={{ mt: 1.5, px: 0.5 }}>
                <Typography
                    variant="body2"
                    sx={{
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        minHeight: '2.6em',
                        lineHeight: 1.3,
                        mb: 0.5,
                    }}
                >
                    {title}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ fontSize: '0.8rem' }}
                    >
                        {year || '未知'}
                    </Typography>
                    {rating && (
                        <Typography
                            variant="caption"
                            sx={{
                                color: '#fbbf24',
                                fontWeight: 600,
                                fontSize: '0.8rem',
                            }}
                        >
                            ⭐ {typeof rating === 'number' ? rating.toFixed(1) : rating}
                        </Typography>
                    )}
                </Box>
            </Box>
        </Box>
    );
}
