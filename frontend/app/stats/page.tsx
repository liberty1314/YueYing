"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Container } from "@/components/common/Container";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Empty } from "@/components/ui/empty";
import { Loading } from "@/components/ui/loading";
import { OverviewCards } from "@/components/stats/OverviewCards";
import { TypeDistributionChart } from "@/components/stats/TypeDistributionChart";
import { StatusDistributionChart } from "@/components/stats/StatusDistributionChart";
import { RatingDistributionChart } from "@/components/stats/RatingDistributionChart";
import { TimeTrendChart } from "@/components/stats/TimeTrendChart";
import { TopTagsCloud } from "@/components/stats/TopTagsCloud";
import { statsApi } from "@/lib/stats-api";
import { useToast } from "@/hooks/use-toast";
import type { ComprehensiveStats } from "@/types/stats";

export default function StatsPage() {
  const { data: session, status: sessionStatus } = useSession();
  const { toast } = useToast();

  const [stats, setStats] = useState<ComprehensiveStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    loadStats();
  }, [sessionStatus]);

  if (sessionStatus === "loading" || isLoading) {
    return <Loading />;
  }

  if (sessionStatus === "unauthenticated") {
    return (
      <Container className="py-8 text-center">
        <Empty
          title="请登录"
          description="登录后才能查看你的统计数据。"
          action={
            <a href="/auth/login" className="text-primary hover:underline">
              前往登录
            </a>
          }
        />
      </Container>
    );
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
          action={
            <a href="/explore" className="text-primary hover:underline">
              前往探索
            </a>
          }
        />
      </Container>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-background">
      <Container className="py-8">
        <PageHeader
          title="数据统计"
          description="查看你的观看记录统计数据和趋势分析"
        />

        <div className="mt-6 space-y-6">
          {/* 概览卡片 */}
          <OverviewCards overview={stats.overview} />

          {/* 分布图表 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 类型分布 */}
            <TypeDistributionChart data={stats.type_distribution} />

            {/* 状态分布 */}
            <StatusDistributionChart data={stats.status_distribution} />
          </div>

          {/* 评分分布 */}
          <RatingDistributionChart data={stats.rating_distribution} />

          {/* 时间趋势 */}
          <TimeTrendChart data={stats.time_trend} />

          {/* 热门标签 */}
          {stats.top_tags.length > 0 && <TopTagsCloud data={stats.top_tags} />}
        </div>
      </Container>
    </div>
  );
}

