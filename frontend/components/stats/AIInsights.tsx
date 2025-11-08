"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, TrendingUp, Clock, Award, ExternalLink } from "lucide-react";
import { ComprehensiveStats } from "@/types/stats";
import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSystemSettings } from "@/hooks/use-system-settings";

interface AIInsightsProps {
  stats: ComprehensiveStats;
}

export function AIInsights({ stats }: AIInsightsProps) {
  const router = useRouter();
  const { data: systemSettings } = useSystemSettings();
  
  // 生成AI洞察
  const insights = useMemo(() => {
    const insights: Array<{
      icon: any;
      title: string;
      description: string;
      color: string;
    }> = [];

    // 洞察1: 本月活动趋势
    if (stats.overview.this_month_added > 0) {
      const lastMonthActivity = stats.time_trend.data.slice(-2, -1)[0];
      const thisMonthActivity = stats.overview.this_month_added;
      
      if (lastMonthActivity && thisMonthActivity > lastMonthActivity.count) {
        const increase = ((thisMonthActivity - lastMonthActivity.count) / lastMonthActivity.count * 100).toFixed(0);
        insights.push({
          icon: TrendingUp,
          title: "活跃度上升",
          description: `你本月已添加 ${thisMonthActivity} 条记录，比上月增加了 ${increase}%。继续保持！`,
          color: "text-green-500",
        });
      } else if (lastMonthActivity) {
        insights.push({
          icon: Clock,
          title: "记录活跃",
          description: `你本月已添加 ${thisMonthActivity} 条记录，保持着良好的记录习惯。`,
          color: "text-blue-500",
        });
      }
    }

    // 洞察2: 最喜欢的类型
    if (stats.type_distribution.length > 0) {
      const topType = stats.type_distribution[0];
      const typeLabels: Record<string, string> = {
        movie: "电影",
        tv: "剧集",
        anime: "动漫",
        book: "书籍",
        game: "游戏",
      };
      const typeName = typeLabels[topType.type] || topType.type;
      
      insights.push({
        icon: Award,
        title: "你的最爱",
        description: `你的收藏中 ${topType.percentage.toFixed(1)}% 是${typeName}，看来你是${typeName}爱好者！`,
        color: "text-purple-500",
      });
    }

    // 洞察3: 评分习惯
    if (stats.overview.average_rating && stats.overview.total_rated > 0) {
      const avgRating = stats.overview.average_rating;
      const ratedPercentage = ((stats.overview.total_rated / stats.overview.total_items) * 100).toFixed(0);
      
      if (avgRating >= 8) {
        insights.push({
          icon: Sparkles,
          title: "高标准鉴赏",
          description: `你的平均评分是 ${avgRating.toFixed(1)} 分，你对作品有着很高的鉴赏标准。`,
          color: "text-amber-500",
        });
      } else if (avgRating >= 7) {
        insights.push({
          icon: Sparkles,
          title: "均衡品味",
          description: `你的平均评分是 ${avgRating.toFixed(1)} 分，你对作品的评价比较客观均衡。`,
          color: "text-amber-500",
        });
      }
    }

    // 洞察4: 热门标签
    if (stats.top_tags.length > 0) {
      const topTag = stats.top_tags[0];
      insights.push({
        icon: Award,
        title: "偏好标签",
        description: `你最常用的标签是「${topTag.tag_name}」，使用了 ${topTag.count} 次。`,
        color: "text-pink-500",
      });
    }

    return insights.slice(0, 3); // 最多显示3条洞察
  }, [stats]);

  return (
    <Card className="overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-transparent to-transparent">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-gradient-to-br from-purple-500 to-pink-500 p-2">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle>AI 洞察</CardTitle>
              <p className="text-sm text-muted-foreground">
                基于你的数据生成的个性化分析
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="gap-1">
            <Sparkles className="h-3 w-3" />
            AI 驱动
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 洞察列表 */}
        {insights.length > 0 ? (
          <div className="space-y-4">
            {insights.map((insight, index) => {
              const Icon = insight.icon;
              return (
                <div
                  key={index}
                  className="flex items-start gap-3 rounded-lg border bg-card/50 p-4 backdrop-blur-sm transition-all hover:shadow-md"
                >
                  <div className={`mt-0.5 ${insight.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <h4 className="font-medium">{insight.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {insight.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-center text-sm text-muted-foreground">
            暂无足够数据生成洞察
          </p>
        )}

        {/* 推荐区域 - 根据系统设置控制显示 */}
        {systemSettings?.enable_explore && (
          <div className="space-y-2 rounded-lg border bg-gradient-to-r from-primary/5 to-transparent p-4 transition-all hover:shadow-md">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              基于你的偏好推荐
            </h4>
            <p className="text-xs text-muted-foreground">
              根据你的观看记录和评分，AI 可以为你推荐更多感兴趣的内容
            </p>
            <Button 
              variant="link" 
              className="h-auto p-0 text-xs font-medium text-primary"
              onClick={() => router.push('/discover')}
            >
              查看 AI 推荐 <ExternalLink className="ml-1 h-3 w-3" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}


