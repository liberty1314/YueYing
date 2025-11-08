"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { llmConfigApi } from "@/lib/llm-config-api";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Eye, EyeOff } from "lucide-react";
import type { LLMConfig } from "@/types/llm-config";

const formSchema = z.object({
  provider: z.enum(["siliconflow", "deepseek", "openai", "claude"]),
  api_key: z.string(), // 允许空值（编辑时表示保持不变）
  base_url: z.string().optional(),
  default_model: z.string().optional(),
  temperature: z.number().min(0).max(2),
  max_tokens: z.number().optional(),
  top_p: z.number().min(0).max(1),
  enabled: z.boolean(),
  auto_tag_enabled: z.boolean(),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface LLMConfigFormProps {
  config: LLMConfig | null;
  onSuccess: () => void;
}

// 脱敏显示密钥（显示前后各4个字符）
function maskApiKey(apiKey: string | null | undefined): string {
  if (!apiKey || apiKey.length < 8) return "****";
  return `${apiKey.slice(0, 4)}...${apiKey.slice(-4)}`;
}

export function LLMConfigForm({ config, onSuccess }: LLMConfigFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isLoadingKey, setIsLoadingKey] = useState(false);
  const [presets, setPresets] = useState<Record<string, any>>({});
  const [showApiKey, setShowApiKey] = useState(false);
  const [hasKey] = useState(!!config?.api_key); // 是否已有密钥
  const [keyPreview] = useState(config?.api_key ? maskApiKey(config.api_key) : ""); // 密钥预览

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      provider: config?.provider || "siliconflow",
      api_key: "", // 初始为空，点击眼睛图标时加载
      base_url: config?.base_url || "https://api.siliconflow.cn/v1",
      default_model: config?.default_model || "deepseek-ai/DeepSeek-V3",
      temperature: config?.temperature || 0.7,
      max_tokens: config?.max_tokens || undefined,
      top_p: config?.top_p || 1.0,
      enabled: config?.enabled ?? true,
      auto_tag_enabled: config?.auto_tag_enabled ?? false,
      description: config?.description || "",
    },
  });

  // 加载提供商预设配置
  useEffect(() => {
    const loadPresets = async () => {
      try {
        const data = await llmConfigApi.getProviderPresets();
        setPresets(data);
      } catch (err) {
        console.error("Failed to load provider presets:", err);
      }
    };
    loadPresets();
  }, []);

  // 切换密钥显示
  const handleToggleKey = async () => {
    const currentValue = form.getValues("api_key");
    
    if (!showApiKey && hasKey && !currentValue) {
      // 需要显示密钥，但还没有加载，先获取完整密钥
      setIsLoadingKey(true);
      try {
        const fullConfig = await llmConfigApi.getConfig();
        if (fullConfig?.api_key) {
          form.setValue("api_key", fullConfig.api_key);
          setShowApiKey(true);
        }
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
      setShowApiKey(!showApiKey);
    }
  };

  const onSubmit = async (data: FormValues) => {
    // 验证：创建时必须提供 API 密钥
    if (!config && !data.api_key) {
      toast({
        title: "验证失败",
        description: "请输入 API 密钥",
        variant: "destructive",
      });
      return;
    }

    // 如果 api_key 为空（编辑模式下），则不提交该字段（保持不变）
    const submitData = { ...data };
    if (config && !submitData.api_key) {
      delete (submitData as any).api_key;
    }

    setIsSubmitting(true);
    try {
      if (config) {
        await llmConfigApi.updateConfig(submitData);
        toast({
          title: "更新成功",
          description: "LLM 配置已更新",
        });
      } else {
        await llmConfigApi.createConfig(submitData);
        toast({
          title: "创建成功",
          description: "LLM 配置已创建",
        });
      }
      onSuccess();
    } catch (err: any) {
      // 记录详细错误到控制台
      console.error("保存 LLM 配置失败:", err);
      
      // 友好化错误提示
      let errorMessage = "保存失败，请稍后重试";
      const errorDetail = err.response?.data?.detail || err.message || "";
      
      if (errorDetail.includes("验证") || errorDetail.includes("validation")) {
        errorMessage = "配置信息不完整或格式不正确，请检查后重试";
      } else if (errorDetail.includes("权限") || errorDetail.includes("permission")) {
        errorMessage = "您没有权限执行此操作";
      } else if (errorDetail.includes("网络") || errorDetail.includes("network")) {
        errorMessage = "网络连接失败，请检查网络后重试";
      }
      
      toast({
        title: "保存失败",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 处理提供商切换
  const handleProviderChange = (provider: string) => {
    form.setValue("provider", provider as any);
    
    // 如果有预设配置，自动填充
    if (presets[provider]) {
      const preset = presets[provider];
      
      // 只在有值的情况下填充
      if (preset.base_url) {
        form.setValue("base_url", preset.base_url);
      }
      if (preset.api_key) {
        form.setValue("api_key", preset.api_key);
      }
      if (preset.default_model) {
        form.setValue("default_model", preset.default_model);
      }
      if (preset.description) {
        form.setValue("description", preset.description);
      }
      
      toast({
        title: "已加载预设配置",
        description: `已自动填充 ${provider} 的配置`,
      });
    }
  };

  const handleTestConnection = async () => {
    const values = form.getValues();
    setIsTesting(true);

    try {
      const result = await llmConfigApi.testConnection({
        provider: values.provider,
        api_key: values.api_key,
        base_url: values.base_url,
        model: values.default_model,
      });

      if (result.success) {
        toast({
          title: "测试成功",
          description: `连接正常，响应延迟: ${result.latency}s`,
        });
      } else {
        // 友好化错误信息
        let friendlyMessage = result.message;
        
        if (friendlyMessage.includes("API 密钥")) {
          friendlyMessage = "API 密钥无效或已过期，请检查密钥是否正确";
        } else if (friendlyMessage.includes("权限")) {
          friendlyMessage = "API 密钥权限不足，请确认密钥具有所需权限";
        } else if (friendlyMessage.includes("超时") || friendlyMessage.includes("timeout")) {
          friendlyMessage = "连接超时，请检查网络连接或稍后重试";
        } else if (friendlyMessage.includes("不支持")) {
          // 保持原样
        } else {
          // 其他错误统一处理
          friendlyMessage = "连接失败，请检查配置是否正确";
        }
        
        console.error("LLM 连接测试失败:", result.message);
        
        toast({
          title: "测试失败",
          description: friendlyMessage,
          variant: "destructive",
        });
      }
    } catch (err: any) {
      // 记录详细错误到控制台
      console.error("LLM 连接测试异常:", err);
      
      // 友好化错误提示
      let errorMessage = "网络连接失败，请检查网络设置";
      
      const errorDetail = err.response?.data?.detail || err.message || "";
      
      if (errorDetail.includes("401") || errorDetail.includes("Unauthorized") || errorDetail.includes("invalid") || errorDetail.includes("API key")) {
        errorMessage = "API 密钥无效，请检查密钥是否正确";
      } else if (errorDetail.includes("403") || errorDetail.includes("Forbidden")) {
        errorMessage = "访问被拒绝，请检查 API 密钥权限";
      } else if (errorDetail.includes("404") || errorDetail.includes("Not Found")) {
        errorMessage = "服务地址不正确，请检查 Base URL 配置";
      } else if (errorDetail.includes("timeout") || errorDetail.includes("ETIMEDOUT")) {
        errorMessage = "连接超时，请检查网络或稍后重试";
      } else if (errorDetail.includes("ECONNREFUSED")) {
        errorMessage = "无法连接到服务器，请检查 Base URL 是否正确";
      }
      
      toast({
        title: "测试失败",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* 提供商选择 */}
        <FormField
          control={form.control}
          name="provider"
          render={({ field }) => (
            <FormItem>
              <FormLabel>LLM 提供商</FormLabel>
              <Select onValueChange={handleProviderChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="选择提供商" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="siliconflow">硅基流动 (推荐)</SelectItem>
                  <SelectItem value="deepseek">DeepSeek (直连)</SelectItem>
                  <SelectItem value="openai">OpenAI (直连)</SelectItem>
                  <SelectItem value="claude">Claude (直连)</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                硅基流动支持多个模型，推荐使用。切换提供商会自动加载预设配置
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* API 密钥 */}
        <FormField
          control={form.control}
          name="api_key"
          render={({ field }) => (
            <FormItem>
              <FormLabel>API 密钥</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type={showApiKey ? "text" : "password"}
                    placeholder={hasKey ? keyPreview : "sk-..."}
                    {...field}
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
                    ) : showApiKey ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </FormControl>
              <FormDescription>
                请妥善保管您的 API 密钥
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Base URL */}
        <FormField
          control={form.control}
          name="base_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Base URL</FormLabel>
              <FormControl>
                <Input
                  placeholder="https://api.siliconflow.cn/v1"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                API 基础 URL（可选）
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 默认模型 */}
        <FormField
          control={form.control}
          name="default_model"
          render={({ field }) => (
            <FormItem>
              <FormLabel>默认模型</FormLabel>
              <FormControl>
                <Input
                  placeholder="deepseek-ai/DeepSeek-V3"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                默认使用的模型（例如: deepseek-ai/DeepSeek-V3）
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 温度参数 */}
        <FormField
          control={form.control}
          name="temperature"
          render={({ field }) => (
            <FormItem>
              <FormLabel>温度参数 (Temperature)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  max="2"
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                />
              </FormControl>
              <FormDescription>
                控制生成的随机性 (0-2)，默认 0.7
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 最大 Tokens */}
        <FormField
          control={form.control}
          name="max_tokens"
          render={({ field }) => (
            <FormItem>
              <FormLabel>最大 Tokens（可选）</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="4096"
                  {...field}
                  onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                />
              </FormControl>
              <FormDescription>
                最大生成 token 数
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Top P */}
        <FormField
          control={form.control}
          name="top_p"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Top P</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  max="1"
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                />
              </FormControl>
              <FormDescription>
                Nucleus sampling 参数 (0-1)，默认 1.0
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 启用开关 */}
        <FormField
          control={form.control}
          name="enabled"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">启用 LLM</FormLabel>
                <FormDescription>
                  开启后，系统将使用此配置调用 LLM API
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {/* 自动标签开关 */}
        <FormField
          control={form.control}
          name="auto_tag_enabled"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">启用自动标签</FormLabel>
                <FormDescription>
                  使用 AI 自动为内容生成标签
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {/* 描述 */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>描述（可选）</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="配置说明..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 操作按钮 */}
        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleTestConnection}
            disabled={isTesting || isSubmitting}
          >
            {isTesting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            测试连接
          </Button>

          <Button type="submit" disabled={isSubmitting || isTesting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {config ? "更新配置" : "创建配置"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

