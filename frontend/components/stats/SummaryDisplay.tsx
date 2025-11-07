/**
 * 总结展示组件
 */
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { KeywordCloud } from "./KeywordCloud";
import type { Summary } from "@/lib/summary-api";
import { Calendar, BarChart3, Star, Hash } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface SummaryDisplayProps {
  summary: Summary;
}

export function SummaryDisplay({ summary }: SummaryDisplayProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const periodTypeNames: Record<string, string> = {
    week: "周总结",
    month: "月度总结",
    year: "年度总结",
    custom: "自定义时段",
  };

  return (
    <div className="space-y-6">
      {/* 标题和时间范围 */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold">{summary.title}</h2>
          <Badge variant="outline">
            {periodTypeNames[summary.period_type] || summary.period_type}
          </Badge>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>
            {formatDate(summary.start_date)} - {formatDate(summary.end_date)}
          </span>
        </div>
      </div>

      {/* 统计数据卡片 */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">记录总数</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary.statistics.total_items}
            </div>
            <p className="text-xs text-muted-foreground">
              这段时间的活动记录
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">平均评分</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary.statistics.avg_rating.toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">
              满分5.0分
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">关键词数</CardTitle>
            <Hash className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary.keywords.length}
            </div>
            <p className="text-xs text-muted-foreground">
              提取的热门标签
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 总结文本 */}
      <Card>
        <CardHeader>
          <CardTitle>总结内容</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <ReactMarkdown>{summary.summary_text}</ReactMarkdown>
          </div>
        </CardContent>
      </Card>

      {/* 关键词云 */}
      {summary.keywords.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>关键词云</CardTitle>
          </CardHeader>
          <CardContent>
            <KeywordCloud keywords={summary.keywords} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

