"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Search, X } from "lucide-react";
import type { LogFilter, LogLevel } from "@/types/log";

interface LogFilterBarProps {
  filters: LogFilter;
  onFiltersChange: (filters: LogFilter) => void;
  availableLevels: LogLevel[];
  messageDisplayMode?: 'truncate' | 'full';
  onMessageDisplayModeChange?: (mode: 'truncate' | 'full') => void;
}

export function LogFilterBar({
  filters,
  onFiltersChange,
  availableLevels,
  messageDisplayMode = 'truncate',
  onMessageDisplayModeChange,
}: LogFilterBarProps) {
  const [keyword, setKeyword] = useState<string>(filters.keyword || "");

  // 本地状态用于管理level选择，确保初始状态正确
  const [selectedLevel, setSelectedLevel] = useState<string>(filters.level || "all");

  // 当关键词变化时，更新过滤器（带防抖）
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onFiltersChange({
        ...filters,
        keyword: keyword || null,
      });
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [keyword]);

  // 当selectedLevel变化时，更新过滤器
  useEffect(() => {
    onFiltersChange({
      ...filters,
      level: selectedLevel === "all" ? null : (selectedLevel as LogLevel),
    });
  }, [selectedLevel]);

  // 同步父组件的filters变化
  useEffect(() => {
    const expectedLevel = filters.level || "all";
    if (selectedLevel !== expectedLevel) {
      setSelectedLevel(expectedLevel);
    }
  }, [filters.level]);

  const handleLevelChange = (value: string) => {
    setSelectedLevel(value);
  };

  const handleClearFilters = () => {
    setKeyword("");
    setSelectedLevel("all");
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
      {/* 第一行：关键词搜索和日志级别 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 关键词搜索 */}
        <div className="space-y-2">
          <Label htmlFor="keyword" className="text-sm font-medium">
            关键词搜索
          </Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="keyword"
              placeholder="搜索日志消息或位置..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
        </div>

        {/* 日志级别过滤 */}
        <div className="space-y-2">
          <Label htmlFor="level" className="text-sm font-medium">
            日志级别
          </Label>
          <Select
            value={selectedLevel}
            onValueChange={handleLevelChange}
          >
            <SelectTrigger id="level" className="h-9">
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
      </div>

      {/* 第二行：消息显示控制和清除筛选 */}
      <div className="flex items-center justify-between">
        {/* 消息显示控制 */}
        <div className="flex items-center space-x-3">
          <Label htmlFor="message-display" className="text-sm font-medium text-foreground">
            消息显示
          </Label>
          <div className="flex items-center space-x-2">
            <Switch
              id="message-display"
              checked={messageDisplayMode === 'full'}
              onCheckedChange={(checked) => onMessageDisplayModeChange?.(checked ? 'full' : 'truncate')}
            />
            <span className="text-sm text-muted-foreground">
              {messageDisplayMode === 'full' ? '全部显示' : '截断显示'}
            </span>
          </div>
        </div>

        {/* 清除筛选按钮 */}
        {hasActiveFilters && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="h-8 text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          >
            <X className="h-4 w-4 mr-1" />
            清除筛选
          </Button>
        )}
      </div>

      {/* 活动筛选条件显示 */}
      {hasActiveFilters && (
        <div className="border-t pt-3">
          <div className="flex flex-wrap gap-2 items-center text-sm">
            <span className="text-muted-foreground font-medium">活动筛选：</span>
            {filters.level && (
              <span className="inline-flex items-center px-2 py-1 bg-primary/10 text-primary rounded-md text-xs font-medium">
                级别: {filters.level}
              </span>
            )}
            {filters.keyword && (
              <span className="inline-flex items-center px-2 py-1 bg-primary/10 text-primary rounded-md text-xs font-medium">
                关键词: {filters.keyword}
              </span>
            )}
            {filters.start_time && (
              <span className="inline-flex items-center px-2 py-1 bg-primary/10 text-primary rounded-md text-xs font-medium">
                开始时间: {new Date(filters.start_time).toLocaleString()}
              </span>
            )}
            {filters.end_time && (
              <span className="inline-flex items-center px-2 py-1 bg-primary/10 text-primary rounded-md text-xs font-medium">
                结束时间: {new Date(filters.end_time).toLocaleString()}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}









