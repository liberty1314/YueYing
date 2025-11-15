"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cacheApi, CacheStats, TopKeysResponse, CacheInfo } from "@/lib/cache-api";
import { RefreshCw, TrendingUp, Clock, Database, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

export function CacheStatsTab() {
    const [stats, setStats] = useState<CacheStats | null>(null);
    const [topKeys, setTopKeys] = useState<TopKeysResponse | null>(null);
    const [info, setInfo] = useState<CacheInfo | null>(null);
    const [timeWindow, setTimeWindow] = useState("3600");
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    const loadData = async () => {
        try {
            setLoading(true);
            const [statsData, topKeysData, infoData] = await Promise.all([
                cacheApi.getStats(parseInt(timeWindow)),
                cacheApi.getTopKeys(10),
                cacheApi.getInfo(),
            ]);
            setStats(statsData);
            setTopKeys(topKeysData);
            setInfo(infoData);
        } catch (error: any) {
            toast({
                title: "加载失败",
                description: error.response?.data?.detail || "无法加载缓存统计",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [timeWindow]);

    const formatPercentage = (value: number) => `${(value * 100).toFixed(1)}%`;
    const formatNumber = (value: number) => value.toLocaleString();

    if (loading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-64 w-full" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* 操作栏 */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Select value={timeWindow} onValueChange={setTimeWindow}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="选择时间窗口" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="300">最近 5 分钟</SelectItem>
                            <SelectItem value="900">最近 15 分钟</SelectItem>
                            <SelectItem value="1800">最近 30 分钟</SelectItem>
                            <SelectItem value="3600">最近 1 小时</SelectItem>
                            <SelectItem value="7200">最近 2 小时</SelectItem>
                            <SelectItem value="21600">最近 6 小时</SelectItem>
                            <SelectItem value="86400">最近 24 小时</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <Button onClick={loadData} variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    刷新
                </Button>
            </div>

            {/* 系统信息卡片 */}
            {info && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Database className="h-5 w-5" />
                            缓存系统信息
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <p className="text-sm text-muted-foreground">L1 类型</p>
                                <p className="text-lg font-semibold">{info.cache_layers.l1.type}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">L2 类型</p>
                                <p className="text-lg font-semibold">{info.cache_layers.l2.type}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">多级缓存</p>
                                <p className="text-lg font-semibold">
                                    {info.features.multi_level ? "✓ 启用" : "✗ 禁用"}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">缓存预热</p>
                                <p className="text-lg font-semibold">
                                    {info.features.cache_warming ? "✓ 启用" : "✗ 禁用"}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* L1 缓存统计 */}
            {stats && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Zap className="h-5 w-5" />
                            L1 缓存（内存 LRU）
                        </CardTitle>
                        <CardDescription>进程内高速缓存，访问延迟 &lt; 1ms</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <p className="text-sm text-muted-foreground">命中率</p>
                                <p className="text-2xl font-bold text-green-600">
                                    {formatPercentage(stats.l1_stats.hit_rate)}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">当前大小</p>
                                <p className="text-2xl font-bold">
                                    {formatNumber(stats.l1_stats.size)} / {formatNumber(stats.l1_stats.max_size)}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">命中次数</p>
                                <p className="text-2xl font-bold text-green-600">
                                    {formatNumber(stats.l1_stats.hits)}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">未命中次数</p>
                                <p className="text-2xl font-bold text-orange-600">
                                    {formatNumber(stats.l1_stats.misses)}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* L2 缓存统计 */}
            {stats && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Database className="h-5 w-5" />
                            L2 缓存（Redis）
                        </CardTitle>
                        <CardDescription>分布式缓存，支持多实例共享</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <p className="text-sm text-muted-foreground">命中率</p>
                                <p className="text-2xl font-bold text-green-600">
                                    {formatPercentage(stats.l2_stats.hit_rate)}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">平均延迟</p>
                                <p className="text-2xl font-bold">
                                    {stats.l2_stats.avg_latency_ms.toFixed(2)} ms
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">总操作数</p>
                                <p className="text-2xl font-bold">
                                    {formatNumber(stats.l2_stats.total_operations)}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">命中/未命中</p>
                                <p className="text-2xl font-bold">
                                    <span className="text-green-600">{formatNumber(stats.l2_stats.hits)}</span>
                                    {" / "}
                                    <span className="text-orange-600">{formatNumber(stats.l2_stats.misses)}</span>
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* 热门键 */}
            {topKeys && topKeys.top_keys.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5" />
                            访问频率最高的缓存键
                        </CardTitle>
                        <CardDescription>最近 {timeWindow === "3600" ? "1小时" : `${parseInt(timeWindow) / 60}分钟`} 内访问最频繁的键</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {topKeys.top_keys.map((item, index) => (
                                <div key={item.key} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm font-semibold text-muted-foreground w-6">
                                            #{index + 1}
                                        </span>
                                        <code className="text-sm font-mono">{item.key}</code>
                                    </div>
                                    <span className="text-sm font-semibold">
                                        {formatNumber(item.count)} 次
                                    </span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
