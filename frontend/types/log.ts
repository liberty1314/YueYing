/**
 * 日志相关类型定义
 */

// 日志级别
export type LogLevel = 
  | 'TRACE'
  | 'DEBUG'
  | 'INFO'
  | 'SUCCESS'
  | 'WARNING'
  | 'ERROR'
  | 'CRITICAL';

// 日志条目
export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  location: string;
  message: string;
  raw_line: string;
  is_multiline: boolean;
}

// 日志过滤器
export interface LogFilter {
  level?: LogLevel | null;
  start_time?: string | null;
  end_time?: string | null;
  keyword?: string | null;
}

// 日志列表响应
export interface LogListResponse {
  logs: LogEntry[];
  total: number;
  page: number;
  page_size: number;
  has_more: boolean;
}

// 日志统计
export interface LogStats {
  total: number;
  by_level: Record<string, number>;
  file_size: number;
  last_update: string | null;
}

// WebSocket 消息类型
export interface LogWebSocketMessage {
  type: 'connected' | 'new_log' | 'pong';
  message?: string;
  data?: LogEntry;
}

// 连接状态
export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';









