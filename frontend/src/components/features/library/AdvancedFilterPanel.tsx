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
  TagIcon,
  SearchIcon,
  FilmIcon,
  TvIcon,
  ClapperboardIcon,
  BookOpenIcon,
  BarChart3Icon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ItemType, ItemStatus } from '@/types';

interface FilterState {
  content_type?: ItemType;
  status?: ItemStatus;
  search?: string;
  rating_min?: number;
  rating_max?: number;
  tags?: string[];
  year_min?: number;
  year_max?: number;
  sortBy?: string;
}



interface AdvancedFilterPanelProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  activeTags?: string[];
}

const STORAGE_KEY = 'library_filters';

// 评分范围配置
const ratingRanges: { label: string; min?: number; max?: number; color: string }[] = [
  { label: '9-10分', min: 9, max: 10, color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-500' },
  { label: '8-9分', min: 8, max: 9, color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-500' },
  { label: '7-8分', min: 7, max: 8, color: 'bg-lime-100 dark:bg-lime-900/30 text-lime-700 dark:text-lime-300 border-lime-500' },
  { label: '6-7分', min: 6, max: 7, color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-500' },
  { label: '6分以下', min: 0, max: 6, color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-500' },
];

const itemTypes: { value: ItemType; label: string; icon: typeof FilmIcon; activeColor: string }[] = [
  { value: 'movie', label: '电影', icon: FilmIcon, activeColor: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-500' },
  { value: 'tv', label: '剧集', icon: TvIcon, activeColor: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-500' },
  { value: 'anime', label: '动画', icon: ClapperboardIcon, activeColor: 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 border-pink-500' },
  { value: 'book', label: '书籍', icon: BookOpenIcon, activeColor: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-500' },
];

const itemStatuses: { value: ItemStatus; label: string; color: string }[] = [
  { value: 'want_to_watch', label: '想看', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-500' },
  { value: 'watching', label: '在看', color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-500' },
  { value: 'watched', label: '看过', color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-500' },
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

  const handleRatingToggle = (min?: number, max?: number) => {
    const isActive = filters.rating_min === min && filters.rating_max === max;

    if (isActive) {
      // 取消激活：清除评分筛选
      const newFilters = { ...filters };
      delete newFilters.rating_min;
      delete newFilters.rating_max;
      onFilterChange(newFilters);
    } else {
      // 激活：设置评分范围
      onFilterChange({
        ...filters,
        rating_min: min,
        rating_max: max,
      });
    }
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
    <div className="w-64 flex-shrink-0 sticky top-20 self-start">
      <Card variant="elevated" className="max-h-[calc(100vh-100px)] overflow-y-auto">
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
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1.5">
                <SearchIcon className="w-4 h-4" />
                智能搜索
              </h4>
              <SmartSearchBar
                onSearch={(query) => onFilterChange({ ...filters, search: query })}
                placeholder="搜索或描述你想看的..."
              />
            </div>

            {/* 状态筛选 */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1.5">
                <BarChart3Icon className="w-4 h-4" />
                状态
              </h4>
              <div className="flex flex-wrap gap-2">
                {itemStatuses.map((status) => (
                  <button
                    key={status.value}
                    onClick={() => handleStatusToggle(status.value)}
                    className={cn(
                      'px-3 py-1.5 text-sm font-medium rounded-lg border-2 transition-all',
                      filters.status === status.value
                        ? status.color
                        : 'bg-gray-50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                    )}
                  >
                    {status.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 类型筛选 */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1.5">
                <FilmIcon className="w-4 h-4" />
                类型
              </h4>
              <div className="flex flex-wrap gap-2">
                {itemTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.value}
                      onClick={() => handleTypeToggle(type.value)}
                      className={cn(
                        'inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg border-2 transition-all',
                        filters.content_type === type.value
                          ? type.activeColor
                          : 'bg-gray-50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      {type.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 评分筛选 */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1.5">
                <StarIcon className="w-4 h-4" />
                评分
              </h4>
              <div className="flex flex-wrap gap-2">
                {ratingRanges.map((range) => {
                  const isActive = filters.rating_min === range.min && filters.rating_max === range.max;
                  return (
                    <button
                      key={range.label}
                      onClick={() => handleRatingToggle(range.min, range.max)}
                      className={cn(
                        'px-3 py-1.5 text-sm font-medium rounded-lg border-2 transition-all',
                        isActive
                          ? range.color
                          : 'bg-gray-50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                      )}
                    >
                      {range.label}
                    </button>
                  );
                })}
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
