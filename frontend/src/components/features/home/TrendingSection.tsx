'use client';

import { useState } from 'react';
import { Box, Typography, Stack, Grid, Fade } from '@mui/material';
import { AppleCard, AppleTabSwitch } from '@/components/ui';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

interface TrendingItem {
  id: number;
  title?: string;
  name?: string;
  poster_path?: string;
  vote_average?: number;
  media_type?: string;
  release_date?: string;
  first_air_date?: string;
}

interface TrendingSectionProps {
  dailyItems: TrendingItem[];
  weeklyItems: TrendingItem[];
  onItemClick?: (item: TrendingItem) => void;
  onAddToLibrary?: (item: TrendingItem) => void;
}

export default function TrendingSection({ dailyItems, weeklyItems, onItemClick, onAddToLibrary }: TrendingSectionProps) {
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly'>('daily');

  const currentItems = activeTab === 'daily' ? dailyItems : weeklyItems;

  const handleItemClick = (item: TrendingItem) => {
    onItemClick?.(item);
  };

  if ((!dailyItems || dailyItems.length === 0) && (!weeklyItems || weeklyItems.length === 0)) {
    return null;
  }

  const tabOptions = [
    { id: 'daily', label: '今日热门' },
    { id: 'weekly', label: '本周热门' },
  ];

  return (
    <Box sx={{ mb: { xs: 10, md: 14 }, px: { xs: 2, md: 4 } }}>
      {/* 标题和切换 */}
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        alignItems={{ xs: 'flex-start', md: 'center' }}
        justifyContent="space-between"
        spacing={{ xs: 2, md: 0 }}
        sx={{ mb: 4 }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <TrendingUpIcon sx={{ fontSize: { xs: 28, md: 32 }, color: 'primary.main' }} />
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              fontSize: { xs: '1.75rem', md: '2.25rem' },
              letterSpacing: '-0.02em',
            }}
          >
            热门趋势
          </Typography>
        </Stack>

        <AppleTabSwitch
          options={tabOptions}
          value={activeTab}
          onChange={(value) => setActiveTab(value as 'daily' | 'weekly')}
          size="medium"
        />
      </Stack>

      {/* 内容网格 - 带淡入动画 */}
      <Fade in={true} timeout={400} key={activeTab}>
        <Grid container spacing={{ xs: 2, md: 3 }}>
          {currentItems.slice(0, 12).map((item) => {
            const title = item.title || item.name || '未知标题';
            const imageUrl = item.poster_path
              ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
              : '/placeholder.svg';
            const releaseDate = item.release_date || item.first_air_date;
            const year = releaseDate ? new Date(releaseDate).getFullYear() : '';

            return (
              <Grid key={item.id} size={{ xs: 6, sm: 4, md: 3, lg: 2 }}>
                {/* 分离式布局：图片卡片和信息区域 */}
                <Box
                  onClick={() => handleItemClick(item)}
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
                      {item.vote_average && (
                        <Typography
                          variant="caption"
                          sx={{
                            color: '#fbbf24',
                            fontWeight: 600,
                            fontSize: '0.8rem',
                          }}
                        >
                          ⭐ {item.vote_average.toFixed(1)}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Box>
              </Grid>
            );
          })}
        </Grid>
      </Fade>
    </Box>
  );
}
