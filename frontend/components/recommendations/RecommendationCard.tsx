"use client";

import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { RecommendationItem } from "@/types/recommendation";
import { Film, Tv, Book, Gamepad2 } from "lucide-react";

const contentTypeIcons = {
  movie: Film,
  tv: Tv,
  anime: Tv,
  book: Book,
  game: Gamepad2,
};

const contentTypeLabels = {
  movie: "电影",
  tv: "剧集",
  anime: "动漫",
  book: "书籍",
  game: "游戏",
};

interface RecommendationCardProps {
  item: RecommendationItem;
  showScore?: boolean;
}

export function RecommendationCard({ item, showScore = false }: RecommendationCardProps) {
  const Icon = contentTypeIcons[item.content_type as keyof typeof contentTypeIcons] || Film;
  const typeLabel = contentTypeLabels[item.content_type as keyof typeof contentTypeLabels] || "内容";

  return (
    <Link href={`/search?id=${item.item_id}`}>
      <Card className="group overflow-hidden transition-all hover:shadow-lg">
        <div className="relative aspect-[2/3] overflow-hidden bg-muted">
          {item.poster_url ? (
            <Image
              src={item.poster_url}
              alt={item.title}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <Icon className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
          
          {showScore && (
            <div className="absolute top-2 right-2 rounded-full bg-black/60 px-2 py-1 text-xs font-semibold text-white backdrop-blur-sm">
              {(item.score * 100).toFixed(0)}%
            </div>
          )}
        </div>
        
        <CardContent className="p-3">
          <h3 className="line-clamp-2 text-sm font-medium">{item.title}</h3>
          
          <div className="mt-2 flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              <Icon className="mr-1 h-3 w-3" />
              {typeLabel}
            </Badge>
            
            {item.genres && item.genres.length > 0 && (
              <span className="text-xs text-muted-foreground line-clamp-1">
                {item.genres[0]}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

