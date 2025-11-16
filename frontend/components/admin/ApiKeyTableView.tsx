"use client";

import { useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NeumorphicSwitch } from "@/components/ui/neumorphic-switch";
import {
    Film,
    Book,
    Tv,
    Edit,
    TestTube2,
    CheckCircle2,
    XCircle,
    Clock,
    Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { apiKeyApi } from "@/lib/api-key-api";
import { useToast } from "@/hooks/use-toast";
import type { ApiKeyConfig, ServiceInfo } from "@/types/api-key";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";

interface ApiKeyTableViewProps {
    configs: ApiKeyConfig[];
    serviceInfoMap: Record<string, ServiceInfo>;
    onUpdate: () => void;
}

export function ApiKeyTableView({
    configs,
    serviceInfoMap,
    onUpdate,
}: ApiKeyTableViewProps) {
    const { toast } = useToast();
    const [editingService, setEditingService] = useState<string | null>(null);
    const [testingService, setTestingService] = useState<string | null>(null);
    const [togglingService, setTogglingService] = useState<string | null>(null);

    // 获取服务图标
    const getServiceIcon = (service: string) => {
        switch (service) {
            case "tmdb":
                return <Film className="h-4 w-4" />;
            case "google_books":
                return <Book className="h-4 w-4" />;
            case "bangumi":
                return <Tv className="h-4 w-4" />;
            default:
                return <Film className="h-4 w-4" />;
        }
    };

    // 获取状态徽章
    const getStatusBadge = (status: string) => {
        if (status === "success") {
            return (
                <Badge className="bg-green-500 hover:bg-green-600 gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    正常
                </Badge>
            );
        } else if (status === "failed") {
            return (
                <Badge variant="destructive" className="gap-1">
                    <XCircle className="h-3 w-3" />
                    失败
                </Badge>
            );
        } else {
            return (
                <Badge variant="secondary" className="gap-1">
                    <Clock className="h-3 w-3" />
                    未测试
                </Badge>
            );
        }
    };

    // 格式化时间
    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return "从未";
        try {
            return format(new Date(dateStr), "yyyy-MM-dd HH:mm", { locale: zhCN });
        } catch {
            return dateStr;
        }
    };

    // 测试连接
    const handleTest = async (service: string) => {
        setTestingService(service);
        try {
            const result = await apiKeyApi.testConnection(service);

            if (result.success) {
                toast({
                    title: "测试成功",
                    description: result.message,
                });
            } else {
                toast({
                    title: "测试失败",
                    description: result.message,
                    variant: "destructive",
                });
            }

            onUpdate();
        } catch (error: any) {
            console.error("测试连接失败:", error);
            toast({
                title: "测试失败",
                description: error.response?.data?.detail || "无法测试连接",
                variant: "destructive",
            });
        } finally {
            setTestingService(null);
        }
    };

    // 切换启用状态
    const handleToggleEnabled = async (service: string, enabled: boolean) => {
        setTogglingService(service);
        try {
            await apiKeyApi.updateConfig(service, { enabled });
            toast({
                title: "更新成功",
                description: `${serviceInfoMap[service]?.name || service} 已${enabled ? "启用" : "禁用"
                    }`,
            });
            onUpdate();
        } catch (error: any) {
            console.error("更新状态失败:", error);
            toast({
                title: "更新失败",
                description: error.response?.data?.detail || "无法更新状态",
                variant: "destructive",
            });
        } finally {
            setTogglingService(null);
        }
    };

    return (
        <>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[200px]">服务</TableHead>
                            <TableHead>API 密钥</TableHead>
                            <TableHead>状态</TableHead>
                            <TableHead>最后测试</TableHead>
                            <TableHead className="w-[100px]">启用</TableHead>
                            <TableHead className="text-right w-[150px]">操作</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {configs.map((config) => {
                            const serviceInfo = serviceInfoMap[config.service];
                            if (!serviceInfo) return null;

                            return (
                                <TableRow key={config.service}>
                                    {/* 服务名称 */}
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <div className="p-1.5 rounded bg-primary/10">
                                                {getServiceIcon(config.service)}
                                            </div>
                                            <div>
                                                <div className="font-medium">{serviceInfo.name}</div>
                                                <div className="text-xs text-muted-foreground">
                                                    {serviceInfo.description}
                                                </div>
                                            </div>
                                        </div>
                                    </TableCell>

                                    {/* API 密钥 */}
                                    <TableCell>
                                        {config.has_key ? (
                                            <code className="text-xs bg-muted px-2 py-1 rounded">
                                                {config.api_key_preview}
                                            </code>
                                        ) : (
                                            <span className="text-sm text-muted-foreground">
                                                未配置
                                            </span>
                                        )}
                                    </TableCell>

                                    {/* 状态 */}
                                    <TableCell>{getStatusBadge(config.test_status)}</TableCell>

                                    {/* 最后测试时间 */}
                                    <TableCell className="text-sm">
                                        {formatDate(config.last_tested_at)}
                                    </TableCell>

                                    {/* 启用开关 */}
                                    <TableCell>
                                        <NeumorphicSwitch
                                            checked={config.enabled}
                                            onCheckedChange={(checked) =>
                                                handleToggleEnabled(config.service, checked)
                                            }
                                            disabled={togglingService === config.service}
                                        />
                                    </TableCell>

                                    {/* 操作按钮 */}
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setEditingService(config.service)}
                                            >
                                                <Edit className="h-3 w-3 mr-1" />
                                                编辑
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleTest(config.service)}
                                                disabled={
                                                    !config.has_key || testingService === config.service
                                                }
                                            >
                                                {testingService === config.service ? (
                                                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                                ) : (
                                                    <TestTube2 className="h-3 w-3 mr-1" />
                                                )}
                                                测试
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>

            {/* 编辑对话框 */}
            {editingService && (
                <EditDialog
                    config={configs.find((c) => c.service === editingService)!}
                    serviceInfo={serviceInfoMap[editingService]}
                    onClose={() => setEditingService(null)}
                    onUpdate={onUpdate}
                />
            )}
        </>
    );
}

// 编辑对话框组件
function EditDialog({
    config,
    serviceInfo,
    onClose,
    onUpdate,
}: {
    config: ApiKeyConfig;
    serviceInfo: ServiceInfo;
    onClose: () => void;
    onUpdate: () => void;
}) {
    const { toast } = useToast();
    const [showKey, setShowKey] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoadingKey, setIsLoadingKey] = useState(false);
    const [apiKey, setApiKey] = useState("");
    const [baseUrl, setBaseUrl] = useState(
        config.base_url || serviceInfo.defaultBaseUrl
    );

    // 切换密钥显示
    const handleToggleKey = async () => {
        if (!showKey && config.has_key && !apiKey) {
            setIsLoadingKey(true);
            try {
                const fullConfig = await apiKeyApi.getConfig(serviceInfo.service, true);
                setApiKey(fullConfig.api_key || "");
                setShowKey(true);
            } catch (error: any) {
                console.error("获取密钥失败:", error);
                toast({
                    title: "获取失败",
                    description: error.response?.data?.detail || "无法获取完整密钥",
                    variant: "destructive",
                });
            } finally {
                setIsLoadingKey(false);
            }
        } else {
            setShowKey(!showKey);
        }
    };

    // 保存配置
    const handleSave = async () => {
        setIsSaving(true);
        try {
            await apiKeyApi.updateConfig(serviceInfo.service, {
                api_key: apiKey || undefined,
                base_url: baseUrl || undefined,
            });

            toast({
                title: "保存成功",
                description: `${serviceInfo.name} 配置已更新`,
            });

            onUpdate();
            onClose();
        } catch (error: any) {
            console.error("保存配置失败:", error);
            toast({
                title: "保存失败",
                description: error.response?.data?.detail || "无法保存配置",
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>编辑 {serviceInfo.name} 配置</DialogTitle>
                    <DialogDescription>{serviceInfo.description}</DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* API 密钥 */}
                    <div className="space-y-2">
                        <Label htmlFor="api-key">API 密钥</Label>
                        <div className="relative">
                            <Input
                                id="api-key"
                                type={showKey ? "text" : "password"}
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                placeholder={
                                    config.has_key ? config.api_key_preview || "" : "请输入 API 密钥"
                                }
                                className="pr-10"
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                onClick={handleToggleKey}
                                disabled={isLoadingKey}
                                tabIndex={-1}
                            >
                                {isLoadingKey ? (
                                    <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />
                                ) : showKey ? (
                                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                    <Eye className="h-4 w-4 text-muted-foreground" />
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* 基础 URL */}
                    {serviceInfo.baseUrlRequired && (
                        <div className="space-y-2">
                            <Label htmlFor="base-url">基础 URL</Label>
                            <Input
                                id="base-url"
                                type="url"
                                value={baseUrl}
                                onChange={(e) => setBaseUrl(e.target.value)}
                                placeholder={serviceInfo.defaultBaseUrl}
                            />
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={onClose}>
                        取消
                    </Button>
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        保存
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
