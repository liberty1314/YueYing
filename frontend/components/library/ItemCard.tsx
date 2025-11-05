"use client";

import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Star, MoreVertical, Eye, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { UserItem } from "@/types/user-item";

interface ItemCardProps {
  item: UserItem;
  onDelete: (id: number) => void;
}

const statusLabels = {
  want_to_watch: "想看",
  watching: "在看",
  watched: "看过",
};

const statusColors = {
  want_to_watch: "bg-blue-500",
  watching: "bg-yellow-500",
  watched: "bg-green-500",
};

const contentTypeLabels = {
  movie: "电影",
  tv: "剧集",
  anime: "动漫",
  book: "书籍",
  game: "游戏",
};

export function ItemCard({ item, onDelete }: ItemCardProps) {
  const placeholderImage = "/placeholder-poster.png";
  const posterUrl = item.poster_url || placeholderImage;

  return (
    <div className="group cursor-pointer">
      {/* 卡片 - 只包含图片 */}
      <Card className="overflow-hidden transition-all duration-300 hover:shadow-xl">
        <Link href={`/library/${item.id}`}>
          <div className="relative aspect-[2/3] overflow-hidden bg-muted">
            <Image
              src={posterUrl}
              alt={item.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
            />

            {/* 状态标签 */}
            <div className="absolute top-2 left-2">
              <Badge variant="secondary" className={`${statusColors[item.status]} text-white shadow-md`}>
                {statusLabels[item.status]}
              </Badge>
            </div>

            {/* 评分 */}
            {item.rating != null && (
              <div className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-black/80 backdrop-blur-sm px-2 py-1 text-xs font-semibold text-white shadow-lg">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span>{item.rating}</span>
              </div>
            )}

            {/* 操作按钮 */}
            {/* <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
                  <Button variant="secondary" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/library/${item.id}`}>
                      <Eye className="h-4 w-4 mr-2" />
                      查看详情
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.preventDefault();
                      onDelete(item.id);
                    }}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    删除
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div> */}
          </div>
        </Link>
      </Card>

      {/* 标题信息 - 显示在卡片外面 */}
      <div className="mt-2 px-1">
        <Link href={`/library/${item.id}`}>
          <h3 className={cn(
            "font-semibold text-sm line-clamp-2 leading-tight transition-colors",
            "group-hover:text-primary"
          )}>
            {item.title}
          </h3>
        </Link>

        {/* 元信息 */}
        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
          <span>{contentTypeLabels[item.content_type]}</span>
          {item.year && (
            <>
              <span>•</span>
              <span>{item.year}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

