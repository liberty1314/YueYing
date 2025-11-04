"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Film, Eye, Star, TrendingUp } from "lucide-react";
import type { OverviewStats } from "@/types/stats";

interface OverviewCardsProps {
  overview: OverviewStats;
}

const statusLabels: Record<string, string> = {
  want_to_watch: "想看",
  watching: "在看",
  watched: "看过",
};

const typeLabels: Record<string, string> = {
  movie: "电影",
  tv: "剧集",
  anime: "动漫",
  book: "书籍",
  game: "游戏",
};

export function OverviewCards({ overview }: OverviewCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 总记录数 */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">总记录数</p>
              <p className="text-3xl font-bold mt-2">{overview.total_items}</p>
            </div>
            <Film className="h-12 w-12 text-blue-500 opacity-75" />
          </div>
        </CardContent>
      </Card>

      {/* 已看完 */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">已看完</p>
              <p className="text-3xl font-bold mt-2">
                {overview.by_status["watched"] || 0}
              </p>
            </div>
            <Eye className="h-12 w-12 text-green-500 opacity-75" />
          </div>
        </CardContent>
      </Card>

      {/* 已评分 */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">已评分</p>
              <p className="text-3xl font-bold mt-2">{overview.total_rated}</p>
            </div>
            <Star className="h-12 w-12 text-yellow-500 opacity-75" />
          </div>
        </CardContent>
      </Card>

      {/* 平均评分 */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">平均评分</p>
              <p className="text-3xl font-bold mt-2">
                {overview.average_rating?.toFixed(1) || "N/A"}
              </p>
            </div>
            <TrendingUp className="h-12 w-12 text-purple-500 opacity-75" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

