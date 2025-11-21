/**
 * AIInsightCard - AI洞察卡片
 * 
 * 展示基于用户行为的智能分析和建议
 */

'use client';

import { Card, CardContent, Button } from '@/components/ui';
import { BrainIcon, TrendingUpIcon, SparklesIcon, ArrowRightIcon } from 'lucide-react';
import Link from 'next/link';

interface Insight {
  type: 'trend' | 'recommendation' | 'achievement' | 'suggestion';
  title: string;
  description: string;
  action?: {
    label: string;
    href: string;
  };
  icon?: 'brain' | 'trending' | 'sparkles';
}

interface AIInsightCardProps {
  insights?: Insight[];
}

const iconMap = {
  brain: BrainIcon,
  trending: TrendingUpIcon,
  sparkles: SparklesIcon,
};

export function AIInsightCard({ insights = [] }: AIInsightCardProps) {
  // 如果没有洞察数据，不显示该组件
  if (insights.length === 0) {
    return null;
  }

  return (
    <Card variant="elevated" className="bg-gradient-to-br from-primary-50 to-purple-50 dark:from-primary-950/30 dark:to-purple-950/30 border-primary-100 dark:border-primary-900/30">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          {/* 图标 */}
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center">
            <BrainIcon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
          </div>

          {/* 内容 */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                🤖 AI洞察
              </h3>
              <SparklesIcon className="w-4 h-4 text-primary-500" />
            </div>

            <div className="space-y-4">
              {insights.map((insight, index) => {
                const Icon = insight.icon ? iconMap[insight.icon] : SparklesIcon;
                
                return (
                  <div key={index} className="group">
                    <div className="flex items-start gap-3">
                      <Icon className="w-5 h-5 text-primary-500 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                          {insight.title}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {insight.description}
                        </p>
                        
                        {insight.action && (
                          <Link
                            href={insight.action.href}
                            className="inline-flex items-center gap-1 text-sm font-medium text-primary-600 dark:text-primary-400 mt-2 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
                          >
                            {insight.action.label}
                            <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 查看所有洞察 */}
            <div className="mt-4 pt-4 border-t border-primary-200 dark:border-primary-800">
              <Link href="/analytics">
                <Button variant="ghost" size="sm" className="text-primary-600 dark:text-primary-400">
                  查看完整数据分析
                  <ArrowRightIcon className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
