/**
 * SearchResultGrid - 搜索结果网格
 * 
 * 按数据源分组展示搜索结果
 */

'use client';

import { SearchResultCard } from './SearchResultCard';
import { Badge } from '@/components/ui';
import { PackageIcon } from 'lucide-react';

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
  onAdd?: (result: SearchResult) => void;
  onView?: (result: SearchResult) => void;
}

const sourceLabels = {
  library: '你的收藏',
  tmdb: 'TMDB',
  bangumi: 'Bangumi',
  google_books: 'Google Books',
};

export function SearchResultGrid({ results, loading, onAdd, onView }: SearchResultGridProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="bg-white dark:bg-gray-800 rounded-lg p-4 animate-pulse"
          >
            <div className="flex gap-4">
              <div className="w-24 h-36 bg-gray-200 dark:bg-gray-700 rounded-lg" />
              <div className="flex-1 space-y-3">
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
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

  // 按数据源分组
  const groupedResults = results.reduce((acc, result) => {
    const source = result.source;
    if (!acc[source]) {
      acc[source] = [];
    }
    acc[source].push(result);
    return acc;
  }, {} as Record<string, SearchResult[]>);

  // 排序：library优先
  const sourceOrder: Array<keyof typeof sourceLabels> = [
    'library',
    'tmdb',
    'bangumi',
    'google_books',
  ];
  const sortedSources = sourceOrder.filter((source) => groupedResults[source]?.length > 0);

  return (
    <div className="space-y-8">
      {sortedSources.map((source) => {
        const sourceResults = groupedResults[source];

        return (
          <div key={source} className="space-y-4">
            {/* Section Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                {sourceLabels[source]}
                <Badge variant="primary" size="sm">
                  {sourceResults.length}
                </Badge>
              </h3>
            </div>

            {/* Results */}
            <div className="space-y-3">
              {sourceResults.map((result) => (
                <SearchResultCard
                  key={`${result.source}-${result.id}`}
                  result={result}
                  onAdd={onAdd}
                  onView={onView}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
