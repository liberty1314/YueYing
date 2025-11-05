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
import { Star, MoreVertical, Eye, Pencil, Trash2, Calendar } from "lucide-react";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import type { UserItem } from "@/types/user-item";

interface ItemRowProps {
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

export function ItemRow({ item, onDelete }: ItemRowProps) {
  const placeholderImage = "/placeholder-poster.png";
  const posterUrl = item.poster_url || placeholderImage;

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return null;
    try {
      return format(new Date(dateStr), "yyyy年M月d日", { locale: zhCN });
    } catch {
      return null;
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex gap-4">
          {/* 海报 */}
          <Link href={`/library/${item.id}`} className="flex-shrink-0">
            <div className="relative w-24 h-36 overflow-hidden rounded-md bg-muted">
              <Image
                src={posterUrl}
                alt={item.title}
                fill
                className="object-cover"
                sizes="96px"
              />
            </div>
          </Link>

          {/* 内容 */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                {/* 标题和状态 */}
                <div className="flex items-center gap-2 mb-2">
                  <Link href={`/library/${item.id}`}>
                    <h3 className="font-semibold text-lg hover:text-primary transition-colors truncate">
                      {item.title}
                    </h3>
                  </Link>
                  <Badge variant="secondary" className={`${statusColors[item.status]} text-white text-xs`}>
                    {statusLabels[item.status]}
                  </Badge>
                </div>

                {/* 原标题 */}
                {item.original_title && item.original_title !== item.title && (
                  <p className="text-sm text-muted-foreground mb-2 truncate">
                    {item.original_title}
                  </p>
                )}

                {/* 元信息 */}
                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-2">
                  <span>{contentTypeLabels[item.content_type]}</span>
                  {item.year && (
                    <>
                      <span>•</span>
                      <span>{item.year}</span>
                    </>
                  )}
                  {item.rating && (
                    <>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{item.rating}/10</span>
                      </div>
                    </>
                  )}
                </div>

                {/* 日期信息 */}
                {(item.started_at || item.completed_at) && (
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    {item.started_at && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>开始: {formatDate(item.started_at)}</span>
                      </div>
                    )}
                    {item.completed_at && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>完成: {formatDate(item.completed_at)}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* 笔记预览 */}
                {item.notes && (
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                    {item.notes}
                  </p>
                )}
              </div>

              {/* 操作按钮 */}
              {/* <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="flex-shrink-0">
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
                    onClick={() => onDelete(item.id)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    删除
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu> */}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

