/**
 * LogViewer - 日志查看器组件
 * 
 * 实时展示和过滤系统日志
 * 
 * 功能：
 * - 日志列表渲染（时间戳、级别、消息、来源）
 * - 日志级别颜色标识
 * - 时间戳相对时间显示
 * - 日志详情展开功能
 * - 等宽字体显示
 * - 复制日志功能
 * 
 * 验证需求: 7.1, 7.5, 7.7
 */

'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, Copy, Check } from 'lucide-react';
import { cn, formatRelativeTime, copyToClipboard } from '@/lib/utils';
import { LogEntry, LOG_LEVEL_COLORS, LOG_LEVEL_BG_COLORS } from '@/types/log';

/**
 * LogViewer 组件属性
 */
export interface LogViewerProps {
  /**
   * 日志条目列表
   */
  logs: LogEntry[];
  
  /**
   * 是否正在加载
   */
  loading?: boolean;
  
  /**
   * 容器高度（像素）
   * @default 600
   */
  height?: number;
  
  /**
   * 自定义类名
   */
  className?: string;
}

/**
 * 日志行组件属性
 */
interface LogRowProps {
  log: LogEntry;
  style: React.CSSProperties;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

/**
 * 日志行组件
 */
function LogRow({ log, style, isExpanded, onToggleExpand }: LogRowProps) {
  const [copied, setCopied] = useState(false);
  
  // 处理复制日志
  const handleCopy = async () => {
    const logText = `[${log.timestamp}] [${log.level}] ${log.source ? `[${log.source}] ` : ''}${log.message}`;
    const success = await copyToClipboard(logText);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };
  
  // 检查是否有额外的元数据
  const hasMetadata = log.metadata && Object.keys(log.metadata).length > 0;
  const hasDetails = hasMetadata || log.user_id || log.request_id;
  
  return (
    <div
      style={style}
      className={cn(
        'border-b border-[var(--color-text-disabled)] border-opacity-20',
        'hover:bg-[var(--color-background-paper)] transition-colors duration-150',
        'group'
      )}
    >
      {/* 主日志行 */}
      <div className="flex items-start gap-3 px-4 py-3">
        {/* 展开/折叠按钮 */}
        {hasDetails && (
          <button
            onClick={onToggleExpand}
            className={cn(
              'flex-shrink-0 mt-0.5 p-0.5 rounded',
              'text-[var(--color-text-secondary)]',
              'hover:text-[var(--color-text-primary)] hover:bg-[var(--color-background-elevated)]',
              'transition-all duration-150'
            )}
            aria-label={isExpanded ? '折叠详情' : '展开详情'}
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
        )}
        
        {/* 如果没有详情，添加占位符保持对齐 */}
        {!hasDetails && <div className="w-5 flex-shrink-0" />}
        
        {/* 时间戳 */}
        <div className="flex-shrink-0 w-32">
          <time
            className="text-xs font-mono text-[var(--color-text-secondary)]"
            dateTime={log.timestamp}
            title={new Date(log.timestamp).toLocaleString('zh-CN')}
          >
            {formatRelativeTime(log.timestamp)}
          </time>
        </div>
        
        {/* 日志级别徽章 */}
        <div className="flex-shrink-0">
          <span
            className={cn(
              'inline-flex items-center justify-center',
              'px-2 py-0.5 rounded text-xs font-medium font-mono',
              'min-w-[70px]'
            )}
            style={{
              color: LOG_LEVEL_COLORS[log.level],
              backgroundColor: LOG_LEVEL_BG_COLORS[log.level],
            }}
          >
            {log.level}
          </span>
        </div>
        
        {/* 来源 */}
        {log.source && (
          <div className="flex-shrink-0 max-w-[120px]">
            <span className="text-xs font-mono text-[var(--color-text-secondary)] truncate block">
              {log.source}
            </span>
          </div>
        )}
        
        {/* 日志消息 */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-mono text-[var(--color-text-primary)] break-words">
            {log.message}
          </p>
        </div>
        
        {/* 复制按钮 */}
        <button
          onClick={handleCopy}
          className={cn(
            'flex-shrink-0 p-1.5 rounded',
            'text-[var(--color-text-secondary)]',
            'opacity-0 group-hover:opacity-100',
            'hover:text-[var(--color-text-primary)] hover:bg-[var(--color-background-elevated)]',
            'transition-all duration-150'
          )}
          aria-label="复制日志"
        >
          {copied ? (
            <Check className="w-4 h-4 text-[var(--color-success)]" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </button>
      </div>
      
      {/* 展开的详情 */}
      {isExpanded && hasDetails && (
        <div className="px-4 pb-3 pl-[4.5rem] space-y-2 bg-[var(--color-background-paper)] bg-opacity-50">
          {/* User ID */}
          {log.user_id && (
            <div className="flex gap-2">
              <span className="text-xs font-mono text-[var(--color-text-secondary)] font-medium">
                User ID:
              </span>
              <span className="text-xs font-mono text-[var(--color-text-primary)]">
                {log.user_id}
              </span>
            </div>
          )}
          
          {/* Request ID */}
          {log.request_id && (
            <div className="flex gap-2">
              <span className="text-xs font-mono text-[var(--color-text-secondary)] font-medium">
                Request ID:
              </span>
              <span className="text-xs font-mono text-[var(--color-text-primary)]">
                {log.request_id}
              </span>
            </div>
          )}
          
          {/* Metadata */}
          {hasMetadata && (
            <div className="space-y-1">
              <span className="text-xs font-mono text-[var(--color-text-secondary)] font-medium">
                Metadata:
              </span>
              <pre className="text-xs font-mono text-[var(--color-text-primary)] bg-[var(--color-background-elevated)] rounded p-2 overflow-x-auto">
                {JSON.stringify(log.metadata, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * LogViewer 日志查看器组件
 * 
 * 展示系统日志列表，支持日志详情展开和复制功能。
 * 
 * @component
 * @example
 * ```tsx
 * // 基础用法
 * <LogViewer logs={logs} />
 * 
 * // 自定义高度
 * <LogViewer logs={logs} height={800} />
 * 
 * // 加载状态
 * <LogViewer logs={logs} loading={isLoading} />
 * ```
 */
export function LogViewer({
  logs,
  loading = false,
  height = 600,
  className,
}: LogViewerProps) {
  // 展开状态管理
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  
  // 切换展开状态
  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };
  

  
  // 加载状态
  if (loading) {
    return (
      <div
        className={cn(
          'flex items-center justify-center',
          'bg-[var(--color-background-elevated)]',
          'rounded-[var(--radius-lg)]',
          'border border-[var(--color-text-disabled)] border-opacity-20',
          className
        )}
        style={{ height }}
      >
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-[var(--color-text-secondary)]">加载日志中...</p>
        </div>
      </div>
    );
  }
  
  // 空状态
  if (logs.length === 0) {
    return (
      <div
        className={cn(
          'flex items-center justify-center',
          'bg-[var(--color-background-elevated)]',
          'rounded-[var(--radius-lg)]',
          'border border-[var(--color-text-disabled)] border-opacity-20',
          className
        )}
        style={{ height }}
      >
        <div className="text-center space-y-2">
          <p className="text-sm text-[var(--color-text-secondary)]">暂无日志</p>
        </div>
      </div>
    );
  }
  
  return (
    <div
      className={cn(
        'bg-[var(--color-background-elevated)]',
        'rounded-[var(--radius-lg)]',
        'border border-[var(--color-text-disabled)] border-opacity-20',
        'overflow-hidden',
        className
      )}
    >
      {/* 表头 */}
      <div className="flex items-center gap-3 px-4 py-3 bg-[var(--color-background-paper)] border-b border-[var(--color-text-disabled)] border-opacity-20">
        <div className="w-5 flex-shrink-0" />
        <div className="flex-shrink-0 w-32">
          <span className="text-xs font-medium text-[var(--color-text-secondary)]">时间</span>
        </div>
        <div className="flex-shrink-0 min-w-[70px]">
          <span className="text-xs font-medium text-[var(--color-text-secondary)]">级别</span>
        </div>
        <div className="flex-shrink-0 w-[120px]">
          <span className="text-xs font-medium text-[var(--color-text-secondary)]">来源</span>
        </div>
        <div className="flex-1">
          <span className="text-xs font-medium text-[var(--color-text-secondary)]">消息</span>
        </div>
        <div className="w-8 flex-shrink-0" />
      </div>
      
      {/* 日志列表 */}
      <div 
        className="overflow-y-auto"
        style={{ height: height - 48 }}
      >
        {logs.map((log) => {
          const isExpanded = expandedIds.has(log.id);
          return (
            <LogRow
              key={log.id}
              log={log}
              style={{}}
              isExpanded={isExpanded}
              onToggleExpand={() => toggleExpand(log.id)}
            />
          );
        })}
      </div>
    </div>
  );
}

export default LogViewer;
