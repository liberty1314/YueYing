'use client';

import { Box, Typography, Stack, IconButton } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { AppleCard } from '@/components/ui';
import { useRef } from 'react';

interface RecommendationItem {
  id: number;
  title?: string;
  name?: string;
  poster_path?: string;
  backdrop_path?: string;
  vote_average?: number;
  media_type?: string;
  reason?: string;
  score?: number;
}

interface AIRecommendationsProps {
  items: RecommendationItem[];
  onItemClick?: (item: RecommendationItem) => void;
}

export default function AIRecommendations({ items, onItemClick }: AIRecommendationsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <Box sx={{ mb: 8, position: 'relative' }}>
      {/* 标题 */}
      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
        <AutoAwesomeIcon sx={{ fontSize: 32, color: 'primary.main' }} />
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          AI 为你推荐
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
          基于你的观看习惯，智能推荐精彩内容
        </Typography>
      </Stack>

      {/* 横向滚动容器 */}
      <Box sx={{ position: 'relative' }}>
        {/* 左侧导航按钮 */}
        <IconButton
          onClick={() => scroll('left')}
          sx={{
            position: 'absolute',
            left: -20,
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 2,
            bgcolor: 'background.paper',
            boxShadow: 2,
            '&:hover': {
              bgcolor: 'background.paper',
              boxShadow: 4,
            },
            display: { xs: 'none', md: 'flex' },
          }}
        >
          <ChevronLeftIcon />
        </IconButton>

        {/* 卡片列表 */}
        <Box
          ref={scrollRef}
          sx={{
            display: 'flex',
            gap: 2,
            overflowX: 'auto',
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': {
              display: 'none',
            },
            pb: 1,
          }}
        >
          {items.map((item) => {
            const title = item.title || item.name || '未知标题';
            const imageUrl = item.poster_path
              ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
              : item.backdrop_path
                ? `https://image.tmdb.org/t/p/w500${item.backdrop_path}`
                : '/placeholder.svg';
            const reason = item.reason || `推荐分数: ${((item.score || 0) * 100).toFixed(0)}%`;

            return (
              <Box
                key={item.id}
                onClick={() => onItemClick?.(item)}
                sx={{
                  minWidth: 250,
                  maxWidth: 250,
                  cursor: 'pointer',
                  flexShrink: 0,
                  '&:hover .image-card': {
                    boxShadow: 6,
                    transform: 'translateY(-4px)',
                  },
                  '&:hover img': {
                    transform: 'scale(1.05)',
                  },
                }}
              >
                {/* 图片卡片 - 独立容器 */}
                <AppleCard
                  variant="elevated"
                  className="image-card"
                  sx={{
                    overflow: 'hidden',
                    transition: 'all 0.3s ease',
                  }}
                >
                  <Box
                    sx={{
                      position: 'relative',
                      paddingTop: '150%',
                      overflow: 'hidden',
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
                        transition: 'transform 0.3s ease',
                      }}
                    />
                  </Box>
                </AppleCard>

                {/* 信息区域 - 独立容器，透明背景 */}
                <Box sx={{ mt: 1, px: 0.5 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      minHeight: '2.4em',
                      lineHeight: 1.2,
                      mb: 0.25,
                    }}
                  >
                    {title}
                  </Typography>

                  {/* 评分 */}
                  {item.vote_average && (
                    <Typography variant="caption" sx={{ color: '#facc15', fontWeight: 600, display: 'block', mb: 0.25 }}>
                      ⭐ {item.vote_average.toFixed(1)}
                    </Typography>
                  )}

                  {/* AI推荐理由 */}
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 0.5,
                      bgcolor: (theme) =>
                        theme.palette.mode === 'dark'
                          ? 'rgba(138, 43, 226, 0.1)'
                          : 'rgba(138, 43, 226, 0.05)',
                      p: 0.75,
                      borderRadius: 1,
                      borderLeft: 2,
                      borderColor: 'primary.main',
                    }}
                  >
                    <AutoAwesomeIcon sx={{ fontSize: 14, color: 'primary.main', mt: 0.1 }} />
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        lineHeight: 1.3,
                        fontSize: '0.7rem',
                      }}
                    >
                      {reason}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            );
          })}
        </Box>

        {/* 右侧导航按钮 */}
        <IconButton
          onClick={() => scroll('right')}
          sx={{
            position: 'absolute',
            right: -20,
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 2,
            bgcolor: 'background.paper',
            boxShadow: 2,
            '&:hover': {
              bgcolor: 'background.paper',
              boxShadow: 4,
            },
            display: { xs: 'none', md: 'flex' },
          }}
        >
          <ChevronRightIcon />
        </IconButton>
      </Box>
    </Box>
  );
}
