"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { TimeTrend } from "@/types/stats";

interface TimeTrendChartProps {
  data: TimeTrend;
}

export function TimeTrendChart({ data }: TimeTrendChartProps) {
  const chartData = data.data.map((point) => ({
    date: point.date,
    新增: point.count,
    累计: point.cumulative_count || 0,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>时间趋势</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="新增" stroke="#8884d8" strokeWidth={2} />
            <Line type="monotone" dataKey="累计" stroke="#82ca9d" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

