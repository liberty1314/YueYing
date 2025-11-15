"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cacheApi } from "@/lib/cache-api";
import { Trash2, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function CacheOperationsTab() {
    const [pattern, setPattern] = useState("");
    const [clearL1, setClearL1] = useState(true);
    const [clearL2, setClearL2] = useState(true);
    const [clearing, setClearing] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [confirmAction, setConfirmAction] = useState<() => void>(() => { });
    const { toast } = useToast();

    const handleClearPattern = async () => {
        if (!pattern.trim()) {
            toast({
                title: "请输入模式",
                description: "请输入要清理的缓存键模式",
                variant: "destructive",
            });
            return;
        }

        setConfirmAction(() => async () => {
            try {
                setClearing(true);
                const result = await cacheApi.clearCache({
                    pattern: pattern.trim(),
                    clear_l1: clearL1,
                    clear_l2: clearL2,
                });
                toast({
                    title: "清理成功",
                    description: `${result.message}，删除了 ${result.keys_deleted} 个键`,
                });
                setPattern("");
            } catch (error: any) {
                toast({
                    title: "清理失败",
                    description: error.response?.data?.detail || "无法清理缓存",
                    variant: "destructive",
                });
            } finally {
                setClearing(false);
            }
        });
        setShowConfirm(true);
    };

    const handleClearAll = async () => {
        setConfirmAction(() => async () => {
            try {
                setClearing(true);
                const result = await cacheApi.clearCache({
                    clear_l1: clearL1,
                    clear_l2: clearL2,
                });
                toast({
                    title: "清理成功",
                    description: result.message,
                });
            } catch (error: any) {
                toast({
                    title: "清理失败",
                    description: error.response?.data?.detail || "无法清理缓存",
                    variant: "destructive",
                });
            } finally {
                setClearing(false);
            }
        });
        setShowConfirm(true);
    };

    const commonPatterns = [
        { label: "用户数据", value: "user:*" },
        { label: "TMDB 电影", value: "tmdb:movie:*" },
        { label: "TMDB 电视剧", value: "tmdb:tv:*" },
        { label: "Google Books", value: "google_books:*" },
        { label: "Bangumi", value: "bangumi:*" },
        { label: "统计数据", value: "stats:*" },
    ];

    return (
        <div className="space-y-6">
            {/* 警告提示 */}
            <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                    <strong>警告：</strong>清理缓存操作不可逆，请谨慎操作。建议在低峰期执行大规模清理。
                </AlertDescription>
            </Alert>

            {/* 按模式清理 */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Trash2 className="h-5 w-5" />
                        按模式清理缓存
                    </CardTitle>
                    <CardDescription>
                        使用通配符模式清理特定的缓存键（例如：user:*、tmdb:movie:*）
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="pattern">缓存键模式</Label>
                        <Input
                            id="pattern"
                            placeholder="例如：user:* 或 tmdb:movie:*"
                            value={pattern}
                            onChange={(e) => setPattern(e.target.value)}
                        />
                        <p className="text-sm text-muted-foreground">
                            使用 * 作为通配符，例如 user:* 匹配所有以 user: 开头的键
                        </p>
                    </div>

                    {/* 常用模式快捷按钮 */}
                    <div className="space-y-2">
                        <Label>常用模式</Label>
                        <div className="flex flex-wrap gap-2">
                            {commonPatterns.map((item) => (
                                <Button
                                    key={item.value}
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPattern(item.value)}
                                >
                                    {item.label}
                                </Button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="clear_l1_pattern">清理 L1 缓存（内存）</Label>
                            <Switch
                                id="clear_l1_pattern"
                                checked={clearL1}
                                onCheckedChange={setClearL1}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <Label htmlFor="clear_l2_pattern">清理 L2 缓存（Redis）</Label>
                            <Switch
                                id="clear_l2_pattern"
                                checked={clearL2}
                                onCheckedChange={setClearL2}
                            />
                        </div>
                    </div>

                    <Alert>
                        <AlertDescription>
                            注意：L1 缓存不支持模式删除，指定模式时会跳过 L1 缓存。
                        </AlertDescription>
                    </Alert>

                    <Button
                        onClick={handleClearPattern}
                        disabled={clearing || !pattern.trim()}
                        variant="destructive"
                    >
                        <Trash2 className="h-4 w-4 mr-2" />
                        {clearing ? "清理中..." : "清理匹配的缓存"}
                    </Button>
                </CardContent>
            </Card>

            {/* 清理所有缓存 */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-destructive">
                        <AlertTriangle className="h-5 w-5" />
                        清理所有缓存
                    </CardTitle>
                    <CardDescription>
                        清空所有缓存数据，此操作将影响系统性能，请谨慎使用
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="clear_l1_all">清理 L1 缓存（内存）</Label>
                            <Switch
                                id="clear_l1_all"
                                checked={clearL1}
                                onCheckedChange={setClearL1}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <Label htmlFor="clear_l2_all">清理 L2 缓存（Redis）</Label>
                            <Switch
                                id="clear_l2_all"
                                checked={clearL2}
                                onCheckedChange={setClearL2}
                            />
                        </div>
                    </div>

                    <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                            <strong>危险操作：</strong>此操作将清空所有缓存，可能导致短时间内系统响应变慢。
                            建议在执行后立即触发缓存预热。
                        </AlertDescription>
                    </Alert>

                    <Button
                        onClick={handleClearAll}
                        disabled={clearing}
                        variant="destructive"
                    >
                        <Trash2 className="h-4 w-4 mr-2" />
                        {clearing ? "清理中..." : "清理所有缓存"}
                    </Button>
                </CardContent>
            </Card>

            {/* 确认对话框 */}
            <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>确认清理缓存？</AlertDialogTitle>
                        <AlertDialogDescription>
                            此操作不可逆，清理后的缓存数据无法恢复。确定要继续吗？
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>取消</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                confirmAction();
                                setShowConfirm(false);
                            }}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            确认清理
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
