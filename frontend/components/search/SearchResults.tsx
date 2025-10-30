"use client";

import { SearchCard } from "./SearchCard";
import { SearchResultsSkeleton } from "./SearchResultsSkeleton";
import { Empty } from "@/components/ui/empty";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Search } from "lucide-react";
import type { SearchResponse, SearchResult } from "@/app/explore/page";

interface SearchResultsProps {
  results: SearchResponse | null;
  isLoading: boolean;
  error: string | null;
  query: string;
  onAdd?: (result: SearchResult) => void;
  onView?: (result: SearchResult) => void;
}

export function SearchResults({
  results,
  isLoading,
  error,
  query,
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
      {/* 结果统计 */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <p>
          找到 <span className="font-medium text-foreground">{results.total}</span> 个结果
        </p>
        <p>
          第 {results.page} / {results.total_pages} 页
        </p>
      </div>

      {/* 结果列表 */}
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
    </div>
  );
}

