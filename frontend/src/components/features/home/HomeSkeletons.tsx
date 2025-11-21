/**
 * 首页骨架屏组件
 * 在数据加载期间显示占位符
 */

'use client';

import { Box, Grid, Stack, Skeleton as MuiSkeleton } from '@mui/material';

/**
 * 英雄轮播图骨架屏
 */
export function HeroCarouselSkeleton() {
  return (
    <MuiSkeleton
      variant="rectangular"
      sx={{
        width: '100%',
        height: { xs: '60vh', md: '70vh' },
        borderRadius: { xs: 0, md: 4 },
        mb: 6,
      }}
    />
  );
}

/**
 * AI推荐区块骨架屏
 */
export function AIRecommendationsSkeleton() {
  return (
    <Box sx={{ mb: 8 }}>
      {/* 标题 */}
      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
        <MuiSkeleton variant="circular" width={32} height={32} />
        <MuiSkeleton variant="text" width={200} height={32} />
      </Stack>

      {/* 卡片列表 */}
      <Box sx={{ display: 'flex', gap: 2, overflowX: 'hidden' }}>
        {Array.from({ length: 6 }).map((_, index) => (
          <Box key={index} sx={{ minWidth: 250, maxWidth: 250, flexShrink: 0 }}>
            <MuiSkeleton variant="rectangular" height={375} sx={{ borderRadius: 2, mb: 2 }} />
            <MuiSkeleton variant="text" width="80%" sx={{ mb: 1 }} />
            <MuiSkeleton variant="rectangular" height={60} sx={{ borderRadius: 1 }} />
          </Box>
        ))}
      </Box>
    </Box>
  );
}

/**
 * 热门趋势骨架屏
 */
export function TrendingSectionSkeleton() {
  return (
    <Box sx={{ mb: 8 }}>
      {/* 标题和切换 */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <MuiSkeleton variant="circular" width={32} height={32} />
          <MuiSkeleton variant="text" width={150} height={32} />
        </Stack>
        <MuiSkeleton variant="rectangular" width={200} height={40} sx={{ borderRadius: 20 }} />
      </Stack>

      {/* 内容网格 */}
      <Grid container spacing={2}>
        {Array.from({ length: 12 }).map((_, index) => (
          <Grid key={index} size={{ xs: 6, sm: 4, md: 3, lg: 2 }}>
            <MuiSkeleton
              variant="rectangular"
              sx={{
                width: '100%',
                paddingTop: '150%',
                borderRadius: 2,
              }}
            />
            <Box sx={{ p: 1.5 }}>
              <MuiSkeleton variant="text" width="100%" />
              <MuiSkeleton variant="text" width="40%" />
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

/**
 * 番剧日历骨架屏
 */
export function AnimeTimelineSkeleton() {
  return (
    <Box sx={{ mb: 8 }}>
      {/* 标题 */}
      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
        <MuiSkeleton variant="circular" width={32} height={32} />
        <MuiSkeleton variant="text" width={150} height={32} />
        <MuiSkeleton variant="text" width={80} height={24} />
      </Stack>

      {/* 周几选择器 */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" spacing={2}>
          {Array.from({ length: 7 }).map((_, index) => (
            <MuiSkeleton key={index} variant="rectangular" width={80} height={60} />
          ))}
        </Stack>
      </Box>

      {/* 番剧列表 */}
      <Grid container spacing={2}>
        {Array.from({ length: 12 }).map((_, index) => (
          <Grid key={index} size={{ xs: 6, sm: 4, md: 3, lg: 2 }}>
            <MuiSkeleton
              variant="rectangular"
              sx={{
                width: '100%',
                paddingTop: '140%',
                borderRadius: 2,
              }}
            />
            <Box sx={{ p: 1.5 }}>
              <MuiSkeleton variant="text" width="100%" />
              <MuiSkeleton variant="text" width="40%" />
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

/**
 * 分类推荐骨架屏
 */
export function CategoryRecommendationsSkeleton() {
  const renderSection = () => (
    <Box sx={{ mb: 8 }}>
      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
        <MuiSkeleton variant="circular" width={32} height={32} />
        <MuiSkeleton variant="text" width={180} height={32} />
      </Stack>
      <Grid container spacing={2}>
        {Array.from({ length: 12 }).map((_, index) => (
          <Grid key={index} size={{ xs: 6, sm: 4, md: 3, lg: 2 }}>
            <MuiSkeleton
              variant="rectangular"
              sx={{
                width: '100%',
                paddingTop: '150%',
                borderRadius: 2,
              }}
            />
            <Box sx={{ p: 1.5 }}>
              <MuiSkeleton variant="text" width="100%" />
              <MuiSkeleton variant="text" width="40%" />
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  return (
    <>
      {renderSection()}
      {renderSection()}
    </>
  );
}
