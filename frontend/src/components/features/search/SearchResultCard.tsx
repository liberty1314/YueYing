/**
 * SearchResultCard - 搜索结果卡片
 * 
 * Netflix/Apple TV 风格的垂直布局卡片
 */

'use client';

import { useState } from 'react';
import { Card, Button, Badge } from '@/components/ui';
import { PlusIcon, CheckIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchResult {
  id: number | string;
  title: string;
  original_title?: string;
  content_type: 'movie' | 'tv' | 'anime' | 'book' | 'game';
  poster_url?: string;
  backdrop_url?: string;
  year?: number;
  rating?: number;
  overview?: string;
  source: 'library' | 'tmdb' | 'bangumi' | 'google_books';
  external_id?: string;
}

interface SearchResultCardProps {
  result: SearchResult;
  onAdd?: (result: SearchResult) => void;
  onView?: (result: SearchResult) => void;
  viewMode?: 'grid' | 'list';
}

const typeLabels = {
  movie: '电影',
  tv: '剧集',
  anime: '动画',
  book: '书籍',
  game: '游戏',
};

export function SearchResultCard({ result, onAdd, onView, viewMode = 'grid' }: SearchResultCardProps) {
  const [isAdded, setIsAdded] = useState(result.source === 'library');
  const [isAdding, setIsAdding] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleAdd = async () => {
    if (isAdded || !onAdd) return;

    setIsAdding(true);
    try {
      await onAdd(result);
      setIsAdded(true);
    } catch (error) {
      console.error('Failed to add:', error);
    } finally {
      setIsAdding(false);
    }
  };

  const poster = result.poster_url || result.backdrop_url;

  // 卡片视图 - Netflix/Apple TV 风格（图片和信息分离）
  if (viewMode === 'grid') {
    return (
      <div className="group cursor-pointer" onClick={() => onView?.(result)}>
        {/* 图片卡片 - 独立容器，带圆角、阴影和 hover 效果 */}
        <Card
          variant="elevated"
          className={cn(
            "overflow-hidden transition-all duration-300",
            "hover:shadow-xl hover:-translate-y-1"
          )}
        >
          <div className="relative aspect-[2/3] bg-gray-100 dark:bg-gray-800 overflow-hidden">
            {poster && !imageError ? (
              <img
                src={poster}
                alt={result.title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-gray-400 text-5xl">{typeLabels[result.content_type]}</span>
              </div>
            )}

            {/* Hover 遮罩层 */}
            {result.source !== 'library' && onAdd && (
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button
                  variant={isAdded ? 'outline' : 'primary'}
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAdd();
                  }}
                  disabled={isAdded || isAdding}
                  className="bg-white text-gray-900 hover:bg-gray-100 dark:bg-white dark:text-gray-900"
                >
                  {isAdded ? (
                    <>
                      <CheckIcon className="w-4 h-4 mr-1" />
                      已添加
                    </>
                  ) : (
                    <>
                      <PlusIcon className="w-4 h-4 mr-1" />
                      添加
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </Card>

        {/* 信息区域 - 独立容器，透明背景 */}
        <div className="mt-2 px-1">
          {/* 标题 */}
          <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 mb-1 text-sm leading-tight">
            {result.title}
          </h3>

          {/* 元数据行 */}
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>{result.year || '未知'}</span>
            {result.rating && (
              <span className="text-yellow-500 font-medium">
                ⭐ {result.rating.toFixed(1)}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 列表视图
  return (
    <Card
      variant="elevated"
      className="group overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
      onClick={() => onView?.(result)}
    >
      <div className="flex gap-4 p-4">
        {/* Poster */}
        <div className="flex-shrink-0 w-24 h-36 relative bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
          {poster && !imageError ? (
            <img
              src={poster}
              alt={result.title}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-gray-400 text-xs">暂无封面</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-2">
          {/* Title */}
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white line-clamp-1">
              {result.title}
            </h3>
            {result.original_title && result.original_title !== result.title && (
              <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                {result.original_title}
              </p>
            )}
          </div>

          {/* Meta Info */}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" size="sm">
              {typeLabels[result.content_type]}
            </Badge>
            {result.year && (
              <span className="text-xs text-gray-500 dark:text-gray-400">{result.year}</span>
            )}
            {result.rating && (
              <Badge variant="primary" size="sm">
                ⭐ {result.rating.toFixed(1)}
              </Badge>
            )}
          </div>

          {/* Overview */}
          {result.overview && (
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
              {result.overview}
            </p>
          )}
        </div>

        {/* Action Button */}
        <div className="flex-shrink-0 flex items-center">
          {result.source !== 'library' && onAdd && (
            <Button
              variant={isAdded ? 'outline' : 'primary'}
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleAdd();
              }}
              disabled={isAdded || isAdding}
            >
              {isAdded ? (
                <>
                  <CheckIcon className="w-4 h-4 mr-1" />
                  已添加
                </>
              ) : (
                <>
                  <PlusIcon className="w-4 h-4 mr-1" />
                  添加
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
