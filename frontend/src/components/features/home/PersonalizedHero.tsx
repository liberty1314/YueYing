/**
 * PersonalizedHero - 个性化推荐轮播
 * 
 * AI驱动的个性化内容推荐轮播区域
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, Button, Badge } from '@/components/ui';
import { SparklesIcon, PlusIcon, InfoIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface RecommendationItem {
  id: number;
  title: string;
  type: 'movie' | 'tv' | 'anime' | 'book';
  backdrop_url?: string;
  poster_url?: string;
  overview?: string;
  rating?: number;
  year?: number;
  reason: string;
  match_score: number;
}

interface PersonalizedHeroProps {
  items: RecommendationItem[];
}

const typeLabels = {
  movie: '电影',
  tv: '剧集',
  anime: '动画',
  book: '书籍',
};

export function PersonalizedHero({ items = [] }: PersonalizedHeroProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // 自动轮播
  useEffect(() => {
    if (!isAutoPlaying || items.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, items.length]);

  if (items.length === 0) {
    return (
      <Card variant="elevated" className="overflow-hidden">
        <div className="relative h-[400px] flex items-center justify-center bg-gradient-to-br from-primary-500/20 to-primary-700/20">
          <div className="text-center">
            <SparklesIcon className="w-16 h-16 mx-auto mb-4 text-primary-500 opacity-50" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              AI正在为你生成个性化推荐
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              添加更多记录后，将获得更精准的推荐
            </p>
          </div>
        </div>
      </Card>
    );
  }

  const currentItem = items[currentIndex];

  const handlePrev = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  const handleNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev + 1) % items.length);
  };

  return (
    <Card variant="elevated" className="overflow-hidden group">
      <div className="relative h-[400px] md:h-[500px]">
        {/* 背景图 */}
        <div className="absolute inset-0">
          {currentItem.backdrop_url ? (
            <Image
              src={currentItem.backdrop_url}
              alt={currentItem.title}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary-500 to-primary-700" />
          )}
          {/* 渐变遮罩 */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
        </div>

        {/* 内容区域 */}
        <div className="relative h-full flex items-center">
          <div className="max-w-7xl mx-auto px-6 md:px-8 w-full">
            <div className="max-w-2xl">
              {/* AI推荐标识 */}
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="primary" className="backdrop-blur-sm bg-primary-500/90">
                  <SparklesIcon className="w-3 h-3 mr-1" />
                  AI为你推荐
                </Badge>
                <Badge variant="outline" className="backdrop-blur-sm bg-white/10 border-white/30 text-white">
                  匹配度 {Math.round(currentItem.match_score * 100)}%
                </Badge>
              </div>

              {/* 标题 */}
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                {currentItem.title}
              </h2>

              {/* 元信息 */}
              <div className="flex items-center gap-4 mb-4 text-white/90">
                <Badge variant="outline" className="border-white/30 text-white">
                  {typeLabels[currentItem.type]}
                </Badge>
                {currentItem.year && <span>{currentItem.year}</span>}
                {currentItem.rating && (
                  <span className="flex items-center gap-1">
                    <span className="text-yellow-400">⭐</span>
                    {currentItem.rating.toFixed(1)}
                  </span>
                )}
              </div>

              {/* 推荐理由 */}
              <p className="text-lg text-white/80 mb-6 line-clamp-2">
                💡 {currentItem.reason}
              </p>

              {/* 简介 */}
              {currentItem.overview && (
                <p className="text-white/70 mb-8 line-clamp-3">
                  {currentItem.overview}
                </p>
              )}

              {/* 操作按钮 */}
              <div className="flex items-center gap-3">
                <Link href={`/item/${currentItem.id}`}>
                  <Button size="lg">
                    <InfoIcon className="w-5 h-5" />
                    查看详情
                  </Button>
                </Link>
                <Button variant="secondary" size="lg">
                  <PlusIcon className="w-5 h-5" />
                  添加到观看列表
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* 导航按钮 */}
        {items.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
            >
              <ChevronLeftIcon className="w-6 h-6" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
            >
              <ChevronRightIcon className="w-6 h-6" />
            </button>
          </>
        )}

        {/* 指示器 */}
        {items.length > 1 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2">
            {items.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setIsAutoPlaying(false);
                  setCurrentIndex(index);
                }}
                className={cn(
                  'h-1 rounded-full transition-all',
                  index === currentIndex
                    ? 'w-8 bg-white'
                    : 'w-4 bg-white/50 hover:bg-white/75'
                )}
              />
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
