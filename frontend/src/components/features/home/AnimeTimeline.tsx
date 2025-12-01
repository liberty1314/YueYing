'use client';

import { useState, useEffect } from 'react';
import { Box, Typography, Stack, Grid, Chip, IconButton, Fade } from '@mui/material';
import { AppleCard, AppleTabSwitch } from '@/components/ui';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

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
const ITEMS_PER_PAGE = 12;

/**
 * 提取年份的辅助函数
 * 处理各种可能的日期格式
 */
function extractYear(dateStr?: string): string {
  if (!dateStr) return '未知';

  // 转换为字符串（防止是数字类型）
  const str = String(dateStr).trim();

  // 如果是日期字符串（如 "2025-01-01" 或 "2025-10-06"），直接提取前4位
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    return str.substring(0, 4);
  }

  // 如果是纯4位数字字符串（如 "2025"）
  if (/^\d{4}$/.test(str)) {
    return str;
  }

  // 尝试从字符串中提取4位年份（匹配1900-2099）
  const match = str.match(/\b(19\d{2}|20\d{2})\b/);
  if (match) {
    return match[1];
  }

  // 如果是日期字符串，尝试解析
  try {
    const year = new Date(str).getFullYear();
    // 检查年份是否有效
    if (!isNaN(year) && year >= 1900 && year <= 2099) {
      return year.toString();
    }
  } catch (e) {
    // 解析失败，继续
  }

  return '未知';
}

export default function AnimeTimeline({ calendarData, onAnimeClick }: AnimeTimelineProps) {
  const [activeDay, setActiveDay] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  // 默认选中今天
  useEffect(() => {
    const today = new Date().getDay();
    // 转换为周一=0的索引
    const dayIndex = today === 0 ? 6 : today - 1;
    setActiveDay(dayIndex);
  }, []);

  const handleDayChange = (value: string | number) => {
    setActiveDay(value as number);
    setCurrentPage(1); // 切换日期时重置到第一页
  };

  if (!calendarData || calendarData.length === 0) {
    return null;
  }

  const currentDayData = calendarData[activeDay];
  const animeList = currentDayData?.items || [];

  // 构建周几选项（不显示数量）
  const weekdayOptions = calendarData.map((day, index) => ({
    id: index,
    label: WEEKDAY_MAP[index],
  }));

  // 计算分页
  const totalPages = Math.ceil(animeList.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedAnimeList = animeList.slice(startIndex, endIndex);

  // 分页处理函数
  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  };

  return (
    <Box sx={{ mb: { xs: 10, md: 14 }, px: { xs: 2, md: 4 } }}>
      {/* 标题 */}
      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 4 }}>
        <CalendarTodayIcon sx={{ fontSize: { xs: 28, md: 32 }, color: 'primary.main' }} />
        <Typography
          variant="h3"
          sx={{
            fontWeight: 700,
            fontSize: { xs: '1.75rem', md: '2.25rem' },
            letterSpacing: '-0.02em',
          }}
        >
          热门番剧
        </Typography>
        <Chip
          label="本周放送"
          size="small"
          color="primary"
          sx={{
            ml: 1,
            fontWeight: 600,
          }}
        />
      </Stack>

      {/* 周几选择器和分页控制器 */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 4, flexWrap: 'wrap', gap: 2 }}
      >
        <AppleTabSwitch
          options={weekdayOptions}
          value={activeDay}
          onChange={handleDayChange}
          size="small"
        />

        {/* 分页控制器 */}
        {totalPages > 1 && (
          <Stack direction="row" alignItems="center" spacing={1} sx={{ ml: 2 }}>
            <IconButton
              size="small"
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              sx={{
                bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
                backdropFilter: 'blur(20px)',
                border: (theme) => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
                width: 36,
                height: 36,
                '&:hover': {
                  bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)',
                  transform: 'scale(1.05)',
                },
                '&.Mui-disabled': {
                  bgcolor: 'action.disabledBackground',
                  opacity: 0.5,
                },
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              <ChevronLeftIcon fontSize="small" />
            </IconButton>
            <Typography variant="body2" sx={{ minWidth: 60, textAlign: 'center', fontWeight: 600 }}>
              {currentPage} / {totalPages}
            </Typography>
            <IconButton
              size="small"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              sx={{
                bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
                backdropFilter: 'blur(20px)',
                border: (theme) => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
                width: 36,
                height: 36,
                '&:hover': {
                  bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)',
                  transform: 'scale(1.05)',
                },
                '&.Mui-disabled': {
                  bgcolor: 'action.disabledBackground',
                  opacity: 0.5,
                },
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              <ChevronRightIcon fontSize="small" />
            </IconButton>
          </Stack>
        )}
      </Stack>

      {/* 番剧列表 - 带淡入动画 */}
      <Fade in={true} timeout={400} key={`${activeDay}-${currentPage}`}>
        <Grid container spacing={{ xs: 2, md: 3 }}>
          {paginatedAnimeList.map((anime) => {
            const title = anime.name_cn || anime.name;
            const imageUrl = anime.images?.large || anime.images?.common || '/placeholder.svg';
            const score = anime.rating?.score;
            const year = extractYear(anime.air_date);

            return (
              <Grid key={anime.id} size={{ xs: 6, sm: 4, md: 3, lg: 2 }}>
                {/* 分离式布局：图片卡片和信息区域 */}
                <Box
                  onClick={() => onAnimeClick?.(anime)}
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
                        {year}
                      </Typography>
                      {score && (
                        <Typography
                          variant="caption"
                          sx={{
                            color: '#fbbf24',
                            fontWeight: 600,
                            fontSize: '0.8rem',
                          }}
                        >
                          ⭐ {score.toFixed(1)}
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
