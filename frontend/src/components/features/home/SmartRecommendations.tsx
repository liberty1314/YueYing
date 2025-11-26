/**
 * SmartRecommendations - 智能推荐卡片
 * 
 * AI驱动的个性化内容推荐
 */

'use client';

import { Card, CardHeader, CardTitle, CardContent, Badge } from '@/components/ui';
import { SparklesIcon, TrendingUpIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface RecommendationItem {
  id: number;
  title: string;
  type: 'movie' | 'tv' | 'anime' | 'book';
  poster_url?: string;
  rating?: number;
  reason: string;
  match_score: number;
}

interface SmartRecommendationsProps {
  items?: RecommendationItem[];
}

export function SmartRecommendations({ items = [] }: SmartRecommendationsProps) {
  if (items.length === 0) {
    return (
      <Card variant="elevated">
        <CardHeader>
          <div className="flex items-center gap-2">
            <SparklesIcon className="w-6 h-6 text-primary-500" />
            <CardTitle>✨ AI智能推荐</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <SparklesIcon className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>AI正在学习你的喜好...</p>
            <p className="text-sm mt-2">添加更多记录后将获得个性化推荐</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="elevated">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SparklesIcon className="w-6 h-6 text-primary-500" />
            <CardTitle>✨ AI智能推荐</CardTitle>
          </div>
          <Link
            href="/recommendations"
            className="text-sm text-primary-500 hover:text-primary-600 font-medium"
          >
            查看全部 →
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {items.slice(0, 4).map((item) => (
            <Link
              key={item.id}
              href={`/item/${item.id}`}
              className="group"
            >
              {/* 海报 */}
              <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700 mb-2">
                {item.poster_url ? (
                  <Image
                    src={item.poster_url}
                    alt={item.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <span className="text-sm">无图</span>
                  </div>
                )}

                {/* 匹配度 */}
                <div className="absolute top-2 right-2">
                  <Badge variant="primary" size="sm" className="backdrop-blur-sm bg-primary-500/90">
                    <TrendingUpIcon className="w-3 h-3 mr-1" />
                    {Math.round(item.match_score * 100)}%
                  </Badge>
                </div>
              </div>

              {/* 标题 */}
              <h4 className="font-medium text-sm text-gray-900 dark:text-white truncate group-hover:text-primary-500 transition-colors">
                {item.title}
              </h4>

              {/* 推荐理由 */}
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                {item.reason}
              </p>

              {/* 评分 */}
              {item.rating && (
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-xs text-yellow-600 dark:text-yellow-400">
                    ⭐ {item.rating.toFixed(1)}
                  </span>
                </div>
              )}
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
