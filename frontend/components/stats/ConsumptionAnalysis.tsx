"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TypeDistribution, TagStats, YearDistribution } from "@/types/stats";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, ScatterChart, Scatter, ZAxis } from "recharts";

interface ConsumptionAnalysisProps {
  typeDistribution: TypeDistribution[];
  tagStats: TagStats[];
  yearDistribution: YearDistribution[];
}

const COLORS = [
  "#3b82f6", // blue
  "#8b5cf6", // purple
  "#ec4899", // pink
  "#f59e0b", // amber
  "#10b981", // emerald
  "#06b6d4", // cyan
  "#f97316", // orange
  "#84cc16", // lime
];

const contentTypeLabels: Record<string, string> = {
  movie: "电影",
  tv: "剧集",
  anime: "动漫",
  book: "书籍",
  game: "游戏",
};

export function ConsumptionAnalysis({
  typeDistribution,
  tagStats,
  yearDistribution,
}: ConsumptionAnalysisProps) {
  // 准备类型分析数据
  const typeChartData = typeDistribution.map((item) => ({
    name: contentTypeLabels[item.type] || item.type,
    value: item.count,
    percentage: item.percentage,
  }));

  // 准备标签分析数据（Top 20）
  const tagChartData = tagStats.slice(0, 20).map((item) => ({
    name: item.tag_name,
    count: item.count,
    fill: item.color || "#3b82f6",
  }));

  // 准备年代分析数据（过滤空值并排序）
  const yearChartData = yearDistribution
    .filter((item) => item.year !== null)
    .sort((a, b) => (a.year || 0) - (b.year || 0))
    .map((item) => ({
      year: item.year,
      count: item.count,
    }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>消费分析</CardTitle>
        <p className="text-sm text-muted-foreground">
          深入了解你的观看偏好和习惯
        </p>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="type" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="type">类型分析</TabsTrigger>
            <TabsTrigger value="tags">标签分析</TabsTrigger>
            <TabsTrigger value="years">年代分析</TabsTrigger>
          </TabsList>

          {/* 类型分析 */}
          <TabsContent value="type" className="space-y-4">
            {typeChartData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={typeChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percentage }) =>
                        `${name}: ${percentage.toFixed(1)}%`
                      }
                    >
                      {typeChartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: any, name: any, props: any) => [
                        `${value} 部 (${props.payload.percentage.toFixed(1)}%)`,
                        props.payload.name,
                      ]}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>

                <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                  {typeChartData.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-3 rounded-lg border p-3"
                    >
                      <div
                        className="h-4 w-4 rounded-full"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <div className="flex-1">
                        <div className="text-sm font-medium">{item.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {item.value} 部 · {item.percentage.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-center text-sm text-muted-foreground">
                暂无类型数据
              </p>
            )}
          </TabsContent>

          {/* 标签分析 */}
          <TabsContent value="tags" className="space-y-4">
            {tagChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={tagChartData}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={90} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-sm text-muted-foreground">
                暂无标签数据
              </p>
            )}
          </TabsContent>

          {/* 年代分析 */}
          <TabsContent value="years" className="space-y-4">
            {yearChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={yearChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="year"
                    label={{ value: "年份", position: "insideBottom", offset: -5 }}
                  />
                  <YAxis
                    label={{ value: "数量", angle: -90, position: "insideLeft" }}
                  />
                  <Tooltip
                    formatter={(value: any, name: any, props: any) => [
                      `${value} 部`,
                      `${props.payload.year} 年`,
                    ]}
                  />
                  <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-sm text-muted-foreground">
                暂无年代数据
              </p>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}


