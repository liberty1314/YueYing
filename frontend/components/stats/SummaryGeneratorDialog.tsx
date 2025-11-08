/**
 * 总结生成对话框组件
 */
"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { summaryApi } from "@/lib/summary-api";
import { Loader2, Sparkles } from "lucide-react";
import { SummaryDisplay } from "./SummaryDisplay";
import type { Summary } from "@/lib/summary-api";

interface SummaryGeneratorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSummaryGenerated?: (summary: Summary) => void;
}

export function SummaryGeneratorDialog({
  open,
  onOpenChange,
  onSummaryGenerated,
}: SummaryGeneratorDialogProps) {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSummary, setGeneratedSummary] = useState<Summary | null>(null);
  
  // 时间范围选择
  const [periodType, setPeriodType] = useState<"week" | "month" | "year" | "custom">("month");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [customTitle, setCustomTitle] = useState("");

  // 计算快捷时间范围
  const getQuickDateRange = (type: "week" | "month" | "year"): [string, string] => {
    const now = new Date();
    let start: Date;
    let end: Date;

    switch (type) {
      case "week":
        // 本周：从周一到周日
        const dayOfWeek = now.getDay(); // 0 (周日) 到 6 (周六)
        const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // 周日特殊处理
        
        // 本周周一
        start = new Date(now);
        start.setDate(now.getDate() - daysFromMonday);
        start.setHours(0, 0, 0, 0);
        
        // 本周周日
        end = new Date(start);
        end.setDate(start.getDate() + 6);
        end.setHours(23, 59, 59, 999);
        break;
        
      case "month":
        // 本月：当前月份的第一天到最后一天
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();
        
        // 当前月第一天
        start = new Date(currentYear, currentMonth, 1);
        start.setHours(0, 0, 0, 0);
        
        // 当前月最后一天 (下个月的第0天就是当前月的最后一天)
        end = new Date(currentYear, currentMonth + 1, 0);
        end.setHours(23, 59, 59, 999);
        break;
        
      case "year":
        // 今年：当前年份的 1 月 1 日到 12 月 31 日
        const year = now.getFullYear();
        
        // 今年第一天
        start = new Date(year, 0, 1);
        start.setHours(0, 0, 0, 0);
        
        // 今年最后一天
        end = new Date(year, 11, 31);
        end.setHours(23, 59, 59, 999);
        break;
    }

    // 使用本地日期格式化，避免时区转换问题
    const formatDate = (date: Date): string => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    return [
      formatDate(start),
      formatDate(end),
    ];
  };

  // 选择快捷时间范围
  const handleQuickSelect = (type: "week" | "month" | "year") => {
    setPeriodType(type);
    const [start, end] = getQuickDateRange(type);
    setStartDate(start);
    setEndDate(end);
  };

  // 生成总结（异步任务）
  const handleGenerate = async () => {
    // 验证输入
    if (!startDate || !endDate) {
      toast({
        title: "请选择时间范围",
        description: "请点击快捷按钮或手动选择开始和结束日期",
        variant: "destructive",
      });
      return;
    }

    if (new Date(startDate) >= new Date(endDate)) {
      toast({
        title: "日期范围无效",
        description: "开始日期必须早于结束日期",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      // 创建后台任务
      const taskResponse = await summaryApi.generateSummary({
        period_type: periodType,
        start_date: new Date(startDate).toISOString(),
        end_date: new Date(endDate).toISOString(),
        title: customTitle || undefined,
      });

      // 立即关闭对话框
      handleClose();
      
      // 显示任务创建成功的提示
      toast({
        title: "正在生成总结",
        description: "总结正在后台生成中，完成后会通知您",
      });

      // 触发刷新（当任务完成时，通过 WebSocket 通知会再次触发）
      if (onSummaryGenerated) {
        // 不传递 summary，因为还未生成
        // onSummaryGenerated(null);
      }
    } catch (error: any) {
      console.error("Failed to create summary task:", error);
      toast({
        title: "创建任务失败",
        description: error.response?.data?.detail || "创建总结任务时发生错误",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // 关闭对话框时重置状态
  const handleClose = () => {
    setGeneratedSummary(null);
    setPeriodType("month");
    setStartDate("");
    setEndDate("");
    setCustomTitle("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        {generatedSummary ? (
          // 显示生成的总结
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-yellow-500" />
                总结已生成
              </DialogTitle>
              <DialogDescription>
                您可以在历史记录中查看此总结
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4">
              <SummaryDisplay summary={generatedSummary} />
            </div>

            <DialogFooter>
              <Button onClick={handleClose}>关闭</Button>
            </DialogFooter>
          </>
        ) : (
          // 显示生成表单
          <>
            <DialogHeader>
              <DialogTitle>生成智能总结</DialogTitle>
              <DialogDescription>
                选择时间范围，AI将为您生成个性化的观影/阅读总结
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* 快捷选择按钮 */}
              <div className="space-y-2">
                <Label>快捷选择</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={periodType === "week" ? "default" : "outline"}
                    onClick={() => handleQuickSelect("week")}
                    disabled={isGenerating}
                  >
                    本周
                  </Button>
                  <Button
                    type="button"
                    variant={periodType === "month" ? "default" : "outline"}
                    onClick={() => handleQuickSelect("month")}
                    disabled={isGenerating}
                  >
                    本月
                  </Button>
                  <Button
                    type="button"
                    variant={periodType === "year" ? "default" : "outline"}
                    onClick={() => handleQuickSelect("year")}
                    disabled={isGenerating}
                  >
                    今年
                  </Button>
                  <Button
                    type="button"
                    variant={periodType === "custom" ? "default" : "outline"}
                    onClick={() => setPeriodType("custom")}
                    disabled={isGenerating}
                  >
                    自定义
                  </Button>
                </div>
              </div>

              {/* 日期范围选择 */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="start-date">开始日期</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    disabled={isGenerating}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end-date">结束日期</Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    disabled={isGenerating}
                  />
                </div>
              </div>

              {/* 自定义标题 */}
              <div className="space-y-2">
                <Label htmlFor="custom-title">自定义标题（可选）</Label>
                <Input
                  id="custom-title"
                  placeholder="例如：我的春节假期观影总结"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  disabled={isGenerating}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={isGenerating}
              >
                取消
              </Button>
              <Button onClick={handleGenerate} disabled={isGenerating}>
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    生成中...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    生成总结
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

