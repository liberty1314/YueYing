"use client";

import { Star, Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface ContentCardProps {
  id: number | string;
  title: string;
  poster_path?: string;
  vote_average?: number;
  release_date?: string;
  first_air_date?: string;
  media_type?: string;
  onClick?: () => void;
}

export function ContentCard({
  title,
  poster_path,
  vote_average,
  release_date,
  first_air_date,
  media_type,
  onClick,
}: ContentCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  // 判断是否为完整URL（Bangumi）或相对路径（TMDB）
  const posterUrl = poster_path
    ? poster_path.startsWith("http")
      ? poster_path // Bangumi完整URL
      : `https://image.tmdb.org/t/p/w500${poster_path}` // TMDB相对路径
    : "/placeholder.jpg";

  const year = release_date
    ? new Date(release_date).getFullYear()
    : first_air_date
    ? new Date(first_air_date).getFullYear()
    : "";

  const rating = vote_average ? vote_average.toFixed(1) : "";

  return (
    <div
      className="group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {/* 卡片 - 只包含图片 */}
      <Card className={cn(
        "overflow-hidden transition-all duration-300",
        isHovered ? "shadow-xl scale-105" : "shadow-md"
      )}>
        <div className="relative aspect-[2/3] overflow-hidden bg-muted">
          <img
            src={posterUrl}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
          
          {/* 评分标签 */}
          {rating && (
            <div className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-black/80 backdrop-blur-sm px-2 py-1 text-xs font-semibold text-white shadow-lg">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span>{rating}</span>
            </div>
          )}

          {/* 媒体类型标签 */}
          {media_type && (
            <div className="absolute top-2 left-2">
              <Badge variant="secondary" className="text-xs shadow-md">
                {media_type === "movie" ? "电影" : media_type === "tv" ? "剧集" : "动漫"}
              </Badge>
            </div>
          )}
        </div>
      </Card>

      {/* 标题信息 - 显示在卡片外面 */}
      <div className="mt-2 px-1">
        <h3 className={cn(
          "font-semibold text-sm line-clamp-2 leading-tight transition-colors",
          isHovered && "text-primary"
        )}>
          {title}
        </h3>
        
        {/* 年份 */}
        {year && (
          <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>{year}</span>
          </div>
        )}
      </div>
    </div>
  );
}

