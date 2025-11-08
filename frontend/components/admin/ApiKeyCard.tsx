"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Eye, EyeOff, Save, TestTube2, Film, Book, Tv, Loader2, CheckCircle2, XCircle, Clock } from "lucide-react";
import { apiKeyApi } from "@/lib/api-key-api";
import { useToast } from "@/hooks/use-toast";
import type { ApiKeyConfig, ServiceInfo } from "@/types/api-key";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";

interface ApiKeyCardProps {
  config: ApiKeyConfig;
  serviceInfo: ServiceInfo;
  onUpdate: () => void;
}

export function ApiKeyCard({ config, serviceInfo, onUpdate }: ApiKeyCardProps) {
  const { toast } = useToast();
  const [showKey, setShowKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isLoadingKey, setIsLoadingKey] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [baseUrl, setBaseUrl] = useState(config.base_url || serviceInfo.defaultBaseUrl);
  const [enabled, setEnabled] = useState(config.enabled);

  // 获取服务图标
  const getServiceIcon = () => {
    switch (serviceInfo.service) {
      case "tmdb":
        return <Film className="h-6 w-6" />;
      case "google_books":
        return <Book className="h-6 w-6" />;
      case "bangumi":
        return <Tv className="h-6 w-6" />;
      default:
        return <Film className="h-6 w-6" />;
    }
  };

  // 获取状态徽章
  const getStatusBadge = () => {
    if (config.test_status === "success") {
      return (
        <Badge className="bg-green-500 hover:bg-green-600 gap-1">
          <CheckCircle2 className="h-3 w-3" />
          正常
        </Badge>
      );
    } else if (config.test_status === "failed") {
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
    if (!dateStr) return "从未测试";
    try {
      return format(new Date(dateStr), "yyyy-MM-dd HH:mm", { locale: zhCN });
    } catch {
      return dateStr;
    }
  };

  // 切换密钥显示
  const handleToggleKey = async () => {
    if (!showKey && config.has_key && !apiKey) {
      // 需要显示密钥，但还没有加载，先获取完整密钥
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
      // 直接切换显示状态
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
        enabled,
      });

      toast({
        title: "保存成功",
        description: `${serviceInfo.name} 配置已更新`,
      });

      setApiKey(""); // 清空输入框
      onUpdate(); // 刷新配置
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

  // 测试连接
  const handleTest = async () => {
    setIsTesting(true);
    try {
      const result = await apiKeyApi.testConnection(serviceInfo.service);

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

      onUpdate(); // 刷新配置
    } catch (error: any) {
      console.error("测试连接失败:", error);
      toast({
        title: "测试失败",
        description: error.response?.data?.detail || "无法测试连接",
        variant: "destructive",
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              {getServiceIcon()}
            </div>
            <div>
              <CardTitle>{serviceInfo.name}</CardTitle>
              <CardDescription>{serviceInfo.description}</CardDescription>
            </div>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* API 密钥输入 */}
        <div className="space-y-2">
          <Label htmlFor={`${serviceInfo.service}-key`}>API 密钥</Label>
          <div className="relative">
            <Input
              id={`${serviceInfo.service}-key`}
              type={showKey ? "text" : "password"}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={
                config.has_key
                  ? `${config.api_key_preview}`
                  : "请输入 API 密钥"
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
          {!config.has_key && (
            <p className="text-sm text-muted-foreground">
              尚未配置 API 密钥
            </p>
          )}
        </div>

        {/* 基础 URL */}
        {serviceInfo.baseUrlRequired && (
          <div className="space-y-2">
            <Label htmlFor={`${serviceInfo.service}-url`}>基础 URL</Label>
            <Input
              id={`${serviceInfo.service}-url`}
              type="url"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder={serviceInfo.defaultBaseUrl}
            />
          </div>
        )}

        <Separator />

        {/* 启用开关 */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor={`${serviceInfo.service}-enabled`}>启用服务</Label>
            <p className="text-sm text-muted-foreground">
              {enabled ? "服务已启用" : "服务已禁用"}
            </p>
          </div>
          <Switch
            id={`${serviceInfo.service}-enabled`}
            checked={enabled}
            onCheckedChange={setEnabled}
          />
        </div>

        <Separator />

        {/* 测试信息 */}
        <div className="space-y-1 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">最后测试时间：</span>
            <span>{formatDate(config.last_tested_at)}</span>
          </div>
          {config.test_message && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">测试消息：</span>
              <span className="text-right">{config.test_message}</span>
            </div>
          )}
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-2 pt-2">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1"
          >
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Save className="mr-2 h-4 w-4" />
            保存配置
          </Button>
          <Button
            onClick={handleTest}
            disabled={isTesting || !config.has_key}
            variant="outline"
          >
            {isTesting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <TestTube2 className="mr-2 h-4 w-4" />
            测试连接
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

