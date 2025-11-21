'use client';

import { useState, useEffect } from 'react';
import { Box, Typography, Stack, Tabs, Tab, Grid, Chip } from '@mui/material';
import { AppleCard } from '@/components/ui';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

interface AnimeItem {
  id: number;
  name: string;
  name_cn?: string;
  images?: {
    large?: string;
    common?: string;
    medium?: string;
    small?: string;
  };
  rating?: {
    score?: number;
  };
  eps?: number;
  eps_count?: number;
  air_date?: string;
  air_weekday?: number;
}

interface CalendarDay {
  weekday: {
    en: string;
    cn: string;
    ja: string;
    id: number;
  };
  items: AnimeItem[];
}

interface AnimeTimelineProps {
  calendarData: CalendarDay[];
  onAnimeClick?: (anime: AnimeItem) => void;
}

const WEEKDAY_MAP = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

export default function AnimeTimeline({ calendarData, onAnimeClick }: AnimeTimelineProps) {
  const [activeDay, setActiveDay] = useState(0);

  // 默认选中今天
  useEffect(() => {
    const today = new Date().getDay();
    // 转换为周一=0的索引
    const dayIndex = today === 0 ? 6 : today - 1;
    setActiveDay(dayIndex);
  }, []);

  const handleDayChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveDay(newValue);
  };

  if (!calendarData || calendarData.length === 0) {
    return null;
  }

  const currentDayData = calendarData[activeDay];
  const animeList = currentDayData?.items || [];

  return (
    <Box sx={{ mb: 8 }}>
      {/* 标题 */}
      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
        <CalendarTodayIcon sx={{ fontSize: 32, color: 'primary.main' }} />
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          热门番剧
        </Typography>
        <Chip
          label="本周放送"
          size="small"
          color="primary"
          sx={{ ml: 1 }}
        />
      </Stack>

      {/* 周几选择器 */}
      <Box sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={activeDay}
          onChange={handleDayChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            '& .MuiTab-root': {
              minWidth: 80,
              fontWeight: 600,
              fontSize: '0.95rem',
            },
          }}
        >
          {calendarData.map((day, index) => (
            <Tab
              key={index}
              label={
                <Stack alignItems="center" spacing={0.5}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {WEEKDAY_MAP[index]}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {day.items.length}部
                  </Typography>
                </Stack>
              }
            />
          ))}
        </Tabs>
      </Box>

      {/* 番剧列表 */}
      <Grid container spacing={2}>
        {animeList.slice(0, 12).map((anime) => {
          const title = anime.name_cn || anime.name;
          const imageUrl = anime.images?.large || anime.images?.common || '/placeholder.svg';
          const score = anime.rating?.score;
          const episodeCount = anime.eps || anime.eps_count;

          return (
            <Grid key={anime.id} size={{ xs: 6, sm: 4, md: 3, lg: 2 }}>
              <AppleCard
                variant="elevated"
                hover
                onClick={() => onAnimeClick?.(anime)}
                sx={{
                  cursor: 'pointer',
                  height: '100%',
                  overflow: 'hidden',
                }}
              >
                <Box
                  sx={{
                    position: 'relative',
                    paddingTop: '140%',
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
                    }}
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder.svg';
                    }}
                  />
                  {score && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        bgcolor: 'rgba(0,0,0,0.8)',
                        color: 'white',
                        borderRadius: 1,
                        px: 1,
                        py: 0.5,
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        backdropFilter: 'blur(10px)',
                      }}
                    >
                      ⭐ {score.toFixed(1)}
                    </Box>
                  )}
                </Box>
                <Box sx={{ p: 1.5 }}>
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
                      mb: 0.5,
                    }}
                  >
                    {title}
                  </Typography>
                  {episodeCount && (
                    <Typography variant="caption" color="text.secondary">
                      共{episodeCount}话
                    </Typography>
                  )}
                </Box>
              </AppleCard>
            </Grid>
          );
        })}
      </Grid>

      {animeList.length === 0 && (
        <Box
          sx={{
            py: 8,
            textAlign: 'center',
            color: 'text.secondary',
          }}
        >
          <Typography variant="body1">本日暂无番剧更新</Typography>
        </Box>
      )}
    </Box>
  );
}
