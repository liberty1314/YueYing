'use client';

import { useState } from 'react';
import { Box, Typography, Stack, Grid, Fade } from '@mui/material';
import { AppleTabSwitch } from '@/components/ui';
import MediaCard from '@/components/shared/MediaCard';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { normalizeMediaData } from '@/utils/mediaDataMapper';

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
            const normalized = normalizeMediaData(item);
            return (
              <Grid key={item.id} size={{ xs: 6, sm: 4, md: 3, lg: 2 }}>
                <MediaCard
                  id={normalized.id}
                  title={normalized.title}
                  posterUrl={normalized.poster_url}
                  year={normalized.year}
                  rating={normalized.rating}
                  onClick={() => handleItemClick(item)}
                />
              </Grid>
            );
          })}
        </Grid>
      </Fade>
    </Box>
  );
}
