"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CacheStatsTab } from "@/components/admin/cache/CacheStatsTab";
import { CacheConfigTab } from "@/components/admin/cache/CacheConfigTab";
import { CacheOperationsTab } from "@/components/admin/cache/CacheOperationsTab";
import { CacheWarmingTab } from "@/components/admin/cache/CacheWarmingTab";
import { Database, Settings, Trash2, Zap } from "lucide-react";

export default function CacheManagementPage() {
    const [activeTab, setActiveTab] = useState("stats");

    return (
        <div className="space-y-6">
            {/* 页面标题 */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">缓存管理</h1>
                <p className="text-muted-foreground mt-2">
                    监控和管理双层缓存系统（L1 内存缓存 + L2 Redis 缓存）
                </p>
            </div>

            {/* 标签页 */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="stats" className="flex items-center gap-2">
                        <Database className="h-4 w-4" />
                        统计概览
                    </TabsTrigger>
                    <TabsTrigger value="config" className="flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        配置管理
                    </TabsTrigger>
                    <TabsTrigger value="operations" className="flex items-center gap-2">
                        <Trash2 className="h-4 w-4" />
                        缓存操作
                    </TabsTrigger>
                    <TabsTrigger value="warming" className="flex items-center gap-2">
                        <Zap className="h-4 w-4" />
                        预热管理
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="stats" className="space-y-4">
                    <CacheStatsTab />
                </TabsContent>

                <TabsContent value="config" className="space-y-4">
                    <CacheConfigTab />
                </TabsContent>

                <TabsContent value="operations" className="space-y-4">
                    <CacheOperationsTab />
                </TabsContent>

                <TabsContent value="warming" className="space-y-4">
                    <CacheWarmingTab />
                </TabsContent>
            </Tabs>
        </div>
    );
}
