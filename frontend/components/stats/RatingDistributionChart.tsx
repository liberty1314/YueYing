"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { RatingDistribution } from "@/types/stats";

interface RatingDistributionChartProps {
  data: RatingDistribution[];
}

export function RatingDistributionChart({ data }: RatingDistributionChartProps) {
  const chartData = data.map((item) => ({
    rating: item.rating.toString(),
    count: item.count,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>评分分布</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="rating" label={{ value: "评分", position: "insideBottom", offset: -5 }} />
            <YAxis label={{ value: "数量", angle: -90, position: "insideLeft" }} />
            <Tooltip />
            <Bar dataKey="count" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

