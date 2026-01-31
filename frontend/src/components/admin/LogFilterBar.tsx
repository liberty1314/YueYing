/**
 * LogFilterBar - 日志过滤栏组件
 * 
 * 提供日志过滤和搜索功能，支持级别过滤、时间范围、关键词搜索和自动刷新
 * 
 * 功能：
 * - 日志级别过滤（多选）
 * - 时间范围过滤（预设 + 自定义）
 * - 关键词搜索（带防抖）
 * - 自动刷新开关
 * - 刷新间隔配置
 * 
 * 验证需求: 7.2, 7.3, 7.4, 7.6, 11.5
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, RefreshCw, Calendar, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AppleInput } from '@/components/ui/AppleInput';
import { AppleSwitch } from '@/components/ui/AppleSwitch';
import { AppleButton } from '@/components/ui/AppleButton';
import { LogFilters, LogLevel } from '@/types/log';

/**
 * 时间范围预设选项
 */
const TIME_RANGE_PRESETS = [
  { label: '今天', value: 'today' },
  { label: '最近 7 天', value: '7days' },
  { label: '最近 30 天', value: '30days' },
  { label: '自定义', value: 'custom' },
] as const;

type TimeRangePreset = typeof TIME_RANGE_PRESETS[number]['value'];

/**
 * 日志级别选项
 */
const LOG_LEVELS: { label: string; value: LogLevel; color: string }[] = [
  { label: 'DEBUG', value: 'DEBUG', color: 'var(--color-text-secondary)' },
  { label: 'INFO', value: 'INFO', color: 'var(--color-primary)' },
  { label: 'WARNING', value: 'WARNING', color: 'var(--color-warning)' },
  { label: 'ERROR', value: 'ERROR', color: 'var(--color-error)' },
];

/**
 * 刷新间隔选项（秒）
 */
const REFRESH_INTERVALS = [
  { label: '10 秒', value: 10 },
  { label: '30 秒', value: 30 },
  { label: '60 秒', value: 60 },
  { label: '5 分钟', value: 300 },
];

/**
 * LogFilterBar 组件属性
 */
export interface LogFilterBarProps {
  /**
   * 当前过滤器
   */
  filters: LogFilters;
  
  /**
   * 过滤器变化回调
   */
  onFiltersChange: (filters: LogFilters) => void;
  
  /**
   * 是否启用自动刷新
   */
  autoRefresh?: boolean;
  
  /**
   * 自动刷新状态变化回调
   */
  onAutoRefreshChange?: (enabled: boolean) => void;
  
  /**
   * 刷新间隔（秒）
   */
  refreshInterval?: number;
  
  /**
   * 刷新间隔变化回调
   */
  onRefreshIntervalChange?: (interval: number) => void;
  
  /**
   * 手动刷新回调
   */
  onRefresh?: () => void;
  
  /**
   * 是否正在刷新
   */
  isRefreshing?: boolean;
  
  /**
   * 自定义类名
   */
  className?: string;
}

/**
 * LogFilterBar 日志过滤栏组件
 * 
 * 提供日志过滤、搜索和自动刷新功能。
 * 
 * @component
 * @example
 * ```tsx
 * // 基础用法
 * <LogFilterBar
 *   filters={filters}
 *   onFiltersChange={setFilters}
 * />
 * 
 * // 带自动刷新
 * <LogFilterBar
 *   filters={filters}
 *   onFiltersChange={setFilters}
 *   autoRefresh={autoRefresh}
 *   onAutoRefreshChange={setAutoRefresh}
 *   refreshInterval={30}
 *   onRefreshIntervalChange={setRefreshInterval}
 *   onRefresh={handleRefresh}
 *   isRefreshing={isRefreshing}
 * />
 * ```
 */
export function LogFilterBar({
  filters,
  onFiltersChange,
  autoRefresh = false,
  onAutoRefreshChange,
  refreshInterval = 30,
  onRefreshIntervalChange,
  onRefresh,
  isRefreshing = false,
  className,
}: LogFilterBarProps) {
  // 搜索关键词本地状态（用于防抖）
  const [searchInput, setSearchInput] = useState(filters.search || '');
  
  // 时间范围预设
  const [timeRangePreset, setTimeRangePreset] = useState<TimeRangePreset>('7days');
  
  // 自定义时间范围
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  
  // 显示高级过滤器
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  // 防抖搜索 - 300ms 延迟
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== filters.search) {
        onFiltersChange({
          ...filters,
          search: searchInput || undefined,
        });
      }
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchInput]); // 只依赖 searchInput，避免循环
  
  // 处理日志级别切换
  const handleLevelToggle = useCallback((level: LogLevel) => {
    const currentLevels = filters.level || [];
    const newLevels = currentLevels.includes(level)
      ? currentLevels.filter((l) => l !== level)
      : [...currentLevels, level];
    
    onFiltersChange({
      ...filters,
      level: newLevels.length > 0 ? newLevels : undefined,
    });
  }, [filters, onFiltersChange]);
  
  // 处理时间范围预设变化
  const handleTimeRangePresetChange = useCallback((preset: TimeRangePreset) => {
    setTimeRangePreset(preset);
    
    if (preset === 'custom') {
      // 切换到自定义模式，不自动更新过滤器
      return;
    }
    
    const now = new Date();
    let startDate: Date;
    
    switch (preset) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case '7days':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30days':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        return;
    }
    
    onFiltersChange({
      ...filters,
      start_date: startDate.toISOString(),
      end_date: now.toISOString(),
    });
  }, [filters, onFiltersChange]);
  
  // 处理自定义时间范围应用
  const handleApplyCustomDateRange = useCallback(() => {
    if (customStartDate && customEndDate) {
      onFiltersChange({
        ...filters,
        start_date: new Date(customStartDate).toISOString(),
        end_date: new Date(customEndDate).toISOString(),
      });
    }
  }, [customStartDate, customEndDate, filters, onFiltersChange]);
  
  // 清除所有过滤器
  const handleClearFilters = useCallback(() => {
    setSearchInput('');
    setTimeRangePreset('7days');
    setCustomStartDate('');
    setCustomEndDate('');
    
    // 重置为默认的 7 天范围
    const now = new Date();
    const startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    onFiltersChange({
      start_date: startDate.toISOString(),
      end_date: now.toISOString(),
    });
  }, [onFiltersChange]);
  
  return (
    <div
      className={cn(
        'bg-[var(--color-background-elevated)]',
        'rounded-[var(--radius-lg)]',
        'border border-[var(--color-text-disabled)] border-opacity-20',
        'p-4 space-y-4',
        className
      )}
    >
      {/* 第一行：搜索和刷新控制 */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* 搜索框 */}
        <div className="flex-1">
          <AppleInput
            type="text"
            placeholder="搜索日志消息..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            leftIcon={Search}
            className="w-full"
          />
        </div>
        
        {/* 刷新控制 */}
        <div className="flex items-center gap-2">
          {/* 手动刷新按钮 */}
          {onRefresh && (
            <AppleButton
              variant="outline"
              size="md"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="flex-shrink-0"
              aria-label="刷新日志"
            >
              <RefreshCw
                className={cn(
                  'w-4 h-4',
                  isRefreshing && 'animate-spin'
                )}
              />
              <span className="hidden sm:inline ml-2">刷新</span>
            </AppleButton>
          )}
          
          {/* 高级过滤器切换 */}
          <AppleButton
            variant="outline"
            size="md"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="flex-shrink-0"
            aria-label="切换高级过滤器"
            aria-expanded={showAdvancedFilters}
          >
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline ml-2">过滤</span>
          </AppleButton>
        </div>
      </div>
      
      {/* 高级过滤器 */}
      {showAdvancedFilters && (
        <div className="space-y-4 pt-4 border-t border-[var(--color-text-disabled)] border-opacity-20">
          {/* 日志级别过滤 */}
          <div>
            <label className="text-sm font-medium text-[var(--color-text-primary)] mb-2 block">
              日志级别
            </label>
            <div className="flex flex-wrap gap-2">
              {LOG_LEVELS.map((level) => {
                const isSelected = filters.level?.includes(level.value);
                return (
                  <button
                    key={level.value}
                    onClick={() => handleLevelToggle(level.value)}
                    className={cn(
                      'px-3 py-1.5 rounded-[var(--radius-md)]',
                      'text-sm font-medium font-mono',
                      'border transition-all duration-200',
                      'focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2',
                      isSelected
                        ? 'border-transparent'
                        : 'border-[var(--color-text-disabled)] border-opacity-30 hover:border-opacity-50'
                    )}
                    style={{
                      color: isSelected ? '#FFFFFF' : level.color,
                      backgroundColor: isSelected ? level.color : 'transparent',
                    }}
                    aria-pressed={isSelected}
                    aria-label={`${isSelected ? '取消选择' : '选择'} ${level.label} 级别`}
                  >
                    {level.label}
                  </button>
                );
              })}
            </div>
          </div>
          
          {/* 时间范围过滤 */}
          <div>
            <label className="text-sm font-medium text-[var(--color-text-primary)] mb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              时间范围
            </label>
            
            {/* 预设选项 */}
            <div className="flex flex-wrap gap-2 mb-3">
              {TIME_RANGE_PRESETS.map((preset) => (
                <button
                  key={preset.value}
                  onClick={() => handleTimeRangePresetChange(preset.value)}
                  className={cn(
                    'px-3 py-1.5 rounded-[var(--radius-md)]',
                    'text-sm font-medium',
                    'border transition-all duration-200',
                    'focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2',
                    timeRangePreset === preset.value
                      ? 'bg-[var(--color-primary)] text-white border-transparent'
                      : 'border-[var(--color-text-disabled)] border-opacity-30 text-[var(--color-text-primary)] hover:border-opacity-50'
                  )}
                  aria-pressed={timeRangePreset === preset.value}
                >
                  {preset.label}
                </button>
              ))}
            </div>
            
            {/* 自定义日期范围 */}
            {timeRangePreset === 'custom' && (
              <div className="flex flex-col sm:flex-row gap-2">
                <AppleInput
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  label="开始日期"
                  className="flex-1"
                />
                <AppleInput
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  label="结束日期"
                  className="flex-1"
                />
                <AppleButton
                  variant="primary"
                  size="md"
                  onClick={handleApplyCustomDateRange}
                  disabled={!customStartDate || !customEndDate}
                  className="self-end"
                >
                  应用
                </AppleButton>
              </div>
            )}
          </div>
          
          {/* 自动刷新设置 */}
          {onAutoRefreshChange && (
            <div className="space-y-3">
              <AppleSwitch
                checked={autoRefresh}
                onCheckedChange={onAutoRefreshChange}
                label="自动刷新"
                description="定期自动刷新日志数据"
              />
              
              {/* 刷新间隔选择 */}
              {autoRefresh && onRefreshIntervalChange && (
                <div className="pl-8">
                  <label className="text-sm font-medium text-[var(--color-text-secondary)] mb-2 block">
                    刷新间隔
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {REFRESH_INTERVALS.map((interval) => (
                      <button
                        key={interval.value}
                        onClick={() => onRefreshIntervalChange(interval.value)}
                        className={cn(
                          'px-3 py-1.5 rounded-[var(--radius-md)]',
                          'text-sm font-medium',
                          'border transition-all duration-200',
                          'focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2',
                          refreshInterval === interval.value
                            ? 'bg-[var(--color-primary)] text-white border-transparent'
                            : 'border-[var(--color-text-disabled)] border-opacity-30 text-[var(--color-text-primary)] hover:border-opacity-50'
                        )}
                        aria-pressed={refreshInterval === interval.value}
                      >
                        {interval.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* 清除过滤器按钮 */}
          <div className="flex justify-end pt-2">
            <AppleButton
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
            >
              清除所有过滤器
            </AppleButton>
          </div>
        </div>
      )}
    </div>
  );
}

export default LogFilterBar;
