"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { ApiKeyCard } from "@/components/admin/ApiKeyCard";
import { ApiKeyTableView } from "@/components/admin/ApiKeyTableView";
import { Loading } from "@/components/ui/loading";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Key, AlertCircle, LayoutGrid, List } from "lucide-react";
import { apiKeyApi } from "@/lib/api-key-api";
import { useToast } from "@/hooks/use-toast";
import type { ApiKeyConfig, ServiceInfo } from "@/types/api-key";
import { cn } from "@/lib/utils";

// 服务信息配置
const SERVICE_INFO: Record<string, ServiceInfo> = {
  tmdb: {
    service: "tmdb",
    name: "TMDB",
    description: "电影和电视剧数据库",
    icon: "Film",
    baseUrlRequired: true,
    defaultBaseUrl: "https://api.themoviedb.org/3",
  },
  google_books: {
    service: "google_books",
    name: "Google Books",
    description: "Google 图书数据库",
    icon: "Book",
    baseUrlRequired: true,
    defaultBaseUrl: "https://www.googleapis.com/books/v1",
  },
  bangumi: {
    service: "bangumi",
    name: "Bangumi",
    description: "动漫、游戏数据库",
    icon: "Tv",
    baseUrlRequired: true,
    defaultBaseUrl: "https://api.bgm.tv",
  },
};

export default function ApiKeysPage() {
  const { toast } = useToast();
  const [configs, setConfigs] = useState<ApiKeyConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"card" | "list">("list");

  // 从 localStorage 加载视图偏好
  useEffect(() => {
    const savedViewMode = localStorage.getItem("apiKeyViewMode");
    if (savedViewMode === "card" || savedViewMode === "list") {
      setViewMode(savedViewMode);
    }
  }, []);

  // 保存视图偏好到 localStorage
  const handleViewModeChange = (mode: "card" | "list") => {
    setViewMode(mode);
    localStorage.setItem("apiKeyViewMode", mode);
  };

  // 加载配置
  const loadConfigs = async () => {
    setIsLoading(true);
    try {
      const response = await apiKeyApi.getAllConfigs();
      setConfigs(response.configs);
    } catch (error: any) {
      console.error("加载配置失败:", error);
      toast({
        title: "加载失败",
        description: error.response?.data?.detail || "无法加载 API 密钥配置",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 更新单个配置项
  const handleConfigUpdate = (updatedConfig: ApiKeyConfig) => {
    setConfigs((prevConfigs) =>
      prevConfigs.map((config) =>
        config.service === updatedConfig.service ? updatedConfig : config
      )
    );
  };

  useEffect(() => {
    loadConfigs();
  }, []);

  return (
    <div className="space-y-6">
      {/* 页面头部 */}
      <div className="flex items-center justify-between">
        <PageHeader
          title="API 密钥管理"
          description="管理第三方 API 密钥配置"
        />

        {/* 视图切换按钮 */}
        <div className="flex items-center gap-2 bg-muted p-1 rounded-lg">
          <Button
            variant={viewMode === "list" ? "default" : "ghost"}
            size="sm"
            onClick={() => handleViewModeChange("list")}
            className={cn(
              "gap-2",
              viewMode === "list" && "shadow-sm"
            )}
          >
            <List className="h-4 w-4" />
            <span className="hidden sm:inline"></span>
          </Button>
          <Button
            variant={viewMode === "card" ? "default" : "ghost"}
            size="sm"
            onClick={() => handleViewModeChange("card")}
            className={cn(
              "gap-2",
              viewMode === "card" && "shadow-sm"
            )}
          >
            <LayoutGrid className="h-4 w-4" />
            <span className="hidden sm:inline"></span>
          </Button>
        </div>
      </div>

      {/* 说明信息 */}
      <Alert>
        <Key className="h-4 w-4" />
        <AlertTitle>关于 API 密钥</AlertTitle>
        <AlertDescription>
          API 密钥用于访问第三方服务（如 TMDB、Google Books 等）。密钥将加密存储在数据库中。
          配置后，系统将优先使用数据库中的密钥，而不是环境变量。
        </AlertDescription>
      </Alert>

      {/* 配置展示 */}
      {isLoading ? (
        <Loading />
      ) : configs.length === 0 ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>加载失败</AlertTitle>
          <AlertDescription>
            无法加载 API 密钥配置，请检查后端服务是否正常运行。
          </AlertDescription>
        </Alert>
      ) : viewMode === "list" ? (
        <ApiKeyTableView
          configs={configs}
          serviceInfoMap={SERVICE_INFO}
          onUpdate={handleConfigUpdate}
          onFullUpdate={loadConfigs}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {configs.map((config) => {
            const serviceInfo = SERVICE_INFO[config.service];
            if (!serviceInfo) {
              console.warn(`未知的服务类型: ${config.service}`);
              return null;
            }

            return (
              <ApiKeyCard
                key={config.service}
                config={config}
                serviceInfo={serviceInfo}
                onUpdate={handleConfigUpdate}
                onFullUpdate={loadConfigs}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

