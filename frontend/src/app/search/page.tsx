/**
 * Search Page - 统一搜索页面
 * 
 * Week 5: 统一搜索功能
 * 整合多源搜索（TMDB、Bangumi、Google Books、本地库）
 */

'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { MainLayout } from '@/components/layout';
import { UnifiedSearchBar } from '@/components/features/search/UnifiedSearchBar';
import { SearchResultGrid } from '@/components/features/search/SearchResultGrid';
import { SimpleFilterBar } from '@/components/features/search/SimpleFilterBar';
import { Badge } from '@/components/ui';
import { SearchIcon } from 'lucide-react';
import ProtectedRoute from '@/components/shared/ProtectedRoute';
import { api, APIError } from '@/lib/apiClient';

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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const currentYear = new Date().getFullYear();

export default function SearchPage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [searchMode, setSearchMode] = useState<'keyword' | 'semantic'>('keyword');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState('');
  const [yearRange, setYearRange] = useState<[number, number]>([1990, currentYear]);

  // 初始搜索
  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery, 'keyword');
    }
  }, [initialQuery]);

  const performSearch = async (searchQuery: string, mode: 'keyword' | 'semantic') => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setQuery(searchQuery);
    setSearchMode(mode);

    try {
      const allResults: SearchResult[] = [];

      // 1. 搜索本地库
      const localResults = await searchLocal(searchQuery);
      allResults.push(...localResults);

      // 2. 如果是关键词搜索，调用多个外部源
      if (mode === 'keyword') {
        const [tmdbResults, bangumiResults, booksResults] = await Promise.allSettled([
          searchTMDB(searchQuery),
          searchBangumi(searchQuery),
          searchGoogleBooks(searchQuery),
        ]);

        if (tmdbResults.status === 'fulfilled') {
          allResults.push(...tmdbResults.value);
        }
        if (bangumiResults.status === 'fulfilled') {
          allResults.push(...bangumiResults.value);
        }
        if (booksResults.status === 'fulfilled') {
          allResults.push(...booksResults.value);
        }
      } else {
        // 3. AI 语义搜索
        const semanticResults = await searchSemantic(searchQuery);
        allResults.push(...semanticResults);
      }

      setResults(allResults);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  // 搜索本地库
  const searchLocal = async (searchQuery: string): Promise<SearchResult[]> => {
    try {
      const data = await api.get<{ items: any[] }>(
        `/api/user-items?search=${encodeURIComponent(searchQuery)}`,
        false // 本地搜索不需要认证？或者需要根据后端实际情况调整
      );
      
      return (
        data.items?.map((item: any) => ({
          ...item,
          source: 'library' as const,
        })) || []
      );
    } catch (error) {
      if (error instanceof APIError) {
        console.error('Local search error:', error.detail);
      }
      return [];
    }
  };

  // 搜索 TMDB
  const searchTMDB = async (searchQuery: string): Promise<SearchResult[]> => {
    try {
      const data = await api.get<{ results: any[] }>(
        `/api/tmdb/search/multi?query=${encodeURIComponent(searchQuery)}`,
        false
      );
      
      return (
        data.results?.map((item: any) => ({
          id: item.id,
          title: item.title || item.name,
          original_title: item.original_title || item.original_name,
          content_type: item.media_type === 'movie' ? 'movie' : 'tv',
          poster_url: item.poster_path
            ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
            : undefined,
          year: item.release_date
            ? new Date(item.release_date).getFullYear()
            : item.first_air_date
            ? new Date(item.first_air_date).getFullYear()
            : undefined,
          rating: item.vote_average,
          overview: item.overview,
          source: 'tmdb' as const,
          external_id: item.id.toString(),
        })) || []
      );
    } catch (error) {
      if (error instanceof APIError) {
        console.error('TMDB search error:', error.detail);
      }
      return [];
    }
  };

  // 搜索 Bangumi
  const searchBangumi = async (searchQuery: string): Promise<SearchResult[]> => {
    try {
      const data = await api.get<{ list: any[] }>(
        `/api/bangumi/search/subject?keyword=${encodeURIComponent(searchQuery)}`,
        false
      );
      
      return (
        data.list?.map((item: any) => ({
          id: item.id,
          title: item.name_cn || item.name,
          original_title: item.name,
          content_type: 'anime' as const,
          poster_url: item.image,
          year: item.air_date ? new Date(item.air_date).getFullYear() : undefined,
          rating: item.score,
          overview: item.summary,
          source: 'bangumi' as const,
          external_id: item.id.toString(),
        })) || []
      );
    } catch (error) {
      if (error instanceof APIError) {
        console.error('Bangumi search error:', error.detail);
      }
      return [];
    }
  };

  // 搜索 Google Books
  const searchGoogleBooks = async (searchQuery: string): Promise<SearchResult[]> => {
    try {
      const data = await api.get<{ items: any[] }>(
        `/api/google-books/search?q=${encodeURIComponent(searchQuery)}`,
        false
      );
      
      return (
        data.items?.map((item: any) => ({
          id: item.id,
          title: item.volumeInfo.title,
          content_type: 'book' as const,
          poster_url: item.volumeInfo.imageLinks?.thumbnail,
          year: item.volumeInfo.publishedDate
            ? new Date(item.volumeInfo.publishedDate).getFullYear()
            : undefined,
          rating: item.volumeInfo.averageRating,
          overview: item.volumeInfo.description,
          source: 'google_books' as const,
          external_id: item.id,
        })) || []
      );
    } catch (error) {
      if (error instanceof APIError) {
        console.error('Google Books search error:', error.detail);
      }
      return [];
    }
  };

  // AI 语义搜索
  const searchSemantic = async (searchQuery: string): Promise<SearchResult[]> => {
    try {
      const data = await api.post<any[]>('/api/rag/search', {
        query: searchQuery,
        limit: 20,
        min_similarity: 0.3,
      });
      
      // 适配RAG搜索结果格式
      return (data || []).map((item: any) => ({
        id: item.user_item?.id || item.item?.id,
        title: item.item?.title || '',
        original_title: item.item?.original_title,
        content_type: item.item?.content_type || 'movie',
        poster_url: item.item?.poster_url,
        backdrop_url: item.item?.backdrop_url,
        year: item.item?.year,
        rating: item.item?.rating,
        overview: item.item?.overview,
        source: 'library' as const,
        external_id: item.item?.id?.toString(),
      }));
    } catch (error) {
      if (error instanceof APIError) {
        console.error('Semantic search error:', error.detail);
      }
      return [];
    }
  };

  // 筛选结果
  const filteredResults = results.filter((result) => {
    if (selectedType && result.content_type !== selectedType) return false;
    if (yearRange && result.year) {
      if (result.year < yearRange[0] || result.year > yearRange[1]) return false;
    }
    return true;
  });

  const handleAddToLibrary = async (result: SearchResult) => {
    try {
      // TODO: 调用API添加到收藏
      console.log('Adding to library:', result);
    } catch (error) {
      console.error('Failed to add:', error);
    }
  };

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <SearchIcon className="w-8 h-8 text-primary-500" />
              统一搜索
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              搜索电影、剧集、动画、书籍和游戏
            </p>
          </div>

          {/* Search Bar */}
          <UnifiedSearchBar
            onSearch={performSearch}
            initialQuery={query}
            initialMode={searchMode}
          />

          {/* Filters */}
          {results.length > 0 && (
            <SimpleFilterBar
              selectedType={selectedType}
              selectedYearRange={yearRange}
              onTypeChange={setSelectedType}
              onYearRangeChange={setYearRange}
            />
          )}

          {/* Results Summary */}
          {query && !loading && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                找到 <strong className="text-gray-900 dark:text-white">{filteredResults.length}</strong> 条结果
              </span>
              {searchMode === 'semantic' && (
                <Badge variant="primary" size="sm">
                  AI 语义搜索
                </Badge>
              )}
            </div>
          )}

          {/* Search Results */}
          <SearchResultGrid
            results={filteredResults}
            loading={loading}
            onAdd={handleAddToLibrary}
          />
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}
