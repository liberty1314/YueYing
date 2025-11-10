"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, X, Calendar } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import type { LogFilter, LogLevel } from "@/types/log";

interface LogFilterBarProps {
  filters: LogFilter;
  onFiltersChange: (filters: LogFilter) => void;
  availableLevels: LogLevel[];
}

export function LogFilterBar({
  filters,
  onFiltersChange,
  availableLevels,
}: LogFilterBarProps) {
  const [keyword, setKeyword] = useState(filters.keyword || "");
  const debouncedKeyword = useDebounce(keyword, 500);

  // 当防抖后的关键词变化时，更新过滤器
  useEffect(() => {
    onFiltersChange({
      ...filters,
      keyword: debouncedKeyword || null,
    });
  }, [debouncedKeyword]);

  const handleLevelChange = (value: string) => {
    onFiltersChange({
      ...filters,
      level: value === "all" ? null : (value as LogLevel),
    });
  };

  const handleClearFilters = () => {
    setKeyword("");
    onFiltersChange({
      level: null,
      start_time: null,
      end_time: null,
      keyword: null,
    });
  };

  const hasActiveFilters = 
    filters.level || 
    filters.keyword || 
    filters.start_time || 
    filters.end_time;

  return (
    <div className="bg-card border rounded-lg p-4 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 关键词搜索 */}
        <div className="space-y-2">
          <Label htmlFor="keyword">关键词搜索</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="keyword"
              placeholder="搜索日志消息或位置..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* 日志级别过滤 */}
        <div className="space-y-2">
          <Label htmlFor="level">日志级别</Label>
          <Select
            value={filters.level || "all"}
            onValueChange={handleLevelChange}
          >
            <SelectTrigger id="level">
              <SelectValue placeholder="所有级别" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">所有级别</SelectItem>
              {availableLevels.map((level) => (
                <SelectItem key={level} value={level}>
                  {level}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 清除筛选按钮 */}
        <div className="space-y-2">
          <Label>&nbsp;</Label>
          <Button
            variant="outline"
            className="w-full"
            onClick={handleClearFilters}
            disabled={!hasActiveFilters}
          >
            <X className="h-4 w-4 mr-2" />
            清除筛选
          </Button>
        </div>
      </div>

      {/* 活动筛选条件显示 */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 items-center text-sm text-muted-foreground">
          <span>活动筛选：</span>
          {filters.level && (
            <span className="px-2 py-1 bg-primary/10 text-primary rounded">
              级别: {filters.level}
            </span>
          )}
          {filters.keyword && (
            <span className="px-2 py-1 bg-primary/10 text-primary rounded">
              关键词: {filters.keyword}
            </span>
          )}
          {filters.start_time && (
            <span className="px-2 py-1 bg-primary/10 text-primary rounded">
              开始时间: {new Date(filters.start_time).toLocaleString()}
            </span>
          )}
          {filters.end_time && (
            <span className="px-2 py-1 bg-primary/10 text-primary rounded">
              结束时间: {new Date(filters.end_time).toLocaleString()}
            </span>
          )}
        </div>
      )}
    </div>
  );
}









