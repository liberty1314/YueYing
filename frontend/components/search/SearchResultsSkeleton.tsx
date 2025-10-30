"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function SearchResultsSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {/* 统计骨架 */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-24" />
      </div>

      {/* 卡片骨架 */}
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} className="overflow-hidden">
          <CardContent className="p-0">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* 封面骨架 */}
              <Skeleton className="w-full sm:w-32 h-48 sm:h-auto flex-shrink-0" />

              {/* 内容骨架 */}
              <div className="flex flex-1 flex-col justify-between p-4 sm:p-4 sm:pl-0">
                <div className="space-y-3">
                  {/* 标题 */}
                  <Skeleton className="h-6 w-3/4" />
                  {/* 原标题 */}
                  <Skeleton className="h-4 w-1/2" />
                  {/* 简介 */}
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  {/* 元数据 */}
                  <div className="flex gap-3">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>

                {/* 按钮骨架 */}
                <div className="mt-4 flex gap-2">
                  <Skeleton className="h-9 flex-1" />
                  <Skeleton className="h-9 flex-1" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

