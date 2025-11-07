import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * 统计页面骨架屏组件
 * 模拟统计页面的主要布局，防止内容加载时的 Layout Shift
 */
export function StatsSkeleton() {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-background">
      <div className="container py-8">
        {/* 页面标题 */}
        <div className="mb-6">
          <Skeleton className="h-9 w-48 mb-2" />
          <Skeleton className="h-5 w-96" />
        </div>

        <div className="mt-6 space-y-6">
          {/* 模块一：数据总览卡片 */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Card key={index} className="overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-10 w-10 rounded-full" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-24 mb-2" />
                  <Skeleton className="h-3 w-16" />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* 模块二：活动热力图 */}
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: 84 }).map((_, index) => (
                    <Skeleton key={index} className="h-3 w-full" />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 模块三：最近活动轮播 */}
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 overflow-hidden">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="flex-shrink-0 w-48">
                    <Skeleton className="h-64 w-full rounded-lg mb-2" />
                    <Skeleton className="h-4 w-full mb-1" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 双栏布局：消费分析 + AI洞察 */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* 消费分析（占2列） */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* 图表占位 */}
                    <Skeleton className="h-64 w-full" />
                    <div className="grid grid-cols-2 gap-4">
                      <Skeleton className="h-32 w-full" />
                      <Skeleton className="h-32 w-full" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* AI洞察（占1列） */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Array.from({ length: 6 }).map((_, index) => (
                      <div key={index}>
                        <Skeleton className="h-4 w-full mb-1" />
                        <Skeleton className="h-3 w-3/4" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

