"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { TagStats } from "@/types/stats";

interface TopTagsCloudProps {
  data: TagStats[];
}

export function TopTagsCloud({ data }: TopTagsCloudProps) {
  // 根据使用次数计算字体大小
  const maxCount = Math.max(...data.map((tag) => tag.count));
  const minSize = 14;
  const maxSize = 32;

  const getFontSize = (count: number) => {
    const ratio = (count - 1) / (maxCount - 1 || 1);
    return minSize + ratio * (maxSize - minSize);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>热门标签</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-3 items-center justify-center py-4">
          {data.map((tag, index) => (
            <Badge
              key={index}
              variant="secondary"
              style={{
                fontSize: `${getFontSize(tag.count)}px`,
                backgroundColor: tag.color ? `${tag.color}20` : undefined,
                borderColor: tag.color || undefined,
              }}
              className="px-3 py-1"
            >
              {tag.tag_name} ({tag.count})
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

