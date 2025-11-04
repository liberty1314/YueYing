"use client";

import { useRef, useState, useEffect } from "react";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContentCard } from "./ContentCard";
import { Skeleton } from "@/components/ui/skeleton";

interface ContentItem {
  id: number | string;
  title: string;
  poster_path?: string;
  vote_average?: number;
  release_date?: string;
  first_air_date?: string;
  media_type?: string;
}

interface ContentSectionProps {
  title: string;
  items: ContentItem[];
  isLoading?: boolean;
  scrollable?: boolean; // 是否启用横向滚动
  onItemClick?: (item: ContentItem) => void;
  onViewMore?: () => void;
}

export function ContentSection({
  title,
  items,
  isLoading,
  scrollable = false,
  onItemClick,
  onViewMore,
}: ContentSectionProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // 检查滚动位置
  const checkScrollPosition = () => {
    if (!scrollContainerRef.current) return;
    
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  // 向左滚动
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: -600,
        behavior: "smooth",
      });
      setTimeout(checkScrollPosition, 300);
    }
  };

  // 向右滚动
  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: 600,
        behavior: "smooth",
      });
      setTimeout(checkScrollPosition, 300);
    }
  };

  // 初始化时检查滚动位置
  useEffect(() => {
    if (scrollable) {
      // 延迟检查，确保内容已渲染
      setTimeout(checkScrollPosition, 100);
    }
  }, [scrollable, items]);

  if (isLoading) {
    return (
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">{title}</h2>
        </div>
        <div className={scrollable 
          ? "flex gap-4 overflow-x-auto pb-4 scrollbar-hide" 
          : "grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
        }>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={scrollable ? "w-[180px] flex-shrink-0 space-y-2" : "space-y-2"}>
              <Skeleton className="aspect-[2/3] w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{title}</h2>
        <div className="flex items-center gap-2">
          {/* 滚动按钮 - 仅在scrollable模式下显示 */}
          {scrollable && (
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="icon"
                onClick={scrollLeft}
                disabled={!canScrollLeft}
                className="h-8 w-8"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={scrollRight}
                disabled={!canScrollRight}
                className="h-8 w-8"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
          {onViewMore && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onViewMore}
              className="gap-1"
            >
              查看更多
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <div 
        ref={scrollable ? scrollContainerRef : null}
        className={scrollable 
          ? "flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory" 
          : "grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
        }
        onScroll={scrollable ? checkScrollPosition : undefined}
        onLoad={scrollable ? checkScrollPosition : undefined}
      >
        {(scrollable ? items : items.slice(0, 12)).map((item) => (
          <div 
            key={item.id} 
            className={scrollable ? "w-[180px] flex-shrink-0 snap-start" : ""}
          >
            <ContentCard
              {...item}
              onClick={() => onItemClick?.(item)}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

