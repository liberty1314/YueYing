"use client";

import { useEffect, useRef, useState } from "react";
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

function LogItem({ log, index }: { log: LogEntry; index: number }) {
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
      <div className="flex items-start gap-3 p-3">
        {/* 展开/收起按钮（多行日志） */}
        <div className="w-4 flex-shrink-0 mt-1">
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
        <div className="w-48 flex-shrink-0 text-sm text-muted-foreground font-mono">
          {format(new Date(log.timestamp), "yyyy-MM-dd HH:mm:ss.SSS", { locale: zhCN })}
        </div>

        {/* 日志级别徽章 */}
        <div className="w-24 flex-shrink-0">
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
        <div className="w-64 flex-shrink-0 text-sm text-muted-foreground font-mono truncate">
          {log.location}
        </div>

        {/* 消息内容 */}
        <div className="flex-1 min-w-0">
          <div
            className={cn(
              "text-sm font-mono break-words",
              levelTextColors[log.level as LogLevel] || "text-foreground"
            )}
          >
            {expanded || !shouldTruncate ? (
              <pre className="whitespace-pre-wrap">{log.message}</pre>
            ) : (
              <div className="truncate">{messageLines[0]}</div>
            )}
          </div>
          {shouldTruncate && !expanded && (
            <div className="text-xs text-muted-foreground mt-1">
              +{messageLines.length - 1} 更多行
            </div>
          )}
        </div>

        {/* 复制按钮 */}
        <div className="w-8 flex-shrink-0">
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

export function LogViewer({ logs, autoScroll = false, maxHeight = "600px" }: LogViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(autoScroll);

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
      <div className="bg-muted/50 border-b px-3 py-2 flex items-center gap-3 text-sm font-semibold text-muted-foreground">
        <div className="w-4 flex-shrink-0"></div>
        <div className="w-48 flex-shrink-0">时间</div>
        <div className="w-24 flex-shrink-0">级别</div>
        <div className="w-64 flex-shrink-0">位置</div>
        <div className="flex-1">消息</div>
        <div className="w-8 flex-shrink-0"></div>
      </div>

      {/* 日志列表 */}
      <div
        ref={containerRef}
        className="overflow-y-auto"
        style={{ maxHeight }}
        onScroll={handleScroll}
      >
        {logs.map((log, index) => (
          <LogItem key={`${log.timestamp}-${index}`} log={log} index={index} />
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









