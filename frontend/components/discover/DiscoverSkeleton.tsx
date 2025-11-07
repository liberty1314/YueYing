import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * 探索发现页骨架屏组件
 * 模拟推荐内容网格布局，防止页面加载时的 Layout Shift
 */
export function DiscoverSkeleton() {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-background">
      <div className="container py-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <Skeleton className="h-9 w-48 mb-2" />
          <Skeleton className="h-5 w-96" />
        </div>

        {/* 推荐内容网格 */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 12 }).map((_, index) => (
            <Card key={index} className="overflow-hidden">
              {/* 海报图片占位 */}
              <Skeleton className="h-64 w-full rounded-t-lg" />
              
              <CardContent className="p-4 space-y-2">
                {/* 标题 */}
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-3/4" />
                
                {/* 元数据行 */}
                <div className="flex items-center justify-between pt-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-16" />
                </div>
                
                {/* 评分 */}
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-4 w-20" />
                </div>
                
                {/* 描述 */}
                <div className="pt-2 space-y-1">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 加载更多按钮 */}
        <div className="mt-8 flex justify-center">
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
    </div>
  );
}

