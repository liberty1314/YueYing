/**
 * AdvancedFilterPanel - 高级筛选面板（增强版）
 * 
 * 新增功能：
 * - 标签云展示
 * - 快速筛选预设
 * - 筛选器状态持久化
 */

'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge } from '@/components/ui';
import { SmartSearchBar } from '@/components/features/search/SmartSearchBar';
import {
  FilterIcon,
  XIcon,
  StarIcon,
  ClockIcon,
  TrendingUpIcon,
  TagIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ItemType, ItemStatus } from '@/types';

interface FilterState {
  content_type?: ItemType;
  status?: ItemStatus;
  search?: string;
  rating_min?: number;
  tags?: string[];
  year_min?: number;
  year_max?: number;
}

interface FilterPreset {
  id: string;
  name: string;
  icon: typeof StarIcon;
  filters: Partial<FilterState>;
}

interface AdvancedFilterPanelProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  activeTags?: string[];
}

const STORAGE_KEY = 'library_filters';

// 快速筛选预设
const filterPresets: FilterPreset[] = [
  {
    id: 'high_rated',
    name: '高分(>8)',
    icon: StarIcon,
    filters: { rating_min: 8 },
  },
  {
    id: 'recent',
    name: '最近添加',
    icon: ClockIcon,
    filters: {}, // 通过sortBy处理
  },
  {
    id: 'unrated',
    name: '未评分',
    icon: TrendingUpIcon,
    filters: { rating_min: 0 },
  },
];

const itemTypes: { value: ItemType; label: string; emoji: string }[] = [
  { value: 'movie', label: '电影', emoji: '🎬' },
  { value: 'tv', label: '剧集', emoji: '📺' },
  { value: 'anime', label: '动画', emoji: '🎌' },
  { value: 'book', label: '书籍', emoji: '📚' },
  { value: 'game', label: '游戏', emoji: '🎮' },
];

const itemStatuses: { value: ItemStatus; label: string; color: string }[] = [
  { value: 'want_to_watch', label: '想看', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' },
  { value: 'watching', label: '在看', color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' },
  { value: 'watched', label: '看过', color: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300' },
];

export function AdvancedFilterPanel({
  filters,
  onFilterChange,
  activeTags = []
}: AdvancedFilterPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  // 从localStorage加载筛选状态
  useEffect(() => {
    const savedFilters = localStorage.getItem(STORAGE_KEY);
    if (savedFilters) {
      try {
        const parsed = JSON.parse(savedFilters);
        onFilterChange(parsed);
      } catch (error) {
        console.error('Failed to load saved filters:', error);
      }
    }
  }, []);

  // 保存筛选状态到localStorage
  useEffect(() => {
    if (Object.keys(filters).length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
    }
  }, [filters]);

  const handleTypeToggle = (type: ItemType) => {
    onFilterChange({
      ...filters,
      content_type: filters.content_type === type ? undefined : type,
    });
  };

  const handleStatusToggle = (status: ItemStatus) => {
    onFilterChange({
      ...filters,
      status: filters.status === status ? undefined : status,
    });
  };

  const handlePresetClick = (preset: FilterPreset) => {
    onFilterChange({
      ...filters,
      ...preset.filters,
    });
  };

  const handleTagToggle = (tag: string) => {
    const currentTags = filters.tags || [];
    const newTags = currentTags.includes(tag)
      ? currentTags.filter(t => t !== tag)
      : [...currentTags, tag];

    onFilterChange({
      ...filters,
      tags: newTags.length > 0 ? newTags : undefined,
    });
  };

  const clearFilters = () => {
    onFilterChange({});
    localStorage.removeItem(STORAGE_KEY);
  };

  const activeFilterCount = Object.keys(filters).filter(key =>
    filters[key as keyof FilterState] !== undefined
  ).length;

  return (
    <div className="w-64 flex-shrink-0">
      <Card variant="elevated">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FilterIcon className="w-5 h-5" />
              筛选器
              {activeFilterCount > 0 && (
                <Badge variant="primary" size="sm">
                  {activeFilterCount}
                </Badge>
              )}
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? '收起' : '展开'}
            </Button>
          </div>
        </CardHeader>

        {isExpanded && (
          <CardContent className="space-y-6">
            {/* 智能搜索 */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                🔍 智能搜索
              </h4>
              <SmartSearchBar
                onSearch={(query) => onFilterChange({ ...filters, search: query })}
                placeholder="搜索或描述你想看的..."
              />
            </div>

            {/* 快速筛选预设 */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                ⚡ 快速筛选
              </h4>
              <div className="flex flex-wrap gap-2">
                {filterPresets.map((preset) => {
                  const Icon = preset.icon;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => handlePresetClick(preset)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <Icon className="w-3 h-3" />
                      {preset.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 类型筛选 */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                🎬 类型
              </h4>
              <div className="flex flex-wrap gap-2">
                {itemTypes.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => handleTypeToggle(type.value)}
                    className={cn(
                      'inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-all',
                      filters.content_type === type.value
                        ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border-2 border-primary-500'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-2 border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                    )}
                  >
                    <span>{type.emoji}</span>
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 状态筛选 */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                📊 状态
              </h4>
              <div className="flex flex-wrap gap-2">
                {itemStatuses.map((status) => (
                  <button
                    key={status.value}
                    onClick={() => handleStatusToggle(status.value)}
                    className={cn(
                      'px-3 py-1.5 text-sm font-medium rounded-lg transition-all',
                      filters.status === status.value
                        ? status.color + ' border-2 border-current'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-2 border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                    )}
                  >
                    {status.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 标签云 */}
            {activeTags.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1">
                  <TagIcon className="w-4 h-4" />
                  活跃标签
                </h4>
                <div className="flex flex-wrap gap-2">
                  {activeTags.map((tag) => {
                    const isSelected = filters.tags?.includes(tag);
                    return (
                      <button
                        key={tag}
                        onClick={() => handleTagToggle(tag)}
                        className={cn(
                          'px-2.5 py-1 text-xs font-medium rounded-full transition-all',
                          isSelected
                            ? 'bg-blue-600 dark:bg-blue-500 text-white'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                        )}
                      >
                        #{tag}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 清除筛选 */}
            {activeFilterCount > 0 && (
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  className="w-full"
                >
                  <XIcon className="w-4 h-4 mr-2" />
                  清除所有筛选
                </Button>
              </div>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  );
}
