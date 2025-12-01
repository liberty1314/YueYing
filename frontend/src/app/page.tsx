/**
 * 首页 - 重新设计版
 * 
 * 展示今日热门、AI推荐、热门趋势、番剧日历和分类推荐
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout';
import {
  HeroCarousel,
  AIRecommendations,
  TrendingSection,
  AnimeTimeline,
  CategoryRecommendations,
  HeroCarouselSkeleton,
  AIRecommendationsSkeleton,
  TrendingSectionSkeleton,
  AnimeTimelineSkeleton,
  CategoryRecommendationsSkeleton,
} from '@/components/features/home';
import { ErrorDisplay } from '@/components/ui';
import ExternalContentDialog from '@/components/features/detail/ExternalContentDialog';
import AddToLibraryDialog from '@/components/features/library/AddToLibraryDialog';
import { api, CachePresets } from '@/lib/apiClient';
import { Box, Snackbar, Alert } from '@mui/material';

export default function HomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 轮播图数据（今日热门前5条）
  const [heroItems, setHeroItems] = useState<any[]>([]);

  // AI推荐数据
  const [recommendations, setRecommendations] = useState<any[]>([]);

  // 热门趋势数据
  const [trendingToday, setTrendingToday] = useState<any[]>([]);
  const [trendingWeek, setTrendingWeek] = useState<any[]>([]);

  // 番剧日历数据
  const [animeCalendar, setAnimeCalendar] = useState<any[]>([]);

  // 分类推荐数据
  const [popularMovies, setPopularMovies] = useState<any[]>([]);
  const [popularTvShows, setPopularTvShows] = useState<any[]>([]);

  // Toast提示
  const [toast, setToast] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({
    open: false,
    message: '',
    severity: 'info',
  });

  // 详情弹窗
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedContent, setSelectedContent] = useState<any>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0); // 用于触发详情对话框刷新状态
  const [forceAdded, setForceAdded] = useState(false); // 强制设置为已添加状态

  // 添加到收藏库弹窗
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [contentToAdd, setContentToAdd] = useState<any>(null);

  useEffect(() => {
    loadHomeData();
  }, []);

  // 处理打开详情
  const handleOpenDetail = (item: any) => {
    setSelectedContent(item);
    setDetailDialogOpen(true);
    setForceAdded(false); // 重置强制添加状态
  };

  // 处理关闭详情
  const handleCloseDetail = () => {
    setDetailDialogOpen(false);
    setSelectedContent(null);
  };

  // 处理添加到库
  const handleAddToLibrary = (item: any) => {
    setContentToAdd(item);
    setAddDialogOpen(true);
  };

  // 添加成功后的回调
  const handleAddSuccess = () => {
    setToast({
      open: true,
      message: '添加成功！',
      severity: 'success',
    });
    // 关闭添加对话框
    setAddDialogOpen(false);
    // 直接设置为已添加状态，不依赖后端检查
    setForceAdded(true);
  };

  // 处理关闭Toast
  const handleCloseToast = () => {
    setToast({ ...toast, open: false });
  };

  const loadHomeData = async () => {
    try {
      setLoading(true);
      setError(null);

      // 并行调用多个API（使用公开接口，无需认证）
      const [
        trendingTodayRes,
        trendingWeekRes,
        moviesRes,
        tvShowsRes,
        animeRes,
        recsRes,
      ] = await Promise.allSettled([
        // 今日热门（用于轮播图）
        api.get('/tmdb/trending/all/day?page=1', false, CachePresets.MEDIUM),
        // 本周热门
        api.get('/tmdb/trending/all/week?page=1', false, CachePresets.MEDIUM),
        // 热门电影
        api.get('/tmdb/movies/popular?page=1', false, CachePresets.MEDIUM),
        // 热门剧集
        api.get('/tmdb/tv/popular?page=1', false, CachePresets.MEDIUM),
        // 番剧日历
        api.get('/bangumi/calendar', false, CachePresets.LONG),
        // AI推荐（需要认证，失败则跳过）
        api.get('/recommendations/for-you?limit=12', true, CachePresets.SHORT),
      ]);

      // 处理今日热门（用于轮播图）
      if (trendingTodayRes.status === 'fulfilled' && trendingTodayRes.value) {
        const data = trendingTodayRes.value as any;
        const results = data.results || [];
        setHeroItems(results.slice(0, 5));
        setTrendingToday(results);
      }

      // 处理本周热门
      if (trendingWeekRes.status === 'fulfilled' && trendingWeekRes.value) {
        const data = trendingWeekRes.value as any;
        setTrendingWeek(data.results || []);
      }

      // 处理热门电影
      if (moviesRes.status === 'fulfilled' && moviesRes.value) {
        const data = moviesRes.value as any;
        setPopularMovies(data.results || []);
      }

      // 处理热门剧集
      if (tvShowsRes.status === 'fulfilled' && tvShowsRes.value) {
        const data = tvShowsRes.value as any;
        setPopularTvShows(data.results || []);
      }

      // 处理番剧日历
      if (animeRes.status === 'fulfilled' && animeRes.value) {
        setAnimeCalendar(animeRes.value as any);
      }

      // 处理AI推荐（可能失败）
      if (recsRes.status === 'fulfilled' && recsRes.value) {
        const data = recsRes.value as any;
        const items = data.recommendations || data.items || [];
        setRecommendations(items);
      }

    } catch (error) {
      console.error('Failed to load home data:', error);
      setError('加载首页数据失败，请刷新重试');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <Box sx={{ width: '100%' }}>
          <HeroCarouselSkeleton />
          <AIRecommendationsSkeleton />
          <TrendingSectionSkeleton />
          <AnimeTimelineSkeleton />
          <CategoryRecommendationsSkeleton />
        </Box>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <ErrorDisplay
          error={error}
          onRetry={loadHomeData}
          onGoHome={() => router.push('/')}
        />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Box sx={{ width: '100%' }}>
        {/* 英雄轮播图 - 今日热门前5条 */}
        <HeroCarousel
          items={heroItems}
          onViewDetail={handleOpenDetail}
          onAddToLibrary={handleAddToLibrary}
        />

        {/* AI为你推荐 - 仅当存在推荐内容时显示 */}
        {recommendations.length > 0 && (
          <AIRecommendations
            items={recommendations}
            onItemClick={handleOpenDetail}
          />
        )}

        {/* 本周热门趋势 - 双栏切换：今日热门/本周热门 */}
        <TrendingSection
          dailyItems={trendingToday}
          weeklyItems={trendingWeek}
          onItemClick={handleOpenDetail}
        />

        {/* 番剧日历 - 仅当存在Bangumi数据时显示 */}
        {animeCalendar.length > 0 && (
          <AnimeTimeline
            calendarData={animeCalendar}
            onAnimeClick={(anime) => handleOpenDetail({ ...anime, media_type: 'anime' })}
          />
        )}

        {/* 分类推荐 - 热门电影和热门剧集 */}
        <CategoryRecommendations
          movies={popularMovies}
          tvShows={popularTvShows}
          onMovieClick={(movie) => handleOpenDetail({ ...movie, media_type: 'movie' })}
          onTvShowClick={(tvShow) => handleOpenDetail({ ...tvShow, media_type: 'tv' })}
        />
      </Box>

      {/* 详情弹窗 */}
      <ExternalContentDialog
        open={detailDialogOpen}
        content={selectedContent}
        onClose={handleCloseDetail}
        onAddToLibrary={handleAddToLibrary}
        refreshTrigger={refreshTrigger}
        forceAdded={forceAdded}
      />

      {/* 添加到收藏库弹窗 */}
      <AddToLibraryDialog
        open={addDialogOpen}
        content={contentToAdd}
        onClose={() => setAddDialogOpen(false)}
        onSuccess={handleAddSuccess}
      />

      {/* Toast提示 */}
      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={handleCloseToast}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseToast} severity={toast.severity} sx={{ width: '100%' }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </MainLayout>
  );
}
