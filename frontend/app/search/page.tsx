"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Container } from "@/components/common/Container";
import { SearchResults, type ViewMode } from "@/components/search/SearchResults";
import { SearchPagination } from "@/components/search/SearchPagination";
import { FilterBar } from "@/components/search/FilterBar";
import { ContentDetailDialog } from "@/components/content/ContentDetailDialog";
import type { FilterOptions } from "@/components/search/AdvancedFilter";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export type ContentType = "all" | "movie" | "tv" | "anime" | "book";

export interface SearchResult {
  id: string;
  external_id: string;
  source: string;
  content_type: string;
  title: string;
  original_title?: string;
  description?: string;
  poster_url?: string;
  backdrop_url?: string;
  release_date?: string;
  year?: string;
  rating?: number;
  vote_count?: number;
  popularity?: number;
  language?: string;
  metadata?: Record<string, any>;
}

export interface SearchResponse {
  query: string;
  content_type: string;
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  results: SearchResult[];
}

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { status } = useSession();

  // 从 URL 获取搜索参数
  const query = searchParams.get("q") || "";
  const contentType = (searchParams.get("type") || "all") as ContentType;
  const page = parseInt(searchParams.get("page") || "1", 10);
  const browseMode = searchParams.get("browse") || ""; // 浏览模式：top-rated

  const [searchQuery, setSearchQuery] = useState(query);
  const [selectedType, setSelectedType] = useState<ContentType>(contentType);
  const [currentPage, setCurrentPage] = useState(page);
  const [searchResults, setSearchResults] = useState<SearchResponse | null>(
    null
  );
  const [filteredResults, setFilteredResults] = useState<SearchResponse | null>(
    null
  );
  const [filters, setFilters] = useState<FilterOptions>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(
    null
  );
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  
  // 用于请求取消的 AbortController
  const abortControllerRef = useRef<AbortController | null>(null);

  // 应用筛选
  const applyFilters = (
    results: SearchResponse,
    filterOptions: FilterOptions
  ): SearchResponse => {
    if (!filterOptions.yearFrom && !filterOptions.yearTo) {
      return results;
    }

    const filtered = results.results.filter((result) => {
      // 年份筛选
      if (filterOptions.yearFrom || filterOptions.yearTo) {
        const year = result.year ? parseInt(result.year) : null;
        if (year === null) return false;
        
        if (filterOptions.yearFrom && year < filterOptions.yearFrom) {
          return false;
        }
        if (filterOptions.yearTo && year > filterOptions.yearTo) {
          return false;
        }
      }

      return true;
    });

    return {
      ...results,
      results: filtered,
      total: filtered.length,
      total_pages: Math.ceil(filtered.length / results.page_size),
    };
  };

  // 执行搜索或浏览（支持请求取消）
  const performSearch = useCallback(
    async (q: string, type: ContentType, p: number, browse: string = "") => {
      // 浏览模式：如果是top-rated浏览，不需要查询关键词
      if (!browse && !q.trim()) {
        setSearchResults(null);
        setFilteredResults(null);
        return;
      }

      // 取消之前的请求
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // 创建新的 AbortController
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      setIsLoading(true);
      setError(null);

      try {
        let response;

        // 浏览模式：调用TMDB的top-rated API
        if (browse === "top-rated" && (type === "movie" || type === "tv")) {
          const endpoint = type === "movie" ? "/tmdb/movies/top-rated" : "/tmdb/tv/top-rated";
          const tmdbResponse = await api.get(endpoint, {
            params: {
              page: p,
            },
            signal: abortController.signal,
          });

          // 转换TMDB响应为统一搜索格式
          const results = tmdbResponse.data.results?.map((item: any) => ({
            id: String(item.id),
            external_id: String(item.id),
            source: "tmdb",
            content_type: type,
            title: item.title || item.name || "",
            original_title: item.original_title || item.original_name,
            description: item.overview,
            poster_url: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : undefined,
            backdrop_url: item.backdrop_path ? `https://image.tmdb.org/t/p/original${item.backdrop_path}` : undefined,
            release_date: item.release_date || item.first_air_date,
            year: item.release_date
              ? String(new Date(item.release_date).getFullYear())
              : item.first_air_date
              ? String(new Date(item.first_air_date).getFullYear())
              : undefined,
            rating: item.vote_average,
            vote_count: item.vote_count,
            popularity: item.popularity,
            language: item.original_language,
          })) || [];

          response = {
            data: {
              query: browse === "top-rated" ? "高分" + (type === "movie" ? "电影" : "剧集") : "",
              content_type: type,
              total: tmdbResponse.data.total_results || 0,
              page: tmdbResponse.data.page || p,
              page_size: 20,
              total_pages: tmdbResponse.data.total_pages || 1,
              results: results,
            }
          };
        } else {
          // 搜索模式
          response = await api.get("/search", {
            params: {
              q: q.trim(),
              type,
              page: p,
              page_size: 20,
            },
            signal: abortController.signal,
          });
        }

        // 检查请求是否被取消
        if (abortController.signal.aborted) {
          return;
        }

        setSearchResults(response.data);
        // 应用当前筛选
        const filtered = applyFilters(response.data, filters);
        setFilteredResults(filtered);
      } catch (err: any) {
        // 忽略取消的请求
        if (err.name === "CanceledError" || err.code === "ERR_CANCELED") {
          return;
        }

        const errorMsg = err.response?.data?.detail || "搜索失败，请稍后重试";
        setError(errorMsg);
        toast({
          title: "搜索失败",
          description: errorMsg,
          variant: "destructive",
        });
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoading(false);
        }
      }
    },
    [filters, toast]
  );

  // 更新 URL 参数
  const updateURL = (q: string, type: ContentType, p: number, browse: string = "") => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (type !== "all") params.set("type", type);
    if (p > 1) params.set("page", p.toString());
    if (browse) params.set("browse", browse);

    const newURL = params.toString() ? `/search?${params.toString()}` : "/search";
    router.push(newURL, { scroll: false });
  };


  // 处理类型切换
  const handleTypeChange = (type: ContentType) => {
    setSelectedType(type);
    setCurrentPage(1);
    updateURL(searchQuery, type, 1, browseMode);
  };

  // 处理筛选变化
  const handleFiltersChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
    if (searchResults) {
      const filtered = applyFilters(searchResults, newFilters);
      setFilteredResults(filtered);
    }
  };

  // 处理分页
  const handlePageChange = (p: number) => {
    setCurrentPage(p);
    updateURL(searchQuery, selectedType, p, browseMode);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 处理查看详情
  const handleViewDetail = (result: SearchResult) => {
    setSelectedResult(result);
    setDetailDialogOpen(true);
  };

  // 处理添加成功
  const handleAddSuccess = () => {
    toast({
      title: "添加成功",
      description: "内容已添加到你的记录",
    });
    setDetailDialogOpen(false);
  };

  // 同步 URL 参数到状态
  useEffect(() => {
    setSearchQuery(query);
    setSelectedType(contentType);
    setCurrentPage(page);
  }, [query, contentType, page]);

  // 检查登录状态和访问权限
  useEffect(() => {
    // 如果未登录，跳转到登录页
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    // 如果已登录，但没有搜索查询且不是浏览模式，跳转到首页
    if (status === "authenticated" && !query && !browseMode) {
      router.push("/");
    }
  }, [status, query, browseMode, router]);

  // URL 参数变化时执行搜索（带防抖）
  useEffect(() => {
    // 只有在已登录且（有搜索查询或处于浏览模式）时才执行搜索
    if (status !== "authenticated" || (!query && !browseMode)) return;

    // 防抖处理
    const debounceTimer = setTimeout(() => {
      performSearch(query, contentType, page, browseMode);
    }, 300);

    return () => {
      clearTimeout(debounceTimer);
      // 组件卸载时取消请求
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [status, query, contentType, page, browseMode, performSearch]);

  // 加载中显示加载状态
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // 如果未登录或（没有搜索查询且不是浏览模式），不渲染内容（会被useEffect重定向）
  if (status === "unauthenticated" || (!query && !browseMode)) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Container className="pt-8 pb-8">
        {/* 筛选栏 */}
        <div className="mb-6">
          <FilterBar
            selectedType={selectedType}
            onTypeChange={handleTypeChange}
            filters={filters}
            onFiltersChange={handleFiltersChange}
          />
        </div>

        {/* 搜索结果 */}
        <SearchResults
          results={filteredResults}
          isLoading={isLoading}
          error={error}
          query={searchQuery}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onView={handleViewDetail}
        />

        {/* 分页 */}
        {filteredResults && filteredResults.total > 0 && (
          <div className="mt-8">
            <SearchPagination
              currentPage={currentPage}
              totalPages={filteredResults.total_pages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </Container>

      {/* 详情对话框 */}
      <ContentDetailDialog
        result={selectedResult}
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        onAddSuccess={handleAddSuccess}
      />
    </div>
  );
}


