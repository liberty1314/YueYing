/**
 * SearchResultGrid - 搜索结果网格
 * 
 * 使用统一的 MediaCard 组件展示搜索结果
 */

'use client';

import { Grid } from '@mui/material';
import MediaCard from '@/components/shared/MediaCard';
import { PackageIcon } from 'lucide-react';
import { normalizeMediaData } from '@/utils/mediaDataMapper';

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

interface SearchResultGridProps {
  results: SearchResult[];
  loading?: boolean;
  onView?: (result: SearchResult) => void;
  viewMode?: 'grid' | 'list';
}

export function SearchResultGrid({ results, loading, onView, viewMode = 'grid' }: SearchResultGridProps) {
  if (loading) {
    return (
      <Grid container spacing={{ xs: 2, md: 3 }}>
        {Array.from({ length: 12 }).map((_, i) => (
          <Grid key={i} size={{ xs: 6, sm: 4, md: 3, lg: 2 }}>
            <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden animate-pulse">
              <div className="aspect-[2/3] bg-gray-200 dark:bg-gray-700" />
              <div className="p-3 space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
              </div>
            </div>
          </Grid>
        ))}
      </Grid>
    );
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
          <PackageIcon className="w-8 h-8 text-gray-500 dark:text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          未找到相关结果
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          试试其他关键词或使用 AI 语义搜索
        </p>
      </div>
    );
  }

  // 使用统一的 MediaCard 组件
  return (
    <Grid container spacing={{ xs: 2, md: 3 }}>
      {results.map((result) => {
        const normalized = normalizeMediaData(result);
        return (
          <Grid key={`${result.source}-${result.id}`} size={{ xs: 6, sm: 4, md: 3, lg: 2 }}>
            <MediaCard
              id={normalized.id}
              title={normalized.title}
              posterUrl={normalized.poster_url}
              year={normalized.year}
              rating={normalized.rating}
              onClick={() => onView?.(result)}
            />
          </Grid>
        );
      })}
    </Grid>
  );
}
