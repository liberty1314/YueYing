/**
 * 关键词云展示组件
 * 使用纯CSS实现，无需外部依赖
 */
"use client";

import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import type { KeywordItem } from "@/lib/summary-api";

interface KeywordCloudProps {
  keywords: KeywordItem[];
  maxSize?: number;
  minSize?: number;
  colors?: string[];
}

export function KeywordCloud({
  keywords,
  maxSize = 32,
  minSize = 14,
  colors = [
    "text-blue-500",
    "text-purple-500",
    "text-pink-500",
    "text-indigo-500",
    "text-cyan-500",
    "text-teal-500",
    "text-green-500",
    "text-yellow-500",
    "text-orange-500",
    "text-red-500",
  ],
}: KeywordCloudProps) {
  // 计算每个关键词的字体大小
  const processedKeywords = useMemo(() => {
    if (keywords.length === 0) return [];

    // 找出最大和最小的count
    const counts = keywords.map((k) => k.count);
    const maxCount = Math.max(...counts);
    const minCount = Math.min(...counts);
    const countRange = maxCount - minCount || 1;

    return keywords.map((keyword, index) => {
      // 计算相对大小 (0-1)
      const relativeSize = (keyword.count - minCount) / countRange;
      // 映射到字体大小范围
      const fontSize = minSize + relativeSize * (maxSize - minSize);
      // 随机选择颜色
      const colorClass = colors[index % colors.length];

      return {
        ...keyword,
        fontSize: Math.round(fontSize),
        colorClass,
      };
    });
  }, [keywords, maxSize, minSize, colors]);

  if (processedKeywords.length === 0) {
    return (
      <Card className="p-8">
        <div className="text-center text-muted-foreground">
          <p>暂无关键词数据</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-3 p-4">
      {processedKeywords.map((keyword, index) => (
        <div
          key={index}
          className={`transition-all hover:scale-110 cursor-default ${keyword.colorClass}`}
          style={{
            fontSize: `${keyword.fontSize}px`,
            fontWeight: 500 + Math.floor((keyword.fontSize - minSize) / (maxSize - minSize) * 200),
            lineHeight: 1.2,
          }}
          title={`出现 ${keyword.count} 次`}
        >
          {keyword.word}
        </div>
      ))}
    </div>
  );
}

