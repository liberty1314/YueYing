"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { RecommendationCard } from "./RecommendationCard";
import { recommendationsApi } from "@/lib/recommendations-api";
import type { RecommendationItem } from "@/types/recommendation";
import { Loader2, Sparkles } from "lucide-react";

interface SimilarItemsSectionProps {
  itemId: number;
}

export function SimilarItemsSection({ itemId }: SimilarItemsSectionProps) {
  const [similar, setSimilar] = useState<RecommendationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSimilar = async () => {
      setIsLoading(true);
      try {
        const data = await recommendationsApi.getSimilar(itemId, 10);
        setSimilar(data.recommendations);
      } catch (err: any) {
        console.error("Failed to load similar items:", err);
        // 静默失败，不影响用户体验
      } finally {
        setIsLoading(false);
      }
    };

    loadSimilar();
  }, [itemId]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (similar.length === 0) {
    return null; // 如果没有相似内容，不显示这个区域
  }

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          相似推荐
        </h2>
        
        {/* 横向滚动列表 */}
        <div className="relative -mx-6 px-6">
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {similar.map((item) => (
              <div key={item.item_id} className="w-32 flex-shrink-0">
                <RecommendationCard item={item} showScore={true} />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

