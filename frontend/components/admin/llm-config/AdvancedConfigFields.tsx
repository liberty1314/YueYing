/**
 * LLM 配置表单 - 高级配置字段
 */

import { UseFormReturn } from "react-hook-form";
import {
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import type { FormValues } from "./form-schema";

interface AdvancedConfigFieldsProps {
    form: UseFormReturn<FormValues>;
}

export function AdvancedConfigFields({ form }: AdvancedConfigFieldsProps) {
    return (
        <>
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
                                onChange={(e) =>
                                    field.onChange(
                                        e.target.value ? parseInt(e.target.value) : undefined
                                    )
                                }
                            />
                        </FormControl>
                        <FormDescription>最大生成 token 数</FormDescription>
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
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
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
                            <FormDescription>使用 AI 自动为内容生成标签</FormDescription>
                        </div>
                        <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
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
                            <Textarea placeholder="配置说明..." {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </>
    );
}
