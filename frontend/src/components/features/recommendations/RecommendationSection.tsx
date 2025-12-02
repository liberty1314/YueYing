/**
 * RecommendationSection - 推荐区块组件
 * 
 * 展示基于策略的推荐内容
 */

'use client';

import { Card, Button, Badge } from '@/components/ui';
import { SparklesIcon, PlusIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import type { RecommendationItem } from '@/stores/recommendationStore';
import { useState } from 'react';

interface RecommendationSectionProps {
  items: RecommendationItem[];
  onAddToLibrary?: (item: RecommendationItem) => void;
  loading?: boolean;
  isUpdating?: boolean;
}

const typeLabels = {
  movie: '电影',
  tv: '剧集',
  anime: '动画',
  book: '书籍',
};

export function RecommendationSection({
  items,
  onAddToLibrary,
  loading = false,
  isUpdating = false,
}: RecommendationSectionProps) {
  const [addedItems, setAddedItems] = useState<Set<number>>(new Set());

  const handleAdd = (item: RecommendationItem) => {
    setAddedItems((prev) => new Set(prev).add(item.id));
    onAddToLibrary?.(item);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <Card key={i} variant="default" className="overflow-hidden">
            <div className="aspect-[2/3] bg-gray-200 dark:bg-gray-700 animate-pulse" />
            <div className="p-3 space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
          <SparklesIcon className="w-8 h-8 text-gray-500 dark:text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          暂无推荐内容
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          请先添加一些观看记录，AI 将为您生成个性化推荐
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <SparklesIcon className="w-6 h-6 text-primary-500" />
            为你推荐
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            基于您的观看历史和偏好
          </p>
        </div>
        <Badge variant="primary" size="lg">
          {items.length} 条推荐
        </Badge>
      </div>

      {/* Grid - 分离式布局 with Animation */}
      <motion.div
        layout
        className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 transition-opacity duration-300 ${isUpdating ? 'opacity-50' : 'opacity-100'}`}
      >
        <AnimatePresence mode="popLayout">
          {items.map((item) => {
            const isAdded = addedItems.has(item.id);
            const poster = item.poster_url || item.backdrop_url;

            return (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{
                  duration: 0.3,
                  type: "spring",
                  stiffness: 300,
                  damping: 30
                }}
                className="group cursor-pointer"
              >
                {/* 图片卡片 - 独立容器 */}
                <Card variant="elevated" className="overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                  <div className="aspect-[2/3] relative bg-gray-100 dark:bg-gray-800">
                    {poster ? (
                      <Image
                        src={poster}
                        alt={item.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-gray-500 dark:text-gray-400 text-sm">暂无封面</span>
                      </div>
                    )}

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <div className="absolute bottom-0 left-0 right-0 p-4 space-y-3">
                        {/* Reason */}
                        {item.reason && (
                          <div className="space-y-1">
                            <p className="text-xs text-gray-200 dark:text-gray-300">推荐理由</p>
                            <p className="text-white text-sm line-clamp-2">{item.reason}</p>
                          </div>
                        )}

                        {/* Match Score */}
                        {item.match_score && (
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary-500 rounded-full"
                                style={{ width: `${item.match_score}%` }}
                              />
                            </div>
                            <span className="text-white text-xs font-medium">
                              {item.match_score}% 匹配
                            </span>
                          </div>
                        )}

                        {/* Add Button */}
                        <Button
                          variant={isAdded ? 'secondary' : 'primary'}
                          size="sm"
                          className="w-full"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAdd(item);
                          }}
                          disabled={isAdded}
                        >
                          {isAdded ? (
                            <>已添加</>
                          ) : (
                            <>
                              <PlusIcon className="w-4 h-4 mr-1" />
                              添加到我的收藏
                            </>
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Type Badge */}
                    <div className="absolute top-2 left-2">
                      <Badge variant="default" size="sm">
                        {typeLabels[item.content_type]}
                      </Badge>
                    </div>
                  </div>
                </Card>

                {/* 信息区域 - 独立容器，透明背景 */}
                <div className="mt-2 px-1">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 mb-1 leading-tight">
                    {item.title}
                  </h3>
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>{item.year || '未知'}</span>
                    {item.rating && (
                      <span className="text-yellow-500 font-medium">
                        ⭐ {item.rating.toFixed(1)}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
