"use client";

/**
 * 首页内容组件 - Client Component
 * 
 * 包含所有数据获取和 UI 交互逻辑
 */

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Container } from "@/components/common/Container";
import { HeroCarousel } from "@/components/home/HeroCarousel";
import { HomeSkeleton } from "@/components/home/HomeSkeleton";
import { ContentSection } from "@/components/home/ContentSection";
import { ContentSectionWithYearTabs } from "@/components/home/ContentSectionWithYearTabs";
import { RecommendationsSection } from "@/components/home/RecommendationsSection";
import { ContentDetailDialog } from "@/components/content/ContentDetailDialog";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

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

export function HomeContent() {
    const router = useRouter();
    const { toast } = useToast();
    const [trendingToday, setTrendingToday] = useState<ContentItem[]>([]);
    const [trendingWeek, setTrendingWeek] = useState<ContentItem[]>([]);
    const [animeCalendarData, setAnimeCalendarData] = useState<any[]>([]);
    const [selectedWeekday, setSelectedWeekday] = useState<number>(new Date().getDay());
    const [isLoading, setIsLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [dialogOpen, setDialogOpen] = useState(false);

    useEffect(() => {
        loadHomeData();
    }, []);

    const loadHomeData = async () => {
        setIsLoading(true);
        try {
            const [trendingTodayRes, trendingWeekRes, animeRes] = await Promise.all([
                api.get("/tmdb/trending/all/day").catch(() => ({ data: { results: [] } })),
                api.get("/tmdb/trending/all/week").catch(() => ({ data: { results: [] } })),
                api.get("/bangumi/calendar").catch(() => ({ data: [] })),
            ]);

            const formatItem = (item: any): ContentItem => ({
                ...item,
                title: item.title || item.name || "未知",
            });

            setTrendingToday(trendingTodayRes.data.results?.map(formatItem) || []);
            setTrendingWeek(trendingWeekRes.data.results?.map(formatItem) || []);

            if (Array.isArray(animeRes.data)) {
                setAnimeCalendarData(animeRes.data);
            }
        } catch (err: any) {
            console.error("Failed to load home data:", err);
            toast({
                title: "加载失败",
                description: "无法加载首页内容",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleItemClick = (item: ContentItem) => {
        const searchResult = {
            id: String(item.id),
            external_id: String(item.id),
            source: "tmdb",
            content_type: item.media_type === "movie" ? "movie" : "tv",
            title: item.title || "",
            poster_url: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : undefined,
            backdrop_url: item.backdrop_path ? `https://image.tmdb.org/t/p/original${item.backdrop_path}` : undefined,
            release_date: item.release_date || item.first_air_date,
            year: item.release_date
                ? String(new Date(item.release_date).getFullYear())
                : item.first_air_date
                    ? String(new Date(item.first_air_date).getFullYear())
                    : undefined,
            rating: item.vote_average,
            description: item.overview,
        };

        setSelectedItem(searchResult);
        setDialogOpen(true);
    };

    const handleAnimeClick = (item: any) => {
        const searchResult = {
            id: String(item.id),
            external_id: String(item.id),
            source: "bangumi",
            content_type: "anime",
            title: item.name_cn || item.name || "",
            poster_url: item.images?.large || item.images?.common,
            description: item.summary,
            year: item.air_date ? String(new Date(item.air_date).getFullYear()) : undefined,
            rating: item.rating?.score,
        };

        setSelectedItem(searchResult);
        setDialogOpen(true);
    };

    const getAnimeForWeekday = () => {
        if (!animeCalendarData.length) return [];

        const bangumiWeekday = selectedWeekday === 0 ? 7 : selectedWeekday;
        const dayData = animeCalendarData.find((day: any) => day.weekday?.id === bangumiWeekday);
        return dayData?.items || [];
    };

    const weekdayOptions = [
        { label: "周日", value: 0 },
        { label: "周一", value: 1 },
        { label: "周二", value: 2 },
        { label: "周三", value: 3 },
        { label: "周四", value: 4 },
        { label: "周五", value: 5 },
        { label: "周六", value: 6 },
    ];

    if (isLoading && trendingToday.length === 0) {
        return <HomeSkeleton />;
    }

    return (
        <div className="min-h-screen bg-background">
            {/* 轮播图 */}
            <div className="mb-12">
                <HeroCarousel
                    items={trendingToday.slice(0, 5)}
                    onItemClick={handleItemClick}
                    isLoading={isLoading}
                />
            </div>

            <Container className="space-y-12 py-8">
                {/* 个性化推荐 */}
                <RecommendationsSection />

                {/* 趋势 */}
                <div>
                    <h2 className="text-3xl font-bold mb-6">🔥 热门影视</h2>
                    <Tabs defaultValue="today" className="w-full">
                        <TabsList className="mb-6">
                            <TabsTrigger value="today">今日热门</TabsTrigger>
                            <TabsTrigger value="week">本周热门</TabsTrigger>
                        </TabsList>
                        <TabsContent value="today" className="mt-0">
                            <ContentSection
                                title=""
                                items={trendingToday}
                                isLoading={isLoading}
                                onItemClick={handleItemClick}
                            />
                        </TabsContent>
                        <TabsContent value="week" className="mt-0">
                            <ContentSection
                                title=""
                                items={trendingWeek}
                                isLoading={isLoading}
                                onItemClick={handleItemClick}
                            />
                        </TabsContent>
                    </Tabs>
                </div>

                {/* 热门动漫 */}
                {animeCalendarData.length > 0 && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold">📺 本周新番</h2>
                        </div>

                        <div className="flex gap-2 overflow-x-auto pb-2">
                            {weekdayOptions.map((option) => (
                                <Button
                                    key={option.value}
                                    variant={selectedWeekday === option.value ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setSelectedWeekday(option.value)}
                                    className="whitespace-nowrap"
                                >
                                    {option.label}
                                    {option.value === new Date().getDay() && (
                                        <span className="ml-1 text-xs">·今天</span>
                                    )}
                                </Button>
                            ))}
                        </div>

                        <ContentSection
                            title=""
                            items={getAnimeForWeekday().map((item: any) => ({
                                id: item.id,
                                title: item.name_cn || item.name,
                                poster_path: item.images?.large || item.images?.common || item.images?.medium,
                                vote_average: item.rating?.score,
                                media_type: "anime",
                            }))}
                            isLoading={false}
                            scrollable={true}
                            onItemClick={(item) => {
                                const animeList = getAnimeForWeekday();
                                const anime = animeList.find((a: any) => a.id === item.id);
                                if (anime) handleAnimeClick(anime);
                            }}
                        />
                    </div>
                )}

                {/* 高分电影 */}
                <ContentSectionWithYearTabs
                    title="🎬 高分电影"
                    contentType="movie"
                    onItemClick={handleItemClick}
                    onViewMore={(year) => router.push(`/explore?browse=top-rated&type=movie&year=${year}`)}
                />

                {/* 高分剧集 */}
                <ContentSectionWithYearTabs
                    title="📺 高分剧集"
                    contentType="tv"
                    onItemClick={handleItemClick}
                    onViewMore={(year) => router.push(`/explore?browse=top-rated&type=tv&year=${year}`)}
                />
            </Container>

            {/* 详情对话框 */}
            <ContentDetailDialog
                result={selectedItem}
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                onAddSuccess={() => {
                    toast({
                        title: "添加成功",
                        description: "内容已添加到你的记录",
                    });
                    setDialogOpen(false);
                }}
            />
        </div>
    );
}
