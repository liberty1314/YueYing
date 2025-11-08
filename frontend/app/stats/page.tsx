"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Container } from "@/components/common/Container";
import { PageHeader } from "@/components/common/PageHeader";
import { Empty } from "@/components/ui/empty";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatsSkeleton } from "@/components/stats/StatsSkeleton";
import { NewOverviewCards } from "@/components/stats/NewOverviewCards";
import { ActivityHeatmap } from "@/components/stats/ActivityHeatmap";
import { RecentActivityCarousel } from "@/components/stats/RecentActivityCarousel";
import { ConsumptionAnalysis } from "@/components/stats/ConsumptionAnalysis";
import { AIInsights } from "@/components/stats/AIInsights";
import { SummaryGeneratorDialog } from "@/components/stats/SummaryGeneratorDialog";
import { SummaryHistory } from "@/components/stats/SummaryHistory";
import { statsApi } from "@/lib/stats-api";
import { useToast } from "@/hooks/use-toast";
import { eventBus, Events } from "@/lib/events";
import type { ComprehensiveStats } from "@/types/stats";
import { Sparkles } from "lucide-react";

export default function StatsPage() {
  const router = useRouter();
  const { status: sessionStatus } = useSession();
  const { toast } = useToast();

  const [stats, setStats] = useState<ComprehensiveStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // 智能总结相关状态
  const [showSummaryDialog, setShowSummaryDialog] = useState(false);
  const [summaryRefresh, setSummaryRefresh] = useState(0);

  const loadStats = async () => {
    if (sessionStatus !== "authenticated") {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await statsApi.getComprehensiveStats("month", 12);
      setStats(data);
    } catch (err: any) {
      console.error("Failed to load stats:", err);
      setError("加载统计数据失败");
      toast({
        title: "加载失败",
        description: "无法加载统计数据",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 检查登录状态
  useEffect(() => {
    if (sessionStatus === "unauthenticated") {
      // 未登录，提示并重定向到登录页面
      toast({
        title: "需要登录",
        description: "请先登录才能查看统计数据",
        variant: "default",
      });
      router.push("/login");
    }
  }, [sessionStatus, router]);

  useEffect(() => {
    if (sessionStatus === "authenticated") {
      loadStats();
    }
  }, [sessionStatus]);
  
  // 监听全局事件 - 当总结生成完成时刷新历史列表
  // 注意：通知已经在全局组件中统一处理了，这里只负责刷新本页面的历史列表
  useEffect(() => {
    const unsubscribeGenerated = eventBus.on(Events.SUMMARY_GENERATED, () => {
      // 刷新历史列表
      setSummaryRefresh((prev) => prev + 1);
    });
    
    const unsubscribeFailed = eventBus.on(Events.SUMMARY_FAILED, () => {
      // 失败时也可能需要刷新列表（如果有失败记录的话）
      setSummaryRefresh((prev) => prev + 1);
    });
    
    return () => {
      unsubscribeGenerated();
      unsubscribeFailed();
    };
  }, []);

  if (sessionStatus === "loading" || isLoading) {
    return <StatsSkeleton />;
  }

  if (sessionStatus === "unauthenticated") {
    return null; // 会被useEffect重定向
  }

  if (error || !stats) {
    return (
      <Container className="py-8 text-center">
        <Empty
          title="加载失败"
          description={error || "无法加载统计数据"}
        />
      </Container>
    );
  }

  // 如果没有数据
  if (stats.overview.total_items === 0) {
    return (
      <Container className="py-8 text-center">
        <Empty
          title="暂无数据"
          description="你还没有添加任何记录，快去探索页面添加吧！"
        />
      </Container>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-background">
      <Container className="py-8">
        <div className="flex items-center justify-between mb-6">
          <PageHeader
            title="个人仪表盘"
            description="可视化你的活动、偏好和个性化洞察"
          />
          <Button
            onClick={() => setShowSummaryDialog(true)}
            className="gap-2"
          >
            <Sparkles className="h-4 w-4" />
            生成总结
          </Button>
        </div>

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList>
            <TabsTrigger value="dashboard">数据统计</TabsTrigger>
            <TabsTrigger value="summaries">历史总结</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {/* 模块一：数据总览 */}
            <NewOverviewCards overview={stats.overview} />

            {/* 模块二：活动日历热力图 */}
            <ActivityHeatmap data={stats.activity_heatmap} />

            {/* 模块三：最近浏览 */}
            <RecentActivityCarousel activities={stats.recent_activities} />

            {/* 双栏布局：消费分析 + AI洞察 */}
            <div className="grid gap-6 lg:grid-cols-3">
              {/* 模块四：消费分析（占2列） */}
              <div className="lg:col-span-2">
                <ConsumptionAnalysis
                  typeDistribution={stats.type_distribution}
                  tagStats={stats.top_tags}
                  yearDistribution={stats.year_distribution}
                />
              </div>

              {/* 模块五：AI洞察（占1列） */}
              <div className="lg:col-span-1">
                <AIInsights stats={stats} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="summaries">
            <SummaryHistory refresh={summaryRefresh} />
          </TabsContent>
        </Tabs>

        {/* 总结生成对话框 */}
        <SummaryGeneratorDialog
          open={showSummaryDialog}
          onOpenChange={setShowSummaryDialog}
          onSummaryGenerated={() => {
            // 刷新历史列表
            setSummaryRefresh((prev) => prev + 1);
          }}
        />
      </Container>
    </div>
  );
}

