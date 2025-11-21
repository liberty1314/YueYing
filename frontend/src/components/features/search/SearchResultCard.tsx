/**
 * SearchResultCard - 搜索结果卡片
 * 
 * 展示单个搜索结果项
 */

'use client';

import { useState } from 'react';
import { Card, Button, Badge } from '@/components/ui';
import { PlusIcon, CheckIcon, InfoIcon } from 'lucide-react';
import Image from 'next/image';

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
}

const sourceLabels = {
  library: '我的收藏',
  tmdb: 'TMDB',
  bangumi: 'Bangumi',
  google_books: 'Google Books',
};

const typeLabels = {
  movie: '电影',
  tv: '剧集',
  anime: '动画',
  book: '书籍',
  game: '游戏',
};

export function SearchResultCard({ result, onAdd, onView }: SearchResultCardProps) {
  const [isAdded, setIsAdded] = useState(result.source === 'library');
  const [isAdding, setIsAdding] = useState(false);

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

  return (
    <Card
      variant="elevated"
      className="group overflow-hidden cursor-pointer"
      onClick={() => onView?.(result)}
    >
      <div className="flex gap-4 p-4">
        {/* Poster */}
        <div className="flex-shrink-0 w-24 h-36 relative bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
          {poster ? (
            <Image
              src={poster}
              alt={result.title}
              fill
              className="object-cover"
              sizes="96px"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-gray-400 text-xs">暂无封面</span>
            </div>
          )}
          {/* Source Badge */}
          <div className="absolute bottom-2 left-2">
            <Badge variant="default" size="sm">
              {sourceLabels[result.source]}
            </Badge>
          </div>
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
