"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LLMConfigForm } from "@/components/admin/LLMConfigForm";
import { LLMConfigSkeleton } from "@/components/admin/LLMConfigSkeleton";
import { llmConfigApi } from "@/lib/llm-config-api";
import { useToast } from "@/hooks/use-toast";
import type { LLMConfig } from "@/types/llm-config";

export default function LLMConfigPage() {
  const { toast } = useToast();
  const [config, setConfig] = useState<LLMConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadConfig = async () => {
    setIsLoading(true);
    try {
      const data = await llmConfigApi.getConfig();
      setConfig(data);
    } catch (err: any) {
      if (err.response?.status === 404) {
        // 配置不存在，这是正常的
        setConfig(null);
      } else {
        console.error("Failed to load config:", err);
        toast({
          title: "加载失败",
          description: "无法加载 LLM 配置",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  if (isLoading) {
    return <LLMConfigSkeleton />;
  }

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">LLM 配置</h1>
        <p className="text-muted-foreground">
          配置 AI 模型和 API 密钥，启用智能功能
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>模型配置</CardTitle>
          <CardDescription>
            通过硅基流动 API 调用多个 LLM 模型（DeepSeek/Qwen/Llama 等）
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-6">
          <LLMConfigForm 
            config={config} 
            onSuccess={loadConfig} 
          />
        </CardContent>
      </Card>
    </div>
  );
}

