/**
 * 日志相关类型定义
 */

/**
 * 日志级别
 */
export type LogLevel = 'DEBUG' | 'INFO' | 'WARNING' | 'ERROR';

/**
 * 日志条目
 */
export interface LogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  message: string;
  source?: string;
  user_id?: string;
  request_id?: string;
  metadata?: Record<string, any>;
}

/**
 * 日志过滤器
 */
export interface LogFilters {
  level?: LogLevel[];
  start_date?: string;
  end_date?: string;
  search?: string;
  source?: string;
  page?: number;
  page_size?: number;
}

/**
 * 日志级别颜色映射
 */
export const LOG_LEVEL_COLORS: Record<LogLevel, string> = {
  DEBUG: 'var(--color-text-secondary)',
  INFO: 'var(--color-primary)',
  WARNING: 'var(--color-warning)',
  ERROR: 'var(--color-error)',
};

/**
 * 日志级别背景色映射（半透明）
 */
export const LOG_LEVEL_BG_COLORS: Record<LogLevel, string> = {
  DEBUG: 'rgba(152, 152, 157, 0.1)',
  INFO: 'rgba(10, 132, 255, 0.1)',
  WARNING: 'rgba(255, 159, 10, 0.1)',
  ERROR: 'rgba(255, 69, 58, 0.1)',
};
