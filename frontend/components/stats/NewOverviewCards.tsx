"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OverviewStats } from "@/types/stats";
import { TrendingUp, Film, BookOpen, Calendar, Star } from "lucide-react";

interface NewOverviewCardsProps {
  overview: OverviewStats;
}

export function NewOverviewCards({ overview }: NewOverviewCardsProps) {
  const cards = [
    {
      title: "总记录数",
      value: overview.total_items,
      suffix: "部",
      icon: Film,
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      title: "已评分",
      value: overview.total_rated,
      suffix: "部",
      icon: Star,
      gradient: "from-purple-500 to-pink-500",
    },
    {
      title: "本月新增",
      value: overview.this_month_added,
      suffix: "部",
      icon: Calendar,
      gradient: "from-green-500 to-emerald-500",
    },
    {
      title: "平均评分",
      value: overview.average_rating?.toFixed(1) || "-",
      suffix: "/ 10",
      icon: TrendingUp,
      gradient: "from-orange-500 to-red-500",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card key={index} className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <div
                className={`rounded-full bg-gradient-to-br ${card.gradient} p-2`}
              >
                <Icon className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline space-x-2">
                <div className="text-2xl font-bold">{card.value}</div>
                <div className="text-xs text-muted-foreground">
                  {card.suffix}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}


