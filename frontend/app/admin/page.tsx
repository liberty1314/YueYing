"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminDashboardSkeleton } from "@/components/admin/AdminDashboardSkeleton";
import { Activity, Bot, Database, Users, CheckCircle2, XCircle } from "lucide-react";
import { llmConfigApi } from "@/lib/llm-config-api";
import type { LLMConfig } from "@/types/llm-config";

export default function AdminDashboardPage() {
  const { data: session } = useSession();
  const [llmConfig, setLlmConfig] = useState<LLMConfig | null>(null);
  const [llmLoading, setLlmLoading] = useState(true);

  useEffect(() => {
    const loadLLMConfig = async () => {
      try {
        const config = await llmConfigApi.getConfig();
        setLlmConfig(config);
      } catch (err: any) {
        // 404 表示没有配置，这是正常的
        if (err.response?.status !== 404) {
          console.error("加载 LLM 配置失败:", err);
        }
        setLlmConfig(null);
      } finally {
        setLlmLoading(false);
      }
    };

    loadLLMConfig();
  }, []);

  // 获取 LLM 状态显示
  const getLLMStatus = () => {
    if (llmLoading) {
      return {
        text: "加载中...",
        status: "loading",
        description: "正在检查配置",
      };
    }

    if (!llmConfig) {
      return {
        text: "未配置",
        status: "not-configured",
        description: "请配置 LLM",
      };
    }

    if (!llmConfig.enabled) {
      return {
        text: "已禁用",
        status: "disabled",
        description: "LLM 功能已禁用",
      };
    }

    // 映射提供商名称
    const providerNames: Record<string, string> = {
      siliconflow: "硅基流动",
      deepseek: "DeepSeek",
      openai: "OpenAI",
      claude: "Claude",
    };

    return {
      text: providerNames[llmConfig.provider] || llmConfig.provider,
      status: "enabled",
      description: llmConfig.enabled ? "LLM 功能已启用" : "LLM 功能已禁用",
    };
  };

  const llmStatus = getLLMStatus();

  // 显示骨架屏当加载中
  if (llmLoading) {
    return <AdminDashboardSkeleton />;
  }

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">仪表板</h1>
        <p className="text-muted-foreground">欢迎回来，{session?.user?.name || "管理员"}</p>
      </div>

      {/* 概览卡片 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总用户数</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">
              功能开发中
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">LLM 状态</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {llmStatus.status === "enabled" && (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              )}
              {llmStatus.status === "disabled" && (
                <XCircle className="h-5 w-5 text-yellow-500" />
              )}
              {llmStatus.status === "not-configured" && (
                <XCircle className="h-5 w-5 text-muted-foreground" />
              )}
              <div className={`text-2xl font-bold ${
                llmStatus.status === "enabled" 
                  ? "text-green-600" 
                  : llmStatus.status === "disabled"
                  ? "text-yellow-600"
                  : "text-muted-foreground"
              }`}>
                {llmStatus.text}
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {llmStatus.description}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">数据库大小</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">
              功能开发中
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">系统状态</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">正常</div>
            <p className="text-xs text-muted-foreground">
              所有服务运行正常
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 快速操作 */}
      <Card>
        <CardHeader>
          <CardTitle>快速操作</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <a
            href="/admin/llm-config"
            className="flex items-center justify-between rounded-lg border p-4 hover:bg-accent"
          >
            <div className="flex items-center gap-4">
              <Bot className="h-8 w-8 text-primary" />
              <div>
                <h3 className="font-semibold">配置 LLM</h3>
                <p className="text-sm text-muted-foreground">
                  设置 AI 模型和 API 密钥
                </p>
              </div>
            </div>
          </a>

          <a
            href="/admin/users"
            className="flex items-center justify-between rounded-lg border p-4 hover:bg-accent"
          >
            <div className="flex items-center gap-4">
              <Users className="h-8 w-8 text-primary" />
              <div>
                <h3 className="font-semibold">用户管理</h3>
                <p className="text-sm text-muted-foreground">
                  管理用户账户和权限
                </p>
              </div>
            </div>
          </a>
        </CardContent>
      </Card>
    </div>
  );
}

