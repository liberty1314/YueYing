"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, ChevronDown, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import type { LogEntry, LogLevel } from "@/types/log";
import { cn } from "@/lib/utils";

interface LogViewerProps {
  logs: LogEntry[];
  autoScroll?: boolean;
  maxHeight?: string;
  messageDisplayMode?: 'truncate' | 'full'; // 'truncate' - 截断显示，'full' - 全部显示
}

// 日志级别颜色映射
const levelColors: Record<LogLevel, string> = {
  TRACE: "bg-gray-500 hover:bg-gray-600",
  DEBUG: "bg-blue-500 hover:bg-blue-600",
  INFO: "bg-green-500 hover:bg-green-600",
  SUCCESS: "bg-emerald-500 hover:bg-emerald-600",
  WARNING: "bg-yellow-500 hover:bg-yellow-600",
  ERROR: "bg-red-500 hover:bg-red-600",
  CRITICAL: "bg-purple-500 hover:bg-purple-600",
};

const levelTextColors: Record<LogLevel, string> = {
  TRACE: "text-gray-600 dark:text-gray-400",
  DEBUG: "text-blue-600 dark:text-blue-400",
  INFO: "text-green-600 dark:text-green-400",
  SUCCESS: "text-emerald-600 dark:text-emerald-400",
  WARNING: "text-yellow-600 dark:text-yellow-400",
  ERROR: "text-red-600 dark:text-red-400",
  CRITICAL: "text-purple-600 dark:text-purple-400",
};

// 列宽调整器组件
interface ColumnResizerProps {
  onResize: (width: number) => void;
  minWidth?: number;
}

function ColumnResizer({ onResize, minWidth = 80 }: ColumnResizerProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startWidth, setStartWidth] = useState(0);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.clientX);
    const rect = (e.currentTarget as HTMLElement).parentElement?.getBoundingClientRect();
    if (rect) {
      setStartWidth(rect.width);
    }
    e.preventDefault();
  }, []);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startX;
      const newWidth = Math.max(startWidth + deltaX, minWidth);
      onResize(newWidth);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, startX, startWidth, minWidth, onResize]);

  return (
    <div
      className={cn(
        "absolute right-0 top-0 bottom-0 w-1 cursor-col-resize bg-border hover:bg-primary/50 transition-colors",
        isDragging && "bg-primary"
      )}
      onMouseDown={handleMouseDown}
    />
  );
}

// 可调整列宽的表头组件
interface ResizableHeaderProps {
  width: number;
  onResize: (width: number) => void;
  minWidth?: number;
  children: React.ReactNode;
  className?: string;
}

function ResizableHeader({ width, onResize, minWidth = 80, children, className }: ResizableHeaderProps) {
  return (
    <div
      className={cn("relative flex-shrink-0 text-sm font-semibold text-muted-foreground", className)}
      style={{ width: `${width}px` }}
    >
      <div className="pr-2">{children}</div>
      <ColumnResizer onResize={onResize} minWidth={minWidth} />
    </div>
  );
}

function LogItem({ log, index, messageDisplayMode, columnWidths }: {
  log: LogEntry;
  index: number;
  messageDisplayMode: 'truncate' | 'full';
  columnWidths: Record<string, number>;
}) {
  const [expanded, setExpanded] = useState(false);
  const { toast } = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText(log.raw_line);
    toast({
      title: "已复制",
      description: "日志内容已复制到剪贴板",
    });
  };

  const isMultiline = log.is_multiline || log.message.includes("\n");
  const messageLines = log.message.split("\n");
  const shouldTruncate = messageLines.length > 1;

  return (
    <div
      className={cn(
        "group border-b hover:bg-accent/50 transition-colors",
        index % 2 === 0 ? "bg-background" : "bg-muted/30"
      )}
    >
      <div className="flex items-start p-3" style={{ gap: '12px' }}>
        {/* 展开/收起按钮（多行日志） */}
        <div className="flex-shrink-0 mt-1" style={{ width: `${columnWidths.expand}px` }}>
          {shouldTruncate && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-muted-foreground hover:text-foreground"
            >
              {expanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
          )}
        </div>

        {/* 时间戳 */}
        <div className="flex-shrink-0 text-sm text-muted-foreground font-mono" style={{ width: `${columnWidths.timestamp}px` }}>
          {format(new Date(log.timestamp), "yyyy-MM-dd HH:mm:ss.SSS", { locale: zhCN })}
        </div>

        {/* 日志级别徽章 */}
        <div className="flex-shrink-0" style={{ width: `${columnWidths.level}px` }}>
          <Badge
            className={cn(
              "font-mono text-white font-semibold",
              levelColors[log.level as LogLevel] || "bg-gray-500"
            )}
          >
            {log.level}
          </Badge>
        </div>

        {/* 位置 */}
        <div className="flex-shrink-0 text-sm text-muted-foreground font-mono truncate" style={{ width: `${columnWidths.location}px` }}>
          {log.location}
        </div>

        {/* 消息内容 */}
        <div className="flex-1 min-w-0" style={{ minWidth: `${columnWidths.message}px` }}>
          <div
            className={cn(
              "text-sm font-mono",
              levelTextColors[log.level as LogLevel] || "text-foreground",
              messageDisplayMode === 'full' ? "break-words" : "truncate"
            )}
          >
            {messageDisplayMode === 'full' ? (
              // 全部显示模式
              <pre className="whitespace-pre-wrap">{log.message}</pre>
            ) : (
              // 截断模式
              shouldTruncate ? (
                expanded ? (
                  <pre className="whitespace-pre-wrap">{log.message}</pre>
                ) : (
                  <div className="truncate">
                    {log.message.length > 200 ? `${log.message.substring(0, 200)}...` : log.message}
                  </div>
                )
              ) : (
                <div className="truncate">
                  {log.message.length > 200 ? `${log.message.substring(0, 200)}...` : log.message}
                </div>
              )
            )}
          </div>
          {messageDisplayMode === 'truncate' && shouldTruncate && !expanded && (
            <div className="text-xs text-muted-foreground mt-1">
              +{messageLines.length - 1} 更多行
            </div>
          )}
        </div>

        {/* 复制按钮 */}
        <div className="flex-shrink-0" style={{ width: `${columnWidths.actions}px` }}>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handleCopy}
          >
            <Copy className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// 默认列宽（单位：px）
const DEFAULT_COLUMN_WIDTHS = {
  expand: 16, // 展开按钮列
  timestamp: 192, // 时间戳列
  level: 96, // 级别列
  location: 256, // 位置列
  message: 400, // 消息列（最小宽度）
  actions: 32, // 操作列
};

// 本地存储键
const COLUMN_WIDTHS_STORAGE_KEY = 'log-viewer-column-widths';

export function LogViewer({ logs, autoScroll = false, maxHeight = "600px", messageDisplayMode = 'truncate' }: LogViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(autoScroll);

  // 列宽状态
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(COLUMN_WIDTHS_STORAGE_KEY);
      if (saved) {
        try {
          return { ...DEFAULT_COLUMN_WIDTHS, ...JSON.parse(saved) };
        } catch {
          return DEFAULT_COLUMN_WIDTHS;
        }
      }
    }
    return DEFAULT_COLUMN_WIDTHS;
  });

  // 保存列宽到本地存储
  const saveColumnWidths = useCallback((widths: Record<string, number>) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(COLUMN_WIDTHS_STORAGE_KEY, JSON.stringify(widths));
    }
  }, []);

  // 更新列宽
  const updateColumnWidth = useCallback((column: string, width: number) => {
    const newWidths = { ...columnWidths, [column]: Math.max(width, 80) }; // 最小宽度80px
    setColumnWidths(newWidths);
    saveColumnWidths(newWidths);
  }, [columnWidths, saveColumnWidths]);

  // 自动滚动到底部
  useEffect(() => {
    if (shouldAutoScroll && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs, shouldAutoScroll]);

  // 检测用户是否手动滚动
  const handleScroll = () => {
    if (!containerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;

    // 如果用户滚动到底部，启用自动滚动；否则禁用
    if (isAtBottom !== shouldAutoScroll) {
      setShouldAutoScroll(isAtBottom);
    }
  };

  if (logs.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">暂无日志数据</p>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      {/* 表头 */}
      <div className="bg-muted/50 border-b px-3 py-2 flex items-center text-sm font-semibold text-muted-foreground" style={{ gap: '12px' }}>
        <div className="flex-shrink-0" style={{ width: `${columnWidths.expand}px` }}></div>
        <ResizableHeader
          width={columnWidths.timestamp}
          onResize={(width) => updateColumnWidth('timestamp', width)}
          minWidth={120}
        >
          时间
        </ResizableHeader>
        <ResizableHeader
          width={columnWidths.level}
          onResize={(width) => updateColumnWidth('level', width)}
          minWidth={80}
        >
          级别
        </ResizableHeader>
        <ResizableHeader
          width={columnWidths.location}
          onResize={(width) => updateColumnWidth('location', width)}
          minWidth={150}
        >
          位置
        </ResizableHeader>
        <ResizableHeader
          width={columnWidths.message}
          onResize={(width) => updateColumnWidth('message', width)}
          minWidth={200}
          className="flex-1"
        >
          消息
        </ResizableHeader>
        <div className="flex-shrink-0" style={{ width: `${columnWidths.actions}px` }}></div>
      </div>

      {/* 日志列表 */}
      <div
        ref={containerRef}
        className="overflow-y-auto"
        style={{ maxHeight }}
        onScroll={handleScroll}
      >
        {logs.map((log, index) => (
          <LogItem
            key={`${log.timestamp}-${index}`}
            log={log}
            index={index}
            messageDisplayMode={messageDisplayMode}
            columnWidths={columnWidths}
          />
        ))}
      </div>

      {/* 底部状态栏 */}
      <div className="bg-muted/50 border-t px-4 py-2 flex items-center justify-between text-sm text-muted-foreground">
        <span>共 {logs.length} 条日志</span>
        {autoScroll && (
          <span className={shouldAutoScroll ? "text-green-600" : "text-yellow-600"}>
            {shouldAutoScroll ? "✓ 自动滚动" : "⚠ 手动滚动"}
          </span>
        )}
      </div>
    </Card>
  );
}









