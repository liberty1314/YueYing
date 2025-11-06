"use client";

import { useState } from "react";
import Image from "next/image";
import { Calendar, Globe, ExternalLink, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RatingBadge } from "@/components/common/RatingBadge";
import { QuickAddForm } from "./QuickAddForm";
import { cn } from "@/lib/utils";
import type { SearchResult } from "@/app/explore/page";

interface ContentDetailDialogProps {
  result: SearchResult | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddSuccess?: () => void;
}

const contentTypeLabels: Record<string, string> = {
  movie: "电影",
  tv: "剧集",
  anime: "动漫",
  book: "书籍",
  game: "游戏",
};

export function ContentDetailDialog({
  result,
  open,
  onOpenChange,
  onAddSuccess,
}: ContentDetailDialogProps) {
  const [showAddForm, setShowAddForm] = useState(false);

  if (!result) return null;

  const posterUrl = result.poster_url || result.backdrop_url;
  const hasRating = result.rating !== undefined && result.rating !== null;

  const handleAddClick = () => {
    setShowAddForm(true);
  };

  const handleAddSuccess = () => {
    setShowAddForm(false);
    onAddSuccess?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden">
        <ScrollArea className="max-h-[90vh]">
          {/* 头部背景图 */}
          {result.backdrop_url && (
            <div className="relative h-64 w-full">
              <Image
                src={result.backdrop_url}
                alt={result.title}
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
            </div>
          )}

          <div className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* 左侧：封面 */}
              {posterUrl && (
                <div className="flex-shrink-0 w-48 mx-auto md:mx-0">
                  <div className="relative w-48 h-72 rounded-lg overflow-hidden shadow-lg">
                    <Image
                      src={posterUrl}
                      alt={result.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              )}

              {/* 右侧：详情 */}
              <div className="flex-1 space-y-4">
                <DialogHeader>
                  <div className="space-y-2">
                    <DialogTitle className="text-2xl font-bold">
                      {result.title}
                    </DialogTitle>
                    {result.original_title &&
                      result.original_title !== result.title && (
                        <p className="text-muted-foreground">
                          {result.original_title}
                        </p>
                      )}
                  </div>
                </DialogHeader>

                {/* 元数据 */}
                <div className="flex flex-wrap items-center gap-3">
                  <Badge variant="secondary">
                    {contentTypeLabels[result.content_type] ||
                      result.content_type}
                  </Badge>

                  {result.year && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{result.year}</span>
                    </div>
                  )}

                  {hasRating && result.rating !== undefined && (
                    <div className="flex items-center gap-2 text-sm">
                      <RatingBadge rating={result.rating} type="platform" size="sm" />
                      {result.vote_count && (
                        <span className="text-muted-foreground">
                          ({result.vote_count})
                        </span>
                      )}
                    </div>
                  )}

                  {result.language && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Globe className="h-4 w-4" />
                      <span>{result.language.toUpperCase()}</span>
                    </div>
                  )}
                </div>

                {/* 简介 */}
                {result.description && (
                  <div className="space-y-2">
                    <h3 className="font-semibold">简介</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {result.description}
                    </p>
                  </div>
                )}

                {/* 元数据信息 */}
                {result.metadata && (
                  <div className="space-y-3">
                    {/* 作者/导演 */}
                    {(result.metadata.author ||
                      result.metadata.authors ||
                      result.metadata.director) && (
                      <div className="space-y-1">
                        <h4 className="text-sm font-medium">
                          {result.content_type === "book" ? "作者" : "导演"}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {result.metadata.author ||
                            (Array.isArray(result.metadata.authors)
                              ? result.metadata.authors.join(", ")
                              : result.metadata.authors) ||
                            result.metadata.director}
                        </p>
                      </div>
                    )}

                    {/* 演员 */}
                    {result.metadata.cast && (
                      <div className="space-y-1">
                        <h4 className="text-sm font-medium">演员</h4>
                        <p className="text-sm text-muted-foreground">
                          {Array.isArray(result.metadata.cast)
                            ? result.metadata.cast
                                .slice(0, 5)
                                .map((actor: any) =>
                                  typeof actor === "string" ? actor : actor.name
                                )
                                .join(" / ")
                            : result.metadata.cast}
                        </p>
                      </div>
                    )}

                    {/* 出版社/制作公司 */}
                    {(result.metadata.publisher ||
                      result.metadata.production_companies) && (
                      <div className="space-y-1">
                        <h4 className="text-sm font-medium">
                          {result.content_type === "book"
                            ? "出版社"
                            : "制作公司"}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {result.metadata.publisher ||
                            (Array.isArray(result.metadata.production_companies)
                              ? result.metadata.production_companies
                                  .map((c: any) => c.name)
                                  .join(", ")
                              : result.metadata.production_companies)}
                        </p>
                      </div>
                    )}

                    {/* 页数/时长 */}
                    {(result.metadata.page_count ||
                      result.metadata.runtime) && (
                      <div className="space-y-1">
                        <h4 className="text-sm font-medium">
                          {result.content_type === "book" ? "页数" : "时长"}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {result.metadata.page_count
                            ? `${result.metadata.page_count} 页`
                            : `${result.metadata.runtime} 分钟`}
                        </p>
                      </div>
                    )}

                    {/* ISBN */}
                    {result.metadata.isbn && (
                      <div className="space-y-1">
                        <h4 className="text-sm font-medium">ISBN</h4>
                        <p className="text-sm text-muted-foreground">
                          {result.metadata.isbn}
                        </p>
                      </div>
                    )}

                    {/* 分类/类型 */}
                    {(result.metadata.categories || result.metadata.genres) && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">分类</h4>
                        <div className="flex flex-wrap gap-2">
                          {(result.metadata.categories ||
                            result.metadata.genres
                          )
                            ?.slice(0, 5)
                            .map((category: any, index: number) => (
                              <Badge key={index} variant="secondary">
                                {typeof category === "string"
                                  ? category
                                  : category.name}
                              </Badge>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <Separator />

                {/* 操作按钮 */}
                {!showAddForm && (
                  <div className="flex gap-2">
                    <Button onClick={handleAddClick} className="w-full">
                      添加到我的记录
                    </Button>
                  </div>
                )}

                {/* 快速添加表单 */}
                {showAddForm && (
                  <div className="pt-4">
                    <QuickAddForm
                      result={result}
                      onSuccess={handleAddSuccess}
                      onCancel={() => setShowAddForm(false)}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

