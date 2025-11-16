/**
 * LLM 配置表单 - 主组件
 */

"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { llmConfigApi } from "@/lib/llm-config-api";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import type { LLMConfig } from "@/types/llm-config";
import { formSchema, maskApiKey, type FormValues } from "./form-schema";
import { BasicConfigFields } from "./BasicConfigFields";
import { AdvancedConfigFields } from "./AdvancedConfigFields";

interface LLMConfigFormProps {
    config: LLMConfig | null;
    onSuccess: () => void;
}

export function LLMConfigForm({ config, onSuccess }: LLMConfigFormProps) {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isTesting, setIsTesting] = useState(false);
    const [isLoadingKey, setIsLoadingKey] = useState(false);
    const [presets, setPresets] = useState<Record<string, any>>({});
    const [showApiKey, setShowApiKey] = useState(false);
    const [hasKey] = useState(!!config?.api_key); // 是否已有密钥
    const [keyPreview] = useState(
        config?.api_key ? maskApiKey(config.api_key) : ""
    ); // 密钥预览

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
            console.error("保存 LLM 配置失败:", err);

            let errorMessage = "保存失败，请稍后重试";
            const errorDetail = err.response?.data?.detail || err.message || "";

            if (errorDetail.includes("验证") || errorDetail.includes("validation")) {
                errorMessage = "配置信息不完整或格式不正确，请检查后重试";
            } else if (
                errorDetail.includes("权限") ||
                errorDetail.includes("permission")
            ) {
                errorMessage = "您没有权限执行此操作";
            } else if (
                errorDetail.includes("网络") ||
                errorDetail.includes("network")
            ) {
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
                let friendlyMessage = result.message;

                if (friendlyMessage.includes("API 密钥")) {
                    friendlyMessage = "API 密钥无效或已过期，请检查密钥是否正确";
                } else if (friendlyMessage.includes("权限")) {
                    friendlyMessage = "API 密钥权限不足，请确认密钥具有所需权限";
                } else if (
                    friendlyMessage.includes("超时") ||
                    friendlyMessage.includes("timeout")
                ) {
                    friendlyMessage = "连接超时，请检查网络连接或稍后重试";
                } else if (!friendlyMessage.includes("不支持")) {
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
            console.error("LLM 连接测试异常:", err);

            let errorMessage = "网络连接失败，请检查网络设置";
            const errorDetail = err.response?.data?.detail || err.message || "";

            if (
                errorDetail.includes("401") ||
                errorDetail.includes("Unauthorized") ||
                errorDetail.includes("invalid") ||
                errorDetail.includes("API key")
            ) {
                errorMessage = "API 密钥无效，请检查密钥是否正确";
            } else if (
                errorDetail.includes("403") ||
                errorDetail.includes("Forbidden")
            ) {
                errorMessage = "访问被拒绝，请检查 API 密钥权限";
            } else if (
                errorDetail.includes("404") ||
                errorDetail.includes("Not Found")
            ) {
                errorMessage = "服务地址不正确，请检查 Base URL 配置";
            } else if (
                errorDetail.includes("timeout") ||
                errorDetail.includes("ETIMEDOUT")
            ) {
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
                <BasicConfigFields
                    form={form}
                    hasKey={hasKey}
                    keyPreview={keyPreview}
                    showApiKey={showApiKey}
                    isLoadingKey={isLoadingKey}
                    onProviderChange={handleProviderChange}
                    onToggleKey={handleToggleKey}
                />

                <AdvancedConfigFields form={form} />

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
                        {config ? "更新配置" : "保存配置"}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
