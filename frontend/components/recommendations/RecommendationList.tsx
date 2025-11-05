"use client";

import { RecommendationCard } from "./RecommendationCard";
import type { RecommendationItem } from "@/types/recommendation";
import { Loader2 } from "lucide-react";

interface RecommendationListProps {
  items: RecommendationItem[];
  isLoading?: boolean;
  showScore?: boolean;
  emptyMessage?: string;
  className?: string;
}

export function RecommendationList({
  items,
  isLoading = false,
  showScore = false,
  emptyMessage = "暂无推荐",
  className = "",
}: RecommendationListProps) {
  if (isLoading) {
    return (
      <div className={`flex items-center justify-center py-12 ${className}`}>
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center py-12 text-center ${className}`}>
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 ${className}`}>
      {items.map((item) => (
        <RecommendationCard key={item.item_id} item={item} showScore={showScore} />
      ))}
    </div>
  );
}

