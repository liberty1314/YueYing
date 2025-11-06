"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RecentActivityItem } from "@/types/stats";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";

interface RecentActivityCarouselProps {
  activities: RecentActivityItem[];
}

const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "success" | "warning" }> = {
  want_to_watch: { label: "想看", variant: "secondary" },
  watching: { label: "在看", variant: "warning" },
  watched: { label: "已看", variant: "success" },
};

const contentTypeMap: Record<string, string> = {
  movie: "电影",
  tv: "剧集",
  anime: "动漫",
  book: "书籍",
  game: "游戏",
};

export function RecentActivityCarousel({ activities }: RecentActivityCarouselProps) {
  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>最近浏览</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">暂无最近活动</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>最近浏览</CardTitle>
        <p className="text-sm text-muted-foreground">
          你最近查看或更新的记录
        </p>
      </CardHeader>
      <CardContent>
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex space-x-4 pb-4">
            {activities.map((activity) => {
              const statusInfo = statusMap[activity.status] || { label: activity.status, variant: "default" };
              const contentType = contentTypeMap[activity.content_type] || activity.content_type;
              
              return (
                <div
                  key={activity.id}
                  className="group relative w-[180px] shrink-0 cursor-pointer overflow-hidden rounded-lg border bg-card transition-all hover:shadow-lg"
                >
                  {/* 海报 */}
                  <div className="relative aspect-[2/3] w-full overflow-hidden bg-muted">
                    {activity.poster_url ? (
                      <Image
                        src={activity.poster_url}
                        alt={activity.title}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                        sizes="180px"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-muted-foreground">
                        暂无海报
                      </div>
                    )}
                    
                    {/* 评分角标 */}
                    {activity.rating !== null && (
                      <div className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-black/70 px-2 py-1 text-xs font-medium text-white">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        {activity.rating}
                      </div>
                    )}
                  </div>

                  {/* 信息 */}
                  <div className="space-y-2 p-3">
                    <h4 className="line-clamp-2 text-sm font-medium leading-tight">
                      {activity.title}
                    </h4>
                    
                    <div className="flex items-center justify-between">
                      <Badge variant={statusInfo.variant as any}>
                        {statusInfo.label}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {contentType}
                      </span>
                    </div>

                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(activity.updated_at), {
                        addSuffix: true,
                        locale: zhCN,
                      })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </CardContent>
    </Card>
  );
}


