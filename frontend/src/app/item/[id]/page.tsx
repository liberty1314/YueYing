/**
 * Item Detail Page - 详情页
 * 
 * Week 5: 详情页AI功能增强
 * 展示内容详细信息，包含AI摘要和标签生成
 */

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout';
import { DetailHero } from '@/components/features/detail/DetailHero';
import { AISummaryPanel } from '@/components/features/detail/AISummaryPanel';
import { AITagsPanel } from '@/components/features/detail/AITagsPanel';
import { Button, Badge, Card } from '@/components/ui';
import { PlusIcon, CheckIcon, EditIcon, TrashIcon, ArrowLeftIcon } from 'lucide-react';
import ProtectedRoute from '@/components/shared/ProtectedRoute';
import { api, APIError } from '@/lib/apiClient';

interface ItemDetail {
  id: number;
  title: string;
  original_title?: string;
  content_type: 'movie' | 'tv' | 'anime' | 'book' | 'game';
  poster_url?: string;
  backdrop_url?: string;
  overview?: string;
  year?: number;
  rating?: number;
  genres?: string[];
  runtime?: number;
  director?: string;
  cast?: string[];
  tags?: string[];
  status?: 'want_to_watch' | 'watching' | 'watched';
  user_rating?: number;
  notes?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export default function ItemDetailPage() {
  const params = useParams();
  const router = useRouter();
  const itemId = params.id as string;

  const [item, setItem] = useState<ItemDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [inLibrary, setInLibrary] = useState(false);

  useEffect(() => {
    if (itemId) {
      fetchItemDetail();
    }
  }, [itemId]);

  const fetchItemDetail = async () => {
    setLoading(true);
    try {
      // 尝试从用户收藏库获取
      const libraryResponse = await fetch(`${API_BASE_URL}/user-items/${itemId}`);
      if (libraryResponse.ok) {
        const data = await libraryResponse.json();
        setItem(data);
        setInLibrary(true);
      } else {
        // 如果不在收藏库，从外部源获取
        // TODO: 根据来源参数调用不同API
        const externalResponse = await fetch(`${API_BASE_URL}/items/${itemId}`);
        if (externalResponse.ok) {
          const data = await externalResponse.json();
          setItem(data);
          setInLibrary(false);
        }
      }
    } catch (error) {
      console.error('Failed to fetch item detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToLibrary = async () => {
    try {
      await api.post('/user-items', {
        ...item,
        status: 'want_to_watch',
      });

      setInLibrary(true);
      fetchItemDetail(); // 刷新数据
    } catch (error) {
      if (error instanceof APIError) {
        console.error('Failed to add to library:', error.detail);
      }
    }
  };

  const handleUpdateTags = async (tags: string[]) => {
    if (!item) return;

    try {
      await api.put(`/user-items/${item.id}`, { tags });
      setItem({ ...item, tags });
    } catch (error) {
      if (error instanceof APIError) {
        console.error('Failed to update tags:', error.detail);
      }
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <MainLayout>
          <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
          </div>
        </MainLayout>
      </ProtectedRoute>
    );
  }

  if (!item) {
    return (
      <ProtectedRoute>
        <MainLayout>
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              未找到该内容
            </h2>
            <Button onClick={() => router.back()}>
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              返回
            </Button>
          </div>
        </MainLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="space-y-8">
          {/* Hero Section */}
          <DetailHero
            title={item.title}
            originalTitle={item.original_title}
            posterUrl={item.poster_url}
            backdropUrl={item.backdrop_url}
            year={item.year}
            rating={item.rating}
            contentType={item.content_type}
            genres={item.genres}
            runtime={item.runtime}
          />

          {/* Content */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Back Button & Actions */}
            <div className="flex items-center justify-between mb-6">
              <Button variant="ghost" onClick={() => router.back()}>
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                返回
              </Button>

              <div className="flex items-center gap-3">
                {inLibrary ? (
                  <>
                    <Badge variant="primary" size="lg">
                      <CheckIcon className="w-4 h-4 mr-1" />
                      已在收藏库
                    </Badge>
                    <Button variant="outline" size="sm">
                      <EditIcon className="w-4 h-4 mr-2" />
                      编辑
                    </Button>
                  </>
                ) : (
                  <Button onClick={handleAddToLibrary}>
                    <PlusIcon className="w-4 h-4 mr-2" />
                    添加到收藏库
                  </Button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Overview */}
                <Card className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    剧情简介
                  </h2>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {item.overview || '暂无简介'}
                  </p>
                </Card>

                {/* AI Summary */}
                <AISummaryPanel
                  itemId={item.id}
                  overview={item.overview}
                />

                {/* Credits */}
                {(item.director || item.cast) && (
                  <Card className="p-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                      演职人员
                    </h2>
                    <div className="space-y-3">
                      {item.director && (
                        <div>
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            导演：
                          </span>
                          <span className="text-gray-900 dark:text-white ml-2">
                            {item.director}
                          </span>
                        </div>
                      )}
                      {item.cast && item.cast.length > 0 && (
                        <div>
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            演员：
                          </span>
                          <span className="text-gray-900 dark:text-white ml-2">
                            {item.cast.join(', ')}
                          </span>
                        </div>
                      )}
                    </div>
                  </Card>
                )}

                {/* User Notes */}
                {inLibrary && item.notes && (
                  <Card className="p-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                      我的笔记
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {item.notes}
                    </p>
                  </Card>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* AI Tags */}
                <AITagsPanel
                  itemId={item.id}
                  existingTags={item.tags}
                  onTagsUpdate={handleUpdateTags}
                />

                {/* Meta Info */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    详细信息
                  </h3>
                  <div className="space-y-3 text-sm">
                    {item.year && (
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">年份：</span>
                        <span className="text-gray-900 dark:text-white ml-2">{item.year}</span>
                      </div>
                    )}
                    {item.rating && (
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">评分：</span>
                        <span className="text-gray-900 dark:text-white ml-2">
                          ⭐ {item.rating.toFixed(1)}
                        </span>
                      </div>
                    )}
                    {item.runtime && (
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">时长：</span>
                        <span className="text-gray-900 dark:text-white ml-2">
                          {item.runtime} 分钟
                        </span>
                      </div>
                    )}
                    {inLibrary && item.user_rating && (
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">我的评分：</span>
                        <span className="text-gray-900 dark:text-white ml-2">
                          {item.user_rating}/10
                        </span>
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}
