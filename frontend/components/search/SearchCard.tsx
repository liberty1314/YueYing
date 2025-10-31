"use client";

import { Star, Calendar, Plus, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { SearchResult } from "@/app/explore/page";
import Image from "next/image";

interface SearchCardProps {
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

export function SearchCard({
  result,
  onAdd,
  onView,
  className,
}: SearchCardProps) {
  const posterUrl = result.poster_url || result.backdrop_url;
  const hasRating = result.rating !== undefined && result.rating !== null;

  return (
    <Card
      className={cn(
        "group overflow-hidden transition-all hover:shadow-lg hover:scale-[1.02]",
        className
      )}
    >
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* 封面图片 */}
          <div className="relative w-full sm:w-32 h-48 sm:h-auto bg-muted flex-shrink-0">
            {posterUrl ? (
              <Image
                src={posterUrl}
                alt={result.title}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 128px"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-gradient-to-br from-muted to-muted-foreground/10">
                <span className="text-4xl text-muted-foreground/40">
                  {result.title.charAt(0)}
                </span>
              </div>
            )}

            {/* 类型标签 */}
            <Badge
              className={cn(
                "absolute top-2 left-2",
                contentTypeColors[result.content_type] ||
                  "bg-gray-100 text-gray-700"
              )}
            >
              {contentTypeLabels[result.content_type] || result.content_type}
            </Badge>
          </div>

          {/* 内容信息 */}
          <div className="flex flex-1 flex-col justify-between p-4 sm:p-4 sm:pl-0">
            <div className="space-y-2">
              {/* 标题 */}
              <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
                {result.title}
              </h3>

              {/* 原标题 */}
              {result.original_title &&
                result.original_title !== result.title && (
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {result.original_title}
                  </p>
                )}

              {/* 简介 */}
              {result.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {result.description}
                </p>
              )}

              {/* 元数据 */}
              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                {/* 评分 */}
                {hasRating && (
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{result.rating.toFixed(1)}</span>
                    {result.vote_count && (
                      <span className="text-xs">({result.vote_count})</span>
                    )}
                  </div>
                )}

                {/* 年份 */}
                {result.year && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{result.year}</span>
                  </div>
                )}
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="mt-4 flex gap-2">
              {onView && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onView(result)}
                  className="flex-1"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  查看详情
                </Button>
              )}
              {onAdd && (
                <Button
                  size="sm"
                  onClick={() => onAdd(result)}
                  className="flex-1"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  添加到记录
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

