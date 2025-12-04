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
import ResourceDetailModal from '@/components/features/detail/ResourceDetailModal';
import AddToLibraryDialog from '@/components/features/library/AddToLibraryDialog';
import { Snackbar, Alert } from '@mui/material';

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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
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
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid'); // 默认卡片视图
  const [strictFilter, setStrictFilter] = useState(true); // 默认启用严格过滤

  // 详情弹窗状态
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedContent, setSelectedContent] = useState<any>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [forceAdded, setForceAdded] = useState(false);

  // 添加到收藏库弹窗状态
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [contentToAdd, setContentToAdd] = useState<any>(null);

  // Toast提示
  const [toast, setToast] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({
    open: false,
    message: '',
    severity: 'info',
  });

  // 加载用户设置
  useEffect(() => {
    const loadUserSettings = async () => {
      try {
        const data = await api.get<{
          enable_strict_search_filter: boolean;
        }>('/settings', true);
        setStrictFilter(data.enable_strict_search_filter);
      } catch (error) {
        console.error('Failed to load user settings:', error);
        // 使用默认值
      }
    };
    loadUserSettings();
  }, []);

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

      if (mode === 'keyword') {
        // 关键词搜索：并行调用本地库和统一搜索接口
        const [localResults, externalResults] = await Promise.allSettled([
          searchLocal(searchQuery),
          searchUnified(searchQuery, selectedType || 'all'),
        ]);

        if (localResults.status === 'fulfilled') {
          allResults.push(...localResults.value);
        }
        if (externalResults.status === 'fulfilled') {
          allResults.push(...externalResults.value);
        }
      } else {
        // AI 语义搜索
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
        `/user-items?search=${encodeURIComponent(searchQuery)}`,
        true // 本地搜索需要认证
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

  // 使用统一搜索接口（整合 TMDB、Bangumi、Google Books）
  const searchUnified = async (
    searchQuery: string,
    contentType: string = 'all'
  ): Promise<SearchResult[]> => {
    try {
      const data = await api.get<{
        results: any[];
        total: number;
        page: number;
        page_size: number;
      }>(
        `/search?q=${encodeURIComponent(searchQuery)}&type=${contentType}&page=1&page_size=50&strict_filter=${strictFilter}`,
        true
      );

      // 后端已经标准化了数据格式，直接映射即可
      return (
        data.results?.map((item: any) => ({
          id: item.id,
          title: item.title,
          original_title: item.original_title,
          content_type: item.content_type,
          poster_url: item.poster_url,
          backdrop_url: item.backdrop_url,
          year: item.year ? parseInt(item.year) : undefined,
          rating: item.rating,
          overview: item.description,
          source: item.source,
          external_id: item.external_id,
        })) || []
      );
    } catch (error) {
      if (error instanceof APIError) {
        console.error('Unified search error:', error.detail);
      }
      return [];
    }
  };

  // AI 语义搜索
  const searchSemantic = async (searchQuery: string): Promise<SearchResult[]> => {
    try {
      const data = await api.post<any[]>('/rag/search', {
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

  // 处理打开详情
  const handleOpenDetail = (result: SearchResult) => {
    setSelectedContent(result);
    setDetailDialogOpen(true);
    setForceAdded(false);
  };

  // 处理关闭详情
  const handleCloseDetail = () => {
    setDetailDialogOpen(false);
    setSelectedContent(null);
  };

  // 处理添加到库
  const handleAddToLibrary = (result: any) => {
    setContentToAdd(result);
    setAddDialogOpen(true);
  };

  // 添加成功后的回调
  const handleAddSuccess = () => {
    setToast({
      open: true,
      message: '添加成功！',
      severity: 'success',
    });
    setAddDialogOpen(false);
    setForceAdded(true);
  };

  // 处理关闭Toast
  const handleCloseToast = () => {
    setToast({ ...toast, open: false });
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

          {/* Results Summary & View Toggle */}
          {query && !loading && (
            <div className="flex items-center justify-between">
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
              {/* View Mode Toggle */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors ${viewMode === 'grid'
                    ? 'bg-blue-600 dark:bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  title="卡片视图"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-colors ${viewMode === 'list'
                    ? 'bg-blue-600 dark:bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  title="列表视图"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Search Results */}
          <SearchResultGrid
            results={filteredResults}
            loading={loading}
            onView={handleOpenDetail}
            viewMode={viewMode}
          />
        </div>

        {/* 详情弹窗 */}
        <ResourceDetailModal
          open={detailDialogOpen}
          content={selectedContent}
          onClose={handleCloseDetail}
          onAddToLibrary={handleAddToLibrary}
          refreshTrigger={refreshTrigger}
          forceAdded={forceAdded}
        />

        {/* 添加到收藏库弹窗 */}
        <AddToLibraryDialog
          open={addDialogOpen}
          content={contentToAdd}
          onClose={() => setAddDialogOpen(false)}
          onSuccess={handleAddSuccess}
        />

        {/* Toast提示 */}
        <Snackbar
          open={toast.open}
          autoHideDuration={3000}
          onClose={handleCloseToast}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={handleCloseToast} severity={toast.severity} sx={{ width: '100%' }}>
            {toast.message}
          </Alert>
        </Snackbar>
      </MainLayout>
    </ProtectedRoute>
  );
}
