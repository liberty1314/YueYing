"use client";

import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Star, MoreVertical, Eye, Pencil, Trash2 } from "lucide-react";
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
    <Card className="group relative overflow-hidden hover:shadow-lg transition-shadow">
      <Link href={`/library/${item.id}`}>
        {/* 海报 */}
        <div className="relative aspect-[2/3] overflow-hidden bg-muted">
          <Image
            src={posterUrl}
            alt={item.title}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
          />

          {/* 状态标签 */}
          <div className="absolute top-2 left-2">
            <Badge variant="secondary" className={`${statusColors[item.status]} text-white`}>
              {statusLabels[item.status]}
            </Badge>
          </div>

          {/* 评分 */}
          {item.rating && (
            <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/70 text-white px-2 py-1 rounded-md text-xs font-medium">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              {item.rating}
            </div>
          )}

          {/* 操作按钮 */}
          <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
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
                <DropdownMenuItem asChild>
                  <Link href={`/library/${item.id}/edit`}>
                    <Pencil className="h-4 w-4 mr-2" />
                    编辑
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
          </div>
        </div>
      </Link>

      <CardContent className="p-3">
        {/* 标题 */}
        <Link href={`/library/${item.id}`}>
          <h3 className="font-medium text-sm line-clamp-2 hover:text-primary transition-colors">
            {item.title}
          </h3>
        </Link>

        {/* 元信息 */}
        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
          <span>{contentTypeLabels[item.content_type]}</span>
          {item.year && (
            <>
              <span>•</span>
              <span>{item.year}</span>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

