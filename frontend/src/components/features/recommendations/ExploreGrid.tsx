/**
 * ExploreGrid - 探索模式网格
 * 
 * 展示多样化的探索内容
 */

'use client';

import { useState } from 'react';
import { Card, Button, Badge } from '@/components/ui';
import { PlusIcon, InfoIcon, ExternalLinkIcon } from 'lucide-react';
import Image from 'next/image';
import type { RecommendationItem } from '@/stores/recommendationStore';
import { cn } from '@/lib/utils';

interface ExploreGridProps {
  items: RecommendationItem[];
  onAddToLibrary?: (item: RecommendationItem) => void;
}

const typeLabels = {
  movie: '电影',
  tv: '剧集',
  anime: '动画',
  book: '书籍',
  game: '游戏',
};

export function ExploreGrid({ items, onAddToLibrary }: ExploreGridProps) {
  const [addedItems, setAddedItems] = useState<Set<number>>(new Set());

  const handleAdd = (item: RecommendationItem) => {
    setAddedItems((prev) => new Set(prev).add(item.id));
    onAddToLibrary?.(item);
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
          <InfoIcon className="w-8 h-8 text-gray-500 dark:text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          暂无探索内容
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          请稍后再试
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
      {items.map((item) => {
        const isAdded = addedItems.has(item.id);
        const poster = item.poster_url || item.backdrop_url;

        return (
          <Card key={item.id} variant="elevated" className="group relative overflow-hidden">
            {/* Poster */}
            <div className="aspect-[2/3] relative bg-gray-100 dark:bg-gray-800">
              {poster ? (
                <Image
                  src={poster}
                  alt={item.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 16vw"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-gray-400 text-sm">暂无封面</span>
                </div>
              )}

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2">
                  {/* Overview */}
                  {item.overview && (
                    <p className="text-white text-xs line-clamp-3">
                      {item.overview}
                    </p>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      variant={isAdded ? 'secondary' : 'primary'}
                      size="sm"
                      className="flex-1"
                      onClick={() => handleAdd(item)}
                      disabled={isAdded}
                    >
                      {isAdded ? (
                        <>已添加</>
                      ) : (
                        <>
                          <PlusIcon className="w-4 h-4 mr-1" />
                          添加
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Type Badge */}
              <div className="absolute top-2 left-2">
                <Badge variant="default" size="sm">
                  {typeLabels[item.content_type]}
                </Badge>
              </div>

              {/* Rating Badge */}
              {item.rating && (
                <div className="absolute top-2 right-2">
                  <Badge variant="primary" size="sm">
                    ⭐ {item.rating.toFixed(1)}
                  </Badge>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="p-3">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2 mb-1">
                {item.title}
              </h3>
              {item.year && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {item.year}
                </p>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
