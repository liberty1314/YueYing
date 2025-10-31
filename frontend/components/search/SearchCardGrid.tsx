"use client";

import { useState } from "react";
import { Star, Calendar, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { SearchResult } from "@/app/explore/page";
import Image from "next/image";

interface SearchCardGridProps {
  result: SearchResult;
  onAdd?: (result: SearchResult) => void;
  onView?: (result: SearchResult) => void;
  className?: string;
}

const contentTypeLabels: Record<string, string> = {
  movie: "电影",
  tv: "剧集",
  anime: "动漫",
  book: "书籍",
};

const contentTypeColors: Record<string, string> = {
  movie: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  tv: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  anime: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
  book: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
};

export function SearchCardGrid({
  result,
  onAdd,
  onView,
  className,
}: SearchCardGridProps) {
  const [isHovered, setIsHovered] = useState(false);
  const posterUrl = result.poster_url || result.backdrop_url;
  const hasRating = result.rating !== undefined && result.rating !== null;

  return (
    <div
      className={cn("group cursor-pointer", className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onView && onView(result)}
    >
      {/* 卡片部分 - 只包含图片 */}
      <Card
        className={cn(
          "overflow-hidden rounded-xl transition-all duration-300 border-2 border-transparent",
          isHovered ? "shadow-2xl border-primary/20 z-10" : "shadow-md hover:shadow-lg"
        )}
      >
        <CardContent className="p-0">
          <div className={cn(
            "relative transition-transform duration-300",
            isHovered && "scale-105"
          )}>
            {/* 封面图片 */}
            <div className="relative w-full aspect-[2/3] bg-muted overflow-hidden">
              {posterUrl ? (
                <Image
                  src={posterUrl}
                  alt={result.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/10 via-muted to-secondary/10">
                  <span className="text-6xl font-bold text-muted-foreground/30">
                    {result.title.charAt(0)}
                  </span>
                </div>
              )}

            {/* 类型标签 */}
            <Badge
              className={cn(
                "absolute top-3 left-3 rounded-full shadow-md",
                contentTypeColors[result.content_type] ||
                  "bg-gray-100 text-gray-700"
              )}
            >
              {contentTypeLabels[result.content_type] || result.content_type}
            </Badge>

            {/* 评分角标 */}
            {hasRating && result.rating !== undefined && (
              <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-1 shadow-lg">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span className="text-xs text-white font-semibold">
                  {result.rating.toFixed(1)}
                </span>
              </div>
            )}

              {/* 悬停遮罩和详细信息 */}
              {isHovered && (
              <>
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent animate-in fade-in-50 duration-300" />
                
                {/* 悬停详细信息 */}
                <div className="absolute inset-x-0 bottom-0 p-4 text-white animate-in fade-in-50 slide-in-from-bottom-3 duration-300">
                  {/* 原标题 */}
                  {/* {result.original_title && result.original_title !== result.title && (
                    <p className="text-xs text-white/90 mb-2 line-clamp-1 drop-shadow">
                      {result.original_title}
                    </p>
                  )} */}

                  {/* 年份和评分 */}
                  {/* <div className="flex items-center gap-2 mb-2.5 text-xs text-white/95">
                    {result.year && (
                      <div className="flex items-center gap-1 bg-white/10 backdrop-blur-sm px-2 py-0.5 rounded-full">
                        <Calendar className="h-3 w-3" />
                        <span className="font-medium">{result.year}</span>
                      </div>
                    )}
                    {hasRating && result.rating !== undefined && (
                      <div className="flex items-center gap-1 bg-yellow-500/20 backdrop-blur-sm px-2 py-0.5 rounded-full">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold">{result.rating.toFixed(1)}</span>
                      </div>
                    )}
                  </div> */}

                  {/* 简介 */}
                  {result.description && (
                    <p className="text-xs text-white/95 line-clamp-3 mb-3 drop-shadow leading-relaxed">
                      {result.description}
                    </p>
                  )}

                  {/* 操作按钮 */}
                  {onAdd && (
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAdd(result);
                      }}
                      className="w-full h-9 text-xs font-medium rounded-full shadow-lg hover:shadow-xl transition-all"
                    >
                      <Plus className="mr-1.5 h-3.5 w-3.5" />
                      添加到记录
                    </Button>
                  )}
                </div>
              </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 标题信息 - 显示在卡片外面 */}
      <div className="mt-2 px-1">
        <h3 className={cn(
          "font-semibold text-sm line-clamp-2 transition-colors",
          isHovered && "text-primary"
        )}>
          {result.title}
        </h3>
        
        {/* 年份 */}
        {result.year && (
          <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span className="font-medium">{result.year}</span>
          </div>
        )}
      </div>
    </div>
  );
}

