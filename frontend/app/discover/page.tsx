"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Container } from "@/components/common/Container";
import { RecommendationList } from "@/components/recommendations/RecommendationList";
import { recommendationsApi } from "@/lib/recommendations-api";
import type { RecommendationItem } from "@/types/recommendation";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";

export default function DiscoverPage() {
  const router = useRouter();
  const { status } = useSession();
  const { toast } = useToast();
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);

  const loadRecommendations = async (append: boolean = false) => {
    if (!append) setIsLoading(true);
    
    try {
      const data = await recommendationsApi.getDiscover(20);
      
      if (append) {
        setRecommendations((prev) => [...prev, ...data.recommendations]);
      } else {
        setRecommendations(data.recommendations);
      }
      
      // 如果返回的数量少于请求的，说明没有更多了
      setHasMore(data.recommendations.length >= 20);
    } catch (err: any) {
      console.error("Failed to load discover recommendations:", err);
      toast({
        title: "加载失败",
        description: err.response?.data?.detail || "无法加载探索内容",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 检查登录状态
  useEffect(() => {
    if (status === "unauthenticated") {
      // 未登录，提示并重定向到登录页面
      toast({
        title: "需要登录",
        description: "请先登录才能访问探索发现页面",
        variant: "default",
      });
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      loadRecommendations();
    }
  }, [status]);

  const handleLoadMore = () => {
    loadRecommendations(true);
  };

  // 加载中或未登录时显示加载状态
  if (status === "loading") {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // 如果未登录，不渲染内容（会被useEffect重定向）
  if (status === "unauthenticated") {
    return null;
  }

  return (
    <Container className="py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2 mb-2">
          <Sparkles className="h-8 w-8" />
          探索发现
        </h1>
        <p className="text-muted-foreground">
          根据你的喜好，为你推荐更多精彩内容
        </p>
      </div>

      <RecommendationList
        items={recommendations}
        isLoading={isLoading}
        showScore={true}
        emptyMessage="暂无推荐内容，添加更多记录后会有更精准的推荐哦~"
      />

      {!isLoading && recommendations.length > 0 && hasMore && (
        <div className="mt-8 text-center">
          <Button onClick={handleLoadMore} variant="outline">
            加载更多
          </Button>
        </div>
      )}
    </Container>
  );
}

