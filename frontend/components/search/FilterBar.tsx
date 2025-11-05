"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ContentType } from "@/app/search/page";
import type { FilterOptions } from "./AdvancedFilter";

interface FilterBarProps {
  selectedType: ContentType;
  onTypeChange: (type: ContentType) => void;
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  className?: string;
}

const contentTypes = [
  { value: "all" as ContentType, label: "全部" },
  { value: "movie" as ContentType, label: "电影" },
  { value: "tv" as ContentType, label: "剧集" },
  { value: "anime" as ContentType, label: "动漫" },
  { value: "book" as ContentType, label: "书籍" },
];

// 动态生成年份范围
const currentYear = new Date().getFullYear();
const yearRanges = [
  { label: "全部", from: undefined, to: undefined },
  { label: currentYear.toString(), from: currentYear, to: currentYear },
  { label: (currentYear - 1).toString(), from: currentYear - 1, to: currentYear - 1 },
  { label: (currentYear - 2).toString(), from: currentYear - 2, to: currentYear - 2 },
  { label: "2020年代", from: 2020, to: 2029 },
  { label: "2010年代", from: 2010, to: 2019 },
  { label: "2000年代", from: 2000, to: 2009 },
  { label: "90年代", from: 1990, to: 1999 },
];


export function FilterBar({
  selectedType,
  onTypeChange,
  filters,
  onFiltersChange,
  className,
}: FilterBarProps) {
  const handleYearChange = (from?: number, to?: number) => {
    onFiltersChange({
      ...filters,
      yearFrom: from,
      yearTo: to,
    });
  };

  const isYearSelected = (from?: number, to?: number) => {
    return filters.yearFrom === from && filters.yearTo === to;
  };

  const hasActiveFilters = selectedType !== "all" || filters.yearFrom || filters.yearTo;

  const handleClearFilters = () => {
    onFiltersChange({
      yearFrom: undefined,
      yearTo: undefined,
    });
    onTypeChange("all");
  };

  return (
    <div className={cn("bg-muted/30 rounded-lg p-4 space-y-3", className)}>
      {/* 内容类型筛选 - 始终显示 */}
      <div className="flex items-start gap-3">
        <span className="text-sm font-medium text-muted-foreground min-w-[60px] pt-1">
          分类
        </span>
        <div className="flex flex-wrap items-center gap-2">
          {contentTypes.map((type) => (
            <Button
              key={type.value}
              variant={selectedType === type.value ? "default" : "ghost"}
              size="sm"
              onClick={() => onTypeChange(type.value)}
              className={cn(
                "h-8 px-4 transition-all",
                selectedType === type.value
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "hover:bg-background"
              )}
            >
              {type.label}
            </Button>
          ))}
        </div>
      </div>

      {/* 年份筛选 - 始终显示 */}
      <div className="flex items-start gap-3">
        <span className="text-sm font-medium text-muted-foreground min-w-[60px] pt-1">
          年份
        </span>
        <div className="flex-1 flex items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            {yearRanges.map((range, index) => (
              <Badge
                key={index}
                variant={
                  isYearSelected(range.from, range.to) ? "default" : "secondary"
                }
                className={cn(
                  "cursor-pointer hover:bg-secondary/80 transition-colors px-3 py-1",
                  isYearSelected(range.from, range.to) &&
                    "bg-primary text-primary-foreground hover:bg-primary/90"
                )}
                onClick={() => handleYearChange(range.from, range.to)}
              >
                {range.label}
              </Badge>
            ))}
          </div>
          {/* 清除筛选按钮 - 在筛选框末尾 */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="h-7 text-xs text-muted-foreground hover:text-destructive shrink-0"
            >
              清除筛选
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

