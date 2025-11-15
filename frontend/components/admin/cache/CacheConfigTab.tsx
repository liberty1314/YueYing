"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cacheApi, CacheConfig } from "@/lib/cache-api";
import { Settings, Save, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

export function CacheConfigTab() {
    const [config, setConfig] = useState<CacheConfig | null>(null);
    const [formData, setFormData] = useState<Partial<CacheConfig>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const { toast } = useToast();

    const loadConfig = async () => {
        try {
            setLoading(true);
            const data = await cacheApi.getConfig();
            setConfig(data);
            setFormData(data);
        } catch (error: any) {
            toast({
                title: "加载失败",
                description: error.response?.data?.detail || "无法加载缓存配置",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadConfig();
    }, []);

    const handleSave = async () => {
        try {
            setSaving(true);
            const result = await cacheApi.updateConfig(formData);
            setConfig(result.config);
            setFormData(result.config);
            toast({
                title: "保存成功",
                description: result.message,
            });
        } catch (error: any) {
            toast({
                title: "保存失败",
                description: error.response?.data?.detail || "无法更新缓存配置",
                variant: "destructive",
            });
        } finally {
            setSaving(false);
        }
    };

    const handleReset = () => {
        if (config) {
            setFormData(config);
            toast({
                title: "已重置",
                description: "配置已恢复到上次保存的状态",
            });
        }
    };

    if (loading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-64 w-full" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* L1 缓存配置 */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5" />
                        L1 缓存配置（内存 LRU）
                    </CardTitle>
                    <CardDescription>配置进程内内存缓存的参数</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="l1_max_size">最大条目数</Label>
                            <Input
                                id="l1_max_size"
                                type="number"
                                min="100"
                                max="10000"
                                value={formData.l1_max_size || 0}
                                onChange={(e) =>
                                    setFormData({ ...formData, l1_max_size: parseInt(e.target.value) })
                                }
                            />
                            <p className="text-sm text-muted-foreground">
                                范围：100-10000，当前：{config?.l1_max_size}
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="l1_default_ttl">默认 TTL（秒）</Label>
                            <Input
                                id="l1_default_ttl"
                                type="number"
                                min="0"
                                max="86400"
                                value={formData.l1_default_ttl || 0}
                                onChange={(e) =>
                                    setFormData({ ...formData, l1_default_ttl: parseInt(e.target.value) })
                                }
                            />
                            <p className="text-sm text-muted-foreground">
                                范围：0-86400（24小时），当前：{config?.l1_default_ttl}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* L2 缓存配置 */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5" />
                        L2 缓存配置（Redis）
                    </CardTitle>
                    <CardDescription>配置 Redis 分布式缓存的参数</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="l2_default_ttl">默认 TTL（秒）</Label>
                        <Input
                            id="l2_default_ttl"
                            type="number"
                            min="0"
                            max="604800"
                            value={formData.l2_default_ttl || 0}
                            onChange={(e) =>
                                setFormData({ ...formData, l2_default_ttl: parseInt(e.target.value) })
                            }
                        />
                        <p className="text-sm text-muted-foreground">
                            范围：0-604800（7天），当前：{config?.l2_default_ttl}
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* 预热配置 */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5" />
                        缓存预热配置
                    </CardTitle>
                    <CardDescription>配置缓存预热的行为</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label htmlFor="warming_enabled">启用缓存预热</Label>
                            <p className="text-sm text-muted-foreground">
                                是否启用定时缓存预热功能
                            </p>
                        </div>
                        <Switch
                            id="warming_enabled"
                            checked={formData.warming_enabled || false}
                            onCheckedChange={(checked) =>
                                setFormData({ ...formData, warming_enabled: checked })
                            }
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label htmlFor="warming_on_startup">启动时预热</Label>
                            <p className="text-sm text-muted-foreground">
                                应用启动时是否自动执行预热
                            </p>
                        </div>
                        <Switch
                            id="warming_on_startup"
                            checked={formData.warming_on_startup || false}
                            onCheckedChange={(checked) =>
                                setFormData({ ...formData, warming_on_startup: checked })
                            }
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="warming_batch_size">预热批次大小</Label>
                        <Input
                            id="warming_batch_size"
                            type="number"
                            min="10"
                            max="1000"
                            value={formData.warming_batch_size || 0}
                            onChange={(e) =>
                                setFormData({ ...formData, warming_batch_size: parseInt(e.target.value) })
                            }
                        />
                        <p className="text-sm text-muted-foreground">
                            范围：10-1000，当前：{config?.warming_batch_size}
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* 统计配置 */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5" />
                        统计配置
                    </CardTitle>
                    <CardDescription>配置缓存统计收集的参数</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label htmlFor="stats_enabled">启用统计收集</Label>
                            <p className="text-sm text-muted-foreground">
                                是否收集缓存访问统计信息
                            </p>
                        </div>
                        <Switch
                            id="stats_enabled"
                            checked={formData.stats_enabled || false}
                            onCheckedChange={(checked) =>
                                setFormData({ ...formData, stats_enabled: checked })
                            }
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="stats_max_history">统计历史最大条目数</Label>
                        <Input
                            id="stats_max_history"
                            type="number"
                            min="100"
                            max="100000"
                            value={formData.stats_max_history || 0}
                            onChange={(e) =>
                                setFormData({ ...formData, stats_max_history: parseInt(e.target.value) })
                            }
                        />
                        <p className="text-sm text-muted-foreground">
                            范围：100-100000，当前：{config?.stats_max_history}
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* 操作按钮 */}
            <div className="flex items-center gap-4">
                <Button onClick={handleSave} disabled={saving}>
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? "保存中..." : "保存配置"}
                </Button>
                <Button onClick={handleReset} variant="outline" disabled={saving}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    重置
                </Button>
            </div>
        </div>
    );
}
