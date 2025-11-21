/**
 * 首页 - 智能中枢（Week 2 升级版）
 * 
 * 展示个性化推荐、统计概览、最近活动和AI洞察
 */

'use client';

import { useEffect, useState } from 'react';
import { MainLayout } from '@/components/layout';
import { PersonalizedHero } from '@/components/features/home/PersonalizedHero';
import { StatsOverview } from '@/components/features/home/StatsOverview';
import { RecentActivity } from '@/components/features/home/RecentActivity';
import { SmartRecommendations } from '@/components/features/home/SmartRecommendations';
import { AIInsightCard } from '@/components/features/home/AIInsightCard';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function HomePage() {
  const [loading, setLoading] = useState(true);
  const [statsData, setStatsData] = useState<any>(null);
  const [recentItems, setRecentItems] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [heroRecommendations, setHeroRecommendations] = useState<any[]>([]);
  const [insights, setInsights] = useState<any[]>([]);

  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    try {
      setLoading(true);
      
      // 并行调用多个API
      const [statsRes, recentRes, recsRes] = await Promise.allSettled([
        // 统计概览
        fetch(`${API_BASE_URL}/api/stats/overview`).then(r => r.ok ? r.json() : null),
        // 最近活动
        fetch(`${API_BASE_URL}/api/user-items?sort_by=updated_at&limit=10`).then(r => r.ok ? r.json() : null),
        // 个性化推荐
        fetch(`${API_BASE_URL}/api/recommendations/for-you?limit=8`).then(r => r.ok ? r.json() : null),
      ]);
      
      // 处理统计数据
      if (statsRes.status === 'fulfilled' && statsRes.value) {
        setStatsData(statsRes.value);
      }
      // 如果API失败，statsData保持为null，组件会显示空状态
      
      // 处理最近活动
      if (recentRes.status === 'fulfilled' && recentRes.value) {
        setRecentItems(recentRes.value.items || recentRes.value);
      }
      
      // 处理推荐数据
      if (recsRes.status === 'fulfilled' && recsRes.value) {
        const items = recsRes.value.items || recsRes.value;
        // 前4个用于轮播
        setHeroRecommendations(items.slice(0, 4));
        // 其余用于推荐卡片
        setRecommendations(items.slice(4));
      }

      // TODO: 调用AI洞察API
      // const insightsRes = await fetch(`${API_BASE_URL}/api/insights`);
      // setInsights(await insightsRes.json());
      
    } catch (error) {
      console.error('Failed to load home data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">加载中...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* 个性化推荐轮播 */}
        <PersonalizedHero items={heroRecommendations} />

        {/* 统计概览 */}
        <StatsOverview stats={statsData} />

        {/* AI洞察卡片 */}
        <AIInsightCard insights={insights} />

        {/* 智能推荐 */}
        <SmartRecommendations items={recommendations} />

        {/* 最近活动 */}
        <RecentActivity items={recentItems} />
      </div>
    </MainLayout>
  );
}
