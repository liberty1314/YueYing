/**
 * 历史总结列表组件
 */
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { summaryApi } from "@/lib/summary-api";
import type { Summary } from "@/lib/summary-api";
import { Calendar, Trash2, Eye, Loader2 } from "lucide-react";
import { SummaryDisplay } from "./SummaryDisplay";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface SummaryHistoryProps {
  refresh?: number; // 用于触发刷新
}

export function SummaryHistory({ refresh }: SummaryHistoryProps) {
  const { toast } = useToast();
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  // 查看详情
  const [viewingSummary, setViewingSummary] = useState<Summary | null>(null);
  
  // 删除确认
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // 加载总结列表
  const loadSummaries = async () => {
    setIsLoading(true);
    try {
      const response = await summaryApi.getSummaries(page, pageSize);
      setSummaries(response.summaries);
      setTotal(response.total);
    } catch (error: any) {
      console.error("Failed to load summaries:", error);
      toast({
        title: "加载失败",
        description: "无法加载历史总结",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSummaries();
  }, [page, refresh]);

  // 删除总结
  const handleDelete = async (id: number) => {
    setIsDeleting(true);
    try {
      await summaryApi.deleteSummary(id);
      toast({
        title: "删除成功",
        description: "总结已删除",
      });
      // 重新加载列表
      loadSummaries();
      setDeletingId(null);
    } catch (error: any) {
      console.error("Failed to delete summary:", error);
      toast({
        title: "删除失败",
        description: error.response?.data?.detail || "删除总结时发生错误",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const periodTypeNames: Record<string, string> = {
    week: "周总结",
    month: "月总结",
    year: "年总结",
    custom: "自定义",
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (summaries.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-muted-foreground">暂无历史总结</p>
          <p className="text-sm text-muted-foreground mt-2">
            点击"生成总结"按钮创建您的第一份总结
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {summaries.map((summary) => (
          <Card key={summary.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">
                      {summary.title}
                    </CardTitle>
                    <Badge variant="secondary">
                      {periodTypeNames[summary.period_type]}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {formatDate(summary.start_date)} - {formatDate(summary.end_date)}
                      </span>
                    </div>
                    <span>•</span>
                    <span>
                      {summary.statistics.total_items} 条记录
                    </span>
                    <span>•</span>
                    <span>
                      {summary.keywords.length} 个关键词
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setViewingSummary(summary)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    查看
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setDeletingId(summary.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {summary.summary_text.substring(0, 150)}...
              </p>
            </CardContent>
          </Card>
        ))}

        {/* 分页 */}
        {total > pageSize && (
          <div className="flex justify-center gap-2 mt-6">
            <Button
              variant="outline"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              上一页
            </Button>
            <span className="flex items-center px-4 text-sm text-muted-foreground">
              第 {page} 页，共 {Math.ceil(total / pageSize)} 页
            </span>
            <Button
              variant="outline"
              disabled={page >= Math.ceil(total / pageSize)}
              onClick={() => setPage(page + 1)}
            >
              下一页
            </Button>
          </div>
        )}
      </div>

      {/* 查看详情对话框 */}
      <Dialog open={!!viewingSummary} onOpenChange={() => setViewingSummary(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>总结详情</DialogTitle>
          </DialogHeader>
          {viewingSummary && (
            <div className="py-4">
              <SummaryDisplay summary={viewingSummary} />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 删除确认对话框 */}
      <AlertDialog
        open={!!deletingId}
        onOpenChange={() => !isDeleting && setDeletingId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              您确定要删除这份总结吗？此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingId && handleDelete(deletingId)}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  删除中...
                </>
              ) : (
                "删除"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

