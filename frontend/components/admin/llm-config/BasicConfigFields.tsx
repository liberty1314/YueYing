/**
 * LLM 配置表单 - 基础配置字段
 */

import { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
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
import { Loader2, Eye, EyeOff } from "lucide-react";
import type { FormValues } from "./form-schema";

interface BasicConfigFieldsProps {
    form: UseFormReturn<FormValues>;
    hasKey: boolean;
    keyPreview: string;
    showApiKey: boolean;
    isLoadingKey: boolean;
    onProviderChange: (provider: string) => void;
    onToggleKey: () => void;
}

export function BasicConfigFields({
    form,
    hasKey,
    keyPreview,
    showApiKey,
    isLoadingKey,
    onProviderChange,
    onToggleKey,
}: BasicConfigFieldsProps) {
    return (
        <>
            {/* 提供商选择 */}
            <FormField
                control={form.control}
                name="provider"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>LLM 提供商</FormLabel>
                        <Select onValueChange={onProviderChange} defaultValue={field.value}>
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
                                    onClick={onToggleKey}
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
                        <FormDescription>请妥善保管您的 API 密钥</FormDescription>
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
                            <Input placeholder="https://api.siliconflow.cn/v1" {...field} />
                        </FormControl>
                        <FormDescription>API 基础 URL（可选）</FormDescription>
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
                            <Input placeholder="deepseek-ai/DeepSeek-V3" {...field} />
                        </FormControl>
                        <FormDescription>
                            默认使用的模型（例如: deepseek-ai/DeepSeek-V3）
                        </FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </>
    );
}
