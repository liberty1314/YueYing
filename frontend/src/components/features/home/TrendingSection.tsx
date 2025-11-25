'use client';

import { useState } from 'react';
import { Box, Typography, Stack, Tabs, Tab, Grid } from '@mui/material';
import { AppleCard } from '@/components/ui';
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
}

export default function TrendingSection({ dailyItems, weeklyItems, onItemClick }: TrendingSectionProps) {
  const [activeTab, setActiveTab] = useState(0);

  const currentItems = activeTab === 0 ? dailyItems : weeklyItems;

  if ((!dailyItems || dailyItems.length === 0) && (!weeklyItems || weeklyItems.length === 0)) {
    return null;
  }

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Box sx={{ mb: 8 }}>
      {/* 标题和切换 */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <TrendingUpIcon sx={{ fontSize: 32, color: 'primary.main' }} />
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            热门趋势
          </Typography>
        </Stack>

        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          sx={{
            minHeight: 40,
            '& .MuiTab-root': {
              minHeight: 40,
              py: 1,
              px: 3,
              fontWeight: 600,
            },
          }}
        >
          <Tab label="今日热门" />
          <Tab label="本周热门" />
        </Tabs>
      </Stack>

      {/* 内容网格 */}
      <Grid container spacing={2}>
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
                onClick={() => onItemClick?.(item)}
                sx={{
                  cursor: 'pointer',
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
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" color="text.secondary">
                      {year || '未知'}
                    </Typography>
                    {item.vote_average && (
                      <Typography variant="caption" sx={{ color: '#facc15', fontWeight: 600 }}>
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
    </Box>
  );
}
