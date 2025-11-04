"use client";

import { SearchCard } from "./SearchCard";
import { SearchCardGrid } from "./SearchCardGrid";
import { SearchResultsSkeleton } from "./SearchResultsSkeleton";
import { Empty } from "@/components/ui/empty";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, Search, LayoutGrid, LayoutList } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SearchResponse, SearchResult } from "@/app/explore/page";

export type ViewMode = "list" | "grid";

interface SearchResultsProps {
  results: SearchResponse | null;
  isLoading: boolean;
  error: string | null;
  query: string;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onAdd?: (result: SearchResult) => void;
  onView?: (result: SearchResult) => void;
}

export function SearchResults({
  results,
  isLoading,
  error,
  query,
  viewMode,
  onViewModeChange,
  onAdd,
  onView,
}: SearchResultsProps) {
  // 加载状态
  if (isLoading) {
    return <SearchResultsSkeleton />;
  }

  // 错误状态
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  // 未搜索状态
  if (!query) {
    return (
      <Empty
        icon={<Search className="h-16 w-16" />}
        title="开始探索"
        description="在上方搜索框中输入关键词，查找电影、剧集、动漫、书籍"
      />
    );
  }

  // 无结果状态
  if (!results || results.results.length === 0) {
    return (
      <Empty
        icon={<Search className="h-16 w-16" />}
        title="未找到结果"
        description={`没有找到与 "${query}" 相关的内容，尝试使用其他关键词`}
      />
    );
  }

  // 显示结果
  return (
    <div className="space-y-4">
      {/* 结果统计和视图切换 */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          找到 <span className="font-medium text-foreground">{results.total}</span> 个结果
        </p>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            第 {results.page} / {results.total_pages} 页
          </span>
          <div className="flex items-center gap-1 ml-4">
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => onViewModeChange("list")}
              className={cn("h-8 w-8 p-0")}
            >
              <LayoutList className="h-4 w-4" />
              <span className="sr-only">列表视图</span>
            </Button>
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => onViewModeChange("grid")}
              className={cn("h-8 w-8 p-0")}
            >
              <LayoutGrid className="h-4 w-4" />
              <span className="sr-only">网格视图</span>
            </Button>
          </div>
        </div>
      </div>

      {/* 结果列表/网格 */}
      {viewMode === "list" ? (
        <div className="space-y-4">
          {results.results.map((result) => (
            <SearchCard
              key={result.id}
              result={result}
              onAdd={onAdd}
              onView={onView}
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 pb-4">
          {results.results.map((result) => (
            <SearchCardGrid
              key={result.id}
              result={result}
              onAdd={onAdd}
              onView={onView}
            />
          ))}
        </div>
      )}
    </div>
  );
}

