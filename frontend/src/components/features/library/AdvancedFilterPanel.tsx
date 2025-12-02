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
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, Slider } from '@/components/ui';
import { SmartSearchBar } from '@/components/features/search/SmartSearchBar';
import {
  FilterIcon,
  StarIcon,
  TagIcon,
  SearchIcon,
  FilmIcon,
  TvIcon,
  ClapperboardIcon,
  BookOpenIcon,
  BarChart3Icon,
  CheckSquareIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ItemType, ItemStatus } from '@/types';

interface FilterState {
  content_type?: ItemType;
  status?: ItemStatus;
  search?: string;
  min_rating?: number;
  max_rating?: number;
  tags?: string[];
  year_min?: number;
  year_max?: number;
  sortBy?: string;
}



interface AdvancedFilterPanelProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  onClearFilters: () => void;
  activeTags?: string[];
  onToggleBatchMode?: () => void;
  batchMode?: boolean;
}

const STORAGE_KEY = 'library_filters';

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
  onClearFilters,
  activeTags = [],
  onToggleBatchMode,
  batchMode = false
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
    // 如果点击的是当前已选中的状态，不做任何操作（强制保持选中）
    if (filters.status === status) {
      return;
    }

    // 切换到新的状态
    onFilterChange({
      ...filters,
      status: status,
    });
  };

  const handleRatingChange = (value: [number, number]) => {
    const [min, max] = value;

    // 如果是完整范围 (0-10)，则清除评分筛选
    if (min === 0 && max === 10) {
      const newFilters = { ...filters };
      delete newFilters.min_rating;
      delete newFilters.max_rating;
      onFilterChange(newFilters);
    } else {
      onFilterChange({
        ...filters,
        min_rating: min,
        max_rating: max,
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
    // 调用传入的清除函数（会保留当前状态）
    onClearFilters();

    // 更新 localStorage，只保存 status
    if (filters.status) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ status: filters.status }));
    }
  };

  // 计算除了 status 之外的活跃筛选条件数量
  const activeFilterCount = Object.keys(filters).filter(key =>
    key !== 'status' && filters[key as keyof FilterState] !== undefined
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
            {/* 批量管理按钮 */}
            {onToggleBatchMode && (
              <div>
                <Button
                  variant={batchMode ? "primary" : "outline"}
                  size="sm"
                  onClick={onToggleBatchMode}
                  className="w-full"
                >
                  <CheckSquareIcon className="w-4 h-4 mr-2" />
                  {batchMode ? '退出批量管理' : '批量管理'}
                </Button>
              </div>
            )}

            {/* 智能搜索 */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                  <SearchIcon className="w-4 h-4" />
                  智能搜索
                </h4>
                {/* 清除按钮 - 只在有额外筛选条件时显示 */}
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="text-xs text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 cursor-pointer transition-colors"
                  >
                    清除
                  </button>
                )}
              </div>
              <SmartSearchBar
                onSearch={(query) => onFilterChange({ ...filters, search: query })}
                placeholder="搜索或描述你想看的..."
              />
            </div>

            {/* 状态筛选 - 增强动画效果 */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-1.5">
                <BarChart3Icon className="w-4 h-4" />
                状态
              </h4>
              <div className="flex flex-wrap gap-2">
                {itemStatuses.map((status) => (
                  <button
                    key={status.value}
                    onClick={() => handleStatusToggle(status.value)}
                    className={cn(
                      'px-4 py-2 text-sm font-semibold rounded-xl border-2 transition-all duration-300 transform',
                      filters.status === status.value
                        ? `${status.color} shadow-md scale-105`
                        : 'bg-gray-50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 border-transparent hover:border-gray-300 dark:hover:border-gray-600 hover:scale-105 hover:shadow-sm active:scale-95'
                    )}
                  >
                    {status.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 类型筛选 - 增强动画效果 */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-1.5">
                <FilmIcon className="w-4 h-4" />
                类型
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {itemTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.value}
                      onClick={() => handleTypeToggle(type.value)}
                      className={cn(
                        'inline-flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-semibold rounded-xl border-2 transition-all duration-300 transform',
                        filters.content_type === type.value
                          ? `${type.activeColor} shadow-md scale-105`
                          : 'bg-gray-50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 border-transparent hover:border-gray-300 dark:hover:border-gray-600 hover:scale-105 hover:shadow-sm active:scale-95'
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
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-1.5">
                <StarIcon className="w-4 h-4" />
                评分范围
              </h4>
              <Slider
                min={0}
                max={10}
                step={0.5}
                value={[
                  filters.min_rating ?? 0,
                  filters.max_rating ?? 10
                ]}
                onChange={handleRatingChange}
              />
            </div>

            {/* 标签云 - 增强动画效果 */}
            {activeTags.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-1.5">
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
                          'px-3 py-1.5 text-xs font-semibold rounded-full transition-all duration-300 transform',
                          isSelected
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md scale-105'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 hover:scale-110 active:scale-95'
                        )}
                      >
                        #{tag}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  );
}
