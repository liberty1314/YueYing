/**
 * Recommendations Page - 智能推荐页面
 * 
 * Week 5: 推荐和搜索功能
 * 展示基于不同策略的个性化推荐
 */

'use client';

import { useEffect, useState } from 'react';
import { MainLayout } from '@/components/layout';
import { useRecommendationStore } from '@/stores/recommendationStore';
import { StrategySelector } from '@/components/features/recommendations/StrategySelector';
import { RecommendationSection } from '@/components/features/recommendations/RecommendationSection';
import { ExploreGrid } from '@/components/features/recommendations/ExploreGrid';
import { Button, Badge } from '@/components/ui';
import { RefreshCwIcon, CompassIcon, SparklesIcon } from 'lucide-react';
import ProtectedRoute from '@/components/shared/ProtectedRoute';

type TabType = 'for-you' | 'explore';

export default function RecommendationsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('for-you');
  
  const {
    strategy,
    recommendations,
    exploreItems,
    loading,
    error,
    setStrategy,
    refreshRecommendations,
    fetchExploreItems,
  } = useRecommendationStore();

  // 初始化加载推荐数据
  useEffect(() => {
    refreshRecommendations();
  }, [refreshRecommendations]);

  // 切换到探索模式时加载数据
  useEffect(() => {
    if (activeTab === 'explore' && exploreItems.length === 0) {
      fetchExploreItems();
    }
  }, [activeTab, exploreItems.length, fetchExploreItems]);

  const handleAddToLibrary = async (item: any) => {
    try {
      // TODO: 调用 API 添加到收藏
      console.log('Adding to library:', item);
    } catch (error) {
      console.error('Failed to add to library:', error);
    }
  };

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <SparklesIcon className="w-8 h-8 text-primary-500" />
                智能推荐
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                AI 驱动的个性化内容推荐
              </p>
            </div>
            
            {activeTab === 'for-you' && (
              <Button
                variant="outline"
                onClick={() => refreshRecommendations()}
                disabled={loading}
              >
                <RefreshCwIcon className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                刷新推荐
              </Button>
            )}
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab('for-you')}
              className={`
                px-4 py-3 font-medium text-sm transition-all duration-200 border-b-2
                ${
                  activeTab === 'for-you'
                    ? 'border-primary-500 text-primary-700 dark:text-primary-300'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }
              `}
            >
              <SparklesIcon className="w-4 h-4 inline mr-2" />
              为你推荐
              {recommendations.length > 0 && (
                <Badge variant="primary" size="sm" className="ml-2">
                  {recommendations.length}
                </Badge>
              )}
            </button>
            
            <button
              onClick={() => setActiveTab('explore')}
              className={`
                px-4 py-3 font-medium text-sm transition-all duration-200 border-b-2
                ${
                  activeTab === 'explore'
                    ? 'border-primary-500 text-primary-700 dark:text-primary-300'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }
              `}
            >
              <CompassIcon className="w-4 h-4 inline mr-2" />
              探索模式
              {exploreItems.length > 0 && (
                <Badge variant="outline" size="sm" className="ml-2">
                  {exploreItems.length}
                </Badge>
              )}
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <svg
                    className="w-5 h-5 text-red-600 dark:text-red-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                    加载失败
                  </h3>
                  <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Content */}
          {activeTab === 'for-you' ? (
            <div className="space-y-8">
              {/* Strategy Selector */}
              <StrategySelector
                currentStrategy={strategy}
                onStrategyChange={setStrategy}
                disabled={loading}
              />

              {/* Recommendations */}
              <RecommendationSection
                items={recommendations}
                onAddToLibrary={handleAddToLibrary}
                loading={loading}
              />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Explore Header */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  探索新内容
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  发现更多精彩内容，拓展你的视野
                </p>
              </div>

              {/* Explore Grid */}
              <ExploreGrid items={exploreItems} onAddToLibrary={handleAddToLibrary} />
            </div>
          )}
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}
