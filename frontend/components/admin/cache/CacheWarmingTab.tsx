"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cacheApi, WarmingStatus, WarmingHistory, WarmingStrategy } from "@/lib/cache-api";
import { Zap, RefreshCw, Clock, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

export function CacheWarmingTab() {
    const [status, setStatus] = useState<WarmingStatus | null>(null);
    const [history, setHistory] = useState<WarmingHistory[]>([]);
    const [strategies, setStrategies] = useState<WarmingStrategy[]>([]);
    const [loading, setLoading] = useState(true);
    const [triggering, setTriggering] = useState(false);
    const { toast } = useToast();

    const loadData = async () => {
        try {
            setLoading(true);
            const [statusData, historyData, strategiesData] = await Promise.all([
                cacheApi.getWarmingStatus(),
                cacheApi.getWarmingHistory(10),
                cacheApi.getWarmingStrategies(),
            ]);
            setStatus(statusData);
            setHistory(historyData.history);
            setStrategies(strategiesData.strategies);
        } catch (error: any) {
            toast({
                title: "加载失败",
                description: error.response?.data?.detail || "无法加载预热信息",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
        // 每 10 秒自动刷新状态
        const interval = setInterval(loadData, 10000);
        return () => clearInterval(interval);
    }, []);

    const handleTrigger = async () => {
        try {
            setTriggering(true);
            const result = await cacheApi.triggerWarming();
            toast({
                title: "预热已触发",
                description: result.message,
            });
            // 等待 2 秒后刷新状态
            setTimeout(loadData, 2000);
        } catch (error: any) {
            toast({
                title: "触发失败",
                description: error.response?.data?.detail || "无法触发缓存预热",
                variant: "destructive",
            });
        } finally {
            setTriggering(false);
        }
    };

    const formatDuration = (seconds: number) => {
        if (seconds < 60) return `${seconds.toFixed(1)} 秒`;
        return `${(seconds / 60).toFixed(1)} 分钟`;
    };

    const formatDateTime = (dateStr: string) => {
        // 后端返回的是 UTC 时间，需要添加 Z 后缀确保正确解析
        const utcDate = dateStr.endsWith('Z') ? dateStr : dateStr + 'Z';
        return new Date(utcDate).toLocaleString("zh-CN", {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });
    };

    if (loading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-64 w-full" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* 当前状态 */}
            {status && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Zap className="h-5 w-5" />
                            预热状态
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-muted-foreground">当前状态</p>
                                <div className="flex items-center gap-2 mt-1">
                                    {status.is_warming ? (
                                        <>
                                            <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                                            <span className="text-lg font-semibold text-blue-600">运行中</span>
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                                            <span className="text-lg font-semibold text-green-600">空闲</span>
                                        </>
                                    )}
                                </div>
                            </div>

                            {status.last_run && (
                                <div>
                                    <p className="text-sm text-muted-foreground">上次运行</p>
                                    <p className="text-lg font-semibold mt-1">
                                        {formatDateTime(status.last_run)}
                                    </p>
                                </div>
                            )}

                            {status.last_duration_seconds !== undefined && (
                                <div>
                                    <p className="text-sm text-muted-foreground">运行时长</p>
                                    <p className="text-lg font-semibold mt-1">
                                        {formatDuration(status.last_duration_seconds)}
                                    </p>
                                </div>
                            )}

                            {status.items_warmed !== undefined && (
                                <div>
                                    <p className="text-sm text-muted-foreground">预热条目数</p>
                                    <p className="text-lg font-semibold mt-1">
                                        {status.items_warmed.toLocaleString()}
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-4 pt-4">
                            <Button
                                onClick={handleTrigger}
                                disabled={triggering || status.is_warming}
                            >
                                <Zap className="h-4 w-4 mr-2" />
                                {triggering ? "触发中..." : "手动触发预热"}
                            </Button>
                            <Button onClick={loadData} variant="outline" size="sm">
                                <RefreshCw className="h-4 w-4 mr-2" />
                                刷新
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* 预热策略 */}
            {strategies.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>预热策略</CardTitle>
                        <CardDescription>当前配置的缓存预热策略</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {strategies.map((strategy) => (
                                <div
                                    key={strategy.name}
                                    className="flex items-center justify-between p-3 bg-muted rounded-lg"
                                >
                                    <div>
                                        <p className="font-semibold">{strategy.name}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {strategy.description}
                                        </p>
                                    </div>
                                    <Badge variant={strategy.enabled ? "default" : "secondary"}>
                                        {strategy.enabled ? "启用" : "禁用"}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* 预热历史 */}
            {history.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="h-5 w-5" />
                            预热历史
                        </CardTitle>
                        <CardDescription>最近 10 次预热记录</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {history.map((record, index) => (
                                <div
                                    key={index}
                                    className="flex items-start justify-between p-3 bg-muted rounded-lg"
                                >
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            {record.status === "completed" ? (
                                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                                            ) : (
                                                <XCircle className="h-4 w-4 text-red-600" />
                                            )}
                                            <span className="font-semibold">
                                                {formatDateTime(record.timestamp)}
                                            </span>
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            <span>耗时：{formatDuration(record.duration_seconds)}</span>
                                            <span className="mx-2">•</span>
                                            <span>预热：{record.items_warmed.toLocaleString()} 条</span>
                                        </div>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {record.strategies.map((strategy) => (
                                                <Badge key={strategy} variant="outline" className="text-xs">
                                                    {strategy}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                    <Badge
                                        variant={record.status === "completed" ? "default" : "destructive"}
                                    >
                                        {record.status === "completed" ? "成功" : "失败"}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
