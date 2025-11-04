"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { aiTagsApi } from "@/lib/ai-tags-api";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Sparkles } from "lucide-react";
import type { Tag } from "@/types/tag";

interface AITagGeneratorProps {
  userItemId: number;
  onTagsGenerated: (tags: Tag[]) => void;
  disabled?: boolean;
}

export function AITagGenerator({
  userItemId,
  onTagsGenerated,
  disabled = false,
}: AITagGeneratorProps) {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const result = await aiTagsApi.generateTags({
        user_item_id: userItemId,
        include_notes: true,
      });

      // 将生成的标签转换为 Tag 类型
      const generatedTags: Tag[] = result.tags.map((tag) => ({
        id: tag.id,
        user_id: 0, // 这个值在后端已经设置
        name: tag.name,
        type: "custom" as const,
        is_auto: true,
        color: null,
        description: null,
        usage_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));

      onTagsGenerated(generatedTags);

      toast({
        title: "生成成功",
        description: `已生成 ${result.total} 个 AI 标签`,
      });
    } catch (err: any) {
      console.error("Failed to generate tags:", err);
      toast({
        title: "生成失败",
        description: err.response?.data?.detail || "无法生成 AI 标签",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleGenerate}
      disabled={disabled || isGenerating}
    >
      {isGenerating ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          生成中...
        </>
      ) : (
        <>
          <Sparkles className="mr-2 h-4 w-4" />
          AI 生成标签
        </>
      )}
    </Button>
  );
}

