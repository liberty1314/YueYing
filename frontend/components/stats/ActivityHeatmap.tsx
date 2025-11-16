"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ActivityHeatmapData } from "@/types/stats";
import { useMemo, useState } from "react";

interface ActivityHeatmapProps {
  data: ActivityHeatmapData[];
}

export function ActivityHeatmap({ data }: ActivityHeatmapProps) {
  const [hoveredDay, setHoveredDay] = useState<ActivityHeatmapData | null>(null);

  // 将数据组织成周矩阵
  const heatmapMatrix = useMemo(() => {
    // 创建日期到数据的映射
    const dataMap = new Map(data.map((d) => [d.date, d.count]));

    // 获取最早和最晚的日期
    if (data.length === 0) return [];

    const startDate = new Date(data[0].date);
    const endDate = new Date(data[data.length - 1].date);

    // 找到开始日期所在周的周日
    const firstDayOfWeek = new Date(startDate);
    firstDayOfWeek.setDate(startDate.getDate() - startDate.getDay());

    // 生成周矩阵
    const weeks: Array<Array<{ date: string; count: number }>> = [];
    const currentDate = new Date(firstDayOfWeek);
    let currentWeek: Array<{ date: string; count: number }> = [];

    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split("T")[0];
      const count = dataMap.get(dateStr) || 0;
      currentWeek.push({ date: dateStr, count });

      if (currentDate.getDay() === 6) {
        weeks.push(currentWeek);
        currentWeek = [];
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    if (currentWeek.length > 0) {
      // 填充最后一周
      while (currentWeek.length < 7) {
        currentWeek.push({ date: "", count: 0 });
      }
      weeks.push(currentWeek);
    }

    return weeks;
  }, [data]);

  // 获取颜色强度
  const getColorIntensity = (count: number) => {
    if (count === 0) return "bg-muted/30";
    if (count <= 2) return "bg-green-300";
    if (count <= 5) return "bg-green-500";
    if (count <= 10) return "bg-green-700";
    return "bg-green-900";
  };

  const weekDays = ["日", "一", "二", "三", "四", "五", "六"];

  // 获取月份标签
  const monthLabels = useMemo(() => {
    const labels: Array<{ month: string; weekIndex: number }> = [];
    let lastMonth = "";

    heatmapMatrix.forEach((week, weekIndex) => {
      const firstDay = week.find((d) => d.date);
      if (firstDay && firstDay.date) {
        const date = new Date(firstDay.date);
        const monthStr = date.toLocaleDateString("zh-CN", { month: "short" });
        if (monthStr !== lastMonth) {
          labels.push({ month: monthStr, weekIndex });
          lastMonth = monthStr;
        }
      }
    });

    return labels;
  }, [heatmapMatrix]);

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>活动日历</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">暂无活动数据</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>活动日历</CardTitle>
        <p className="text-sm text-muted-foreground">
          过去一年的活动记录 · 共 {data.reduce((sum, d) => sum + d.count, 0)} 次活动
        </p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full">
            {/* 月份标签 */}
            <div className="mb-2 flex" style={{ marginLeft: "28px" }}>
              {monthLabels.map((label, index) => (
                <div
                  key={index}
                  className="text-xs text-muted-foreground"
                  style={{
                    marginLeft: index === 0 ? 0 : `${(label.weekIndex - (monthLabels[index - 1]?.weekIndex || 0)) * 14}px`,
                  }}
                >
                  {label.month}
                </div>
              ))}
            </div>

            {/* 热力图 */}
            <div className="flex">
              {/* 星期标签 */}
              <div className="mr-2 flex flex-col justify-around text-xs text-muted-foreground">
                {weekDays.map((day, index) => (
                  <div key={index} className="h-3 leading-3">
                    {index % 2 === 1 ? day : ""}
                  </div>
                ))}
              </div>

              {/* 热力图网格 */}
              <div className="flex gap-1">
                {heatmapMatrix.map((week, weekIndex) => (
                  <div key={weekIndex} className="flex flex-col gap-1">
                    {week.map((day, dayIndex) => (
                      <div
                        key={dayIndex}
                        className={`h-3 w-3 rounded-sm transition-all hover:ring-2 hover:ring-primary ${
                          day.date ? getColorIntensity(day.count) : "bg-transparent"
                        }`}
                        onMouseEnter={() =>
                          day.date && setHoveredDay({ date: day.date, count: day.count })
                        }
                        onMouseLeave={() => setHoveredDay(null)}
                        title={
                          day.date
                            ? `${day.date}: ${day.count} 次活动`
                            : ""
                        }
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* 图例 */}
            <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
              <div>
                {hoveredDay ? (
                  <span>
                    {new Date(hoveredDay.date).toLocaleDateString("zh-CN")}:{" "}
                    <span className="font-medium">{hoveredDay.count}</span> 次活动
                  </span>
                ) : (
                  <span>将鼠标悬停在方块上查看详情</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span>少</span>
                <div className="flex gap-1">
                  <div className="h-3 w-3 rounded-sm bg-muted/30" />
                  <div className="h-3 w-3 rounded-sm bg-green-300" />
                  <div className="h-3 w-3 rounded-sm bg-green-500" />
                  <div className="h-3 w-3 rounded-sm bg-green-700" />
                  <div className="h-3 w-3 rounded-sm bg-green-900" />
                </div>
                <span>多</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


