/**
 * LLM 配置表单的 Schema 和类型定义
 */

import * as z from "zod";

export const formSchema = z.object({
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

export type FormValues = z.infer<typeof formSchema>;

// 脱敏显示密钥（显示前后各4个字符）
export function maskApiKey(apiKey: string | null | undefined): string {
    if (!apiKey || apiKey.length < 8) return "****";
    return `${apiKey.slice(0, 4)}...${apiKey.slice(-4)}`;
}
