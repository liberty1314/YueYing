"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import type { UserItemFilters, SortField, SortOrder } from "@/types/user-item";
import { SortSelector } from "./SortSelector";
import { ViewToggle } from "./ViewToggle";

interface FilterPanelProps {
  filters: UserItemFilters;
  onFiltersChange: (filters: Partial<UserItemFilters>) => void;
  sortBy: SortField;
  sortOrder: SortOrder;
  onSortChange: (sortBy: string, sortOrder: string) => void;
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
}

// 类型选项
const contentTypeOptions = [
  { value: undefined, label: "全部" },
  { value: "movie", label: "电影" },
  { value: "tv", label: "剧集" },
  { value: "anime", label: "动漫" },
  { value: "book", label: "书籍" },
];

// 年份选项
const yearRanges = [
  { label: "全部", from: undefined, to: undefined },
  { label: "2024", from: 2024, to: 2024 },
  { label: "2023", from: 2023, to: 2023 },
  { label: "2022", from: 2022, to: 2022 },
  { label: "2020年代", from: 2020, to: 2029 },
  { label: "2010年代", from: 2010, to: 2019 },
  { label: "2000年代", from: 2000, to: 2009 },
  { label: "90年代", from: 1990, to: 1999 },
];

export function FilterPanel({
  filters,
  onFiltersChange,
  sortBy,
  sortOrder,
  onSortChange,
  viewMode,
  onViewModeChange,
}: FilterPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // 处理类型变化
  const handleTypeChange = (type: string | undefined) => {
    onFiltersChange({ content_type: type as any });
  };

  // 处理年份变化
  const handleYearChange = (from?: number, to?: number) => {
    onFiltersChange({
      year_from: from,
      year_to: to,
    });
  };

  // 判断年份是否被选中
  const isYearSelected = (from?: number, to?: number) => {
    return filters.year_from === from && filters.year_to === to;
  };

  // 判断是否有激活的筛选
  const hasActiveFilters = 
    filters.content_type || 
    filters.year_from || 
    filters.year_to;

  // 清除所有筛选
  const handleReset = () => {
    onFiltersChange({
      content_type: undefined,
      year_from: undefined,
      year_to: undefined,
      min_rating: undefined,
      max_rating: undefined,
    });
  };

  return (
    <div className="w-full space-y-4">
      {/* 第一行：筛选按钮、排序和视图切换 */}
      <div className="flex items-center gap-3">
        {/* 筛选按钮 */}
        <Button
          type="button"
          variant={hasActiveFilters ? "default" : "outline"}
          size="sm"
          onClick={(e) => {
            e.preventDefault();
            setIsExpanded(!isExpanded);
          }}
          className={cn(
            "h-9 gap-2",
            hasActiveFilters && "bg-primary text-primary-foreground"
          )}
        >
          筛选
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>

        {/* 右侧：排序和视图切换 */}
        <div className="flex gap-2 ml-auto">
          <SortSelector
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSortChange={onSortChange}
          />
          <ViewToggle
            viewMode={viewMode}
            onViewModeChange={onViewModeChange}
          />
        </div>
      </div>

      {/* 展开的筛选面板 - 独立的一行 */}
      {isExpanded && (
        <div className="bg-muted/30 rounded-lg p-4 space-y-3">
          {/* 类型筛选 */}
          <div className="flex items-start gap-3">
            <span className="text-sm font-medium text-muted-foreground min-w-[60px] pt-1">
              分类
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {contentTypeOptions.map((option) => (
                <Button
                  key={option.value || "all"}
                  type="button"
                  variant={filters.content_type === option.value ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handleTypeChange(option.value)}
                  className={cn(
                    "h-8 px-4 transition-all",
                    filters.content_type === option.value
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "hover:bg-background"
                  )}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>

          {/* 年份筛选 */}
          <div className="flex items-start gap-3">
            <span className="text-sm font-medium text-muted-foreground min-w-[60px] pt-1">
              年份
            </span>
            <div className="flex flex-wrap gap-2">
              {yearRanges.map((range, index) => {
                const isSelected = isYearSelected(range.from, range.to);

                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleYearChange(range.from, range.to)}
                    className="focus:outline-none"
                  >
                    <Badge
                      variant={isSelected ? "default" : "secondary"}
                      className={cn(
                        "cursor-pointer hover:bg-secondary/80 transition-colors px-3 py-1",
                        isSelected &&
                          "bg-primary text-primary-foreground hover:bg-primary/90"
                      )}
                    >
                      {range.label}
                    </Badge>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 清除筛选 */}
          {hasActiveFilters && (
            <div className="flex justify-end pt-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="h-7 text-xs text-muted-foreground hover:text-destructive"
              >
                清除筛选
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
