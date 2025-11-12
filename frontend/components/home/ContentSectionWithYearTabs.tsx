"use client";

import { useState, useEffect } from "react";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ContentCard } from "./ContentCard";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface ContentItem {
  id: number | string;
  title: string;
  name?: string;
  poster_path?: string;
  backdrop_path?: string;
  vote_average?: number;
  release_date?: string;
  first_air_date?: string;
  media_type?: string;
  overview?: string;
}

interface ContentSectionWithYearTabsProps {
  title: string;
  contentType: "movie" | "tv"; // 内容类型：电影或剧集
  onItemClick?: (item: ContentItem) => void;
  onViewMore?: (year: number) => void; // 查看更多回调，传递当前选中的年份
}

export function ContentSectionWithYearTabs({
  title,
  contentType,
  onItemClick,
  onViewMore,
}: ContentSectionWithYearTabsProps) {
  const { toast } = useToast();
  const currentYear = new Date().getFullYear();

  // 生成最近五年的年份选项
  const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - i);

  // 状态管理
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [contentData, setContentData] = useState<Record<number, ContentItem[]>>({});
  const [loadingStates, setLoadingStates] = useState<Record<number, boolean>>({});

  // 格式化数据
  const formatItem = (item: any): ContentItem => ({
    ...item,
    title: item.title || item.name || "未知",
    media_type: contentType, // 根据板块类型设置正确的media_type
  });

  // 加载指定年份的数据
  const loadYearData = async (year: number) => {
    // 如果已经加载过且有数据，就不重新加载
    if (contentData[year] && contentData[year].length > 0) {
      return;
    }

    setLoadingStates(prev => ({ ...prev, [year]: true }));

    try {
      const endpoint = contentType === "movie"
        ? `/tmdb/movies/top-rated`
        : `/tmdb/tv/top-rated`;

      const params: any = { page: 1 };
      if (year !== null) {
        if (contentType === "movie") {
          params.year = year;
        } else {
          params.first_air_date_year = year;
        }
      }

      const response = await api.get(endpoint, { params });
      const items = response.data.results?.map(formatItem) || [];
      setContentData(prev => ({ ...prev, [year]: items }));
    } catch (error: any) {
      console.error(`Failed to load ${contentType} data for year ${year}:`, error);
      toast({
        title: "加载失败",
        description: `无法加载${year}年${title}数据`,
        variant: "destructive",
      });
      // 设置空数组，避免无限重试
      setContentData(prev => ({ ...prev, [year]: [] }));
    } finally {
      setLoadingStates(prev => ({ ...prev, [year]: false }));
    }
  };

  // 初始化时加载当前年份的数据
  useEffect(() => {
    loadYearData(currentYear);
  }, [currentYear]);

  // 年份切换处理
  const handleYearChange = (year: number) => {
    setSelectedYear(year);
    // 如果该年份还没加载过，就加载数据
    if (!contentData[year]) {
      loadYearData(year);
    }
  };

  return (
    <div className="space-y-4">
      {/* 标题 */}
      <h2 className="text-2xl font-bold">{title}</h2>

      {/* 年份筛选和查看更多按钮 */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {yearOptions.map((year) => (
            <Button
              key={year}
              variant={selectedYear === year ? "default" : "outline"}
              size="sm"
              onClick={() => handleYearChange(year)}
              className="whitespace-nowrap"
            >
              {year}
              {year === currentYear && (
                <span className="ml-1 text-xs">·最新</span>
              )}
            </Button>
          ))}
        </div>
        {onViewMore && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewMore(selectedYear)}
            className="gap-1 text-muted-foreground hover:text-foreground whitespace-nowrap"
          >
            查看更多
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* 内容展示 - 两行布局 */}
      {loadingStates[selectedYear] ? (
        <div className="flex flex-col gap-4">
          {/* 第一行加载状态 */}
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="w-[180px] flex-shrink-0 space-y-2">
                <Skeleton className="aspect-[2/3] w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
          {/* 第二行加载状态 */}
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="w-[180px] flex-shrink-0 space-y-2">
                <Skeleton className="aspect-[2/3] w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {/* 第一行 */}
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {(contentData[selectedYear] || []).slice(0, 6).map((item) => (
              <div key={item.id} className="w-[180px] flex-shrink-0">
                <ContentCard {...item} onClick={() => onItemClick?.(item)} />
              </div>
            ))}
          </div>
          {/* 第二行 */}
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {(contentData[selectedYear] || []).slice(6, 12).map((item) => (
              <div key={item.id} className="w-[180px] flex-shrink-0">
                <ContentCard {...item} onClick={() => onItemClick?.(item)} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
