"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { recommendationsApi } from "@/lib/recommendations-api";
import { RecommendationCard } from "@/components/recommendations/RecommendationCard";
import type { RecommendationItem } from "@/types/recommendation";
import { Sparkles, Loader2, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/store/authStore";

export function RecommendationsSection() {
  const { toast } = useToast();
  const { isAuthenticated } = useAuthStore();
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // 修复 Hydration 问题
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const loadRecommendations = async () => {
    // 未登录用户不加载推荐
    if (!isAuthenticated || !isMounted) {
      setIsLoading(false);
      return;
    }

    try {
      const data = await recommendationsApi.getForYou(10, "switch");
      setRecommendations(data.recommendations);
    } catch (err: any) {
      console.error("Failed to load recommendations:", err);
      // 如果是401错误，说明用户未登录，不显示toast
      if (err.response?.status !== 401) {
        toast({
          title: "加载失败",
          description: "无法加载推荐内容",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    // 等待组件挂载并确保已登录
    if (isMounted) {
      loadRecommendations();
    }
  }, [isAuthenticated, isMounted]);
  
  // 退出登录时清理数据
  useEffect(() => {
    if (!isAuthenticated) {
      setRecommendations([]);
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadRecommendations();
  };

  // 未挂载或未登录用户不显示推荐区域
  if (!isMounted || !isAuthenticated) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (recommendations.length === 0) {
    return null; // 如果没有推荐，不显示这个区域
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Sparkles className="h-6 w-6" />
          为你推荐
        </h2>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          {isRefreshing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              刷新中...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              换一批
            </>
          )}
        </Button>
      </div>

      {/* 水平滚动列表 */}
      <div className="relative">
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {recommendations.map((item) => (
            <div key={item.item_id} className="w-40 flex-shrink-0">
              <RecommendationCard item={item} showScore={true} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

