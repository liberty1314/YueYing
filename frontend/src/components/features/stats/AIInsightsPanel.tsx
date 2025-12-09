/**
 * AIInsightsPanel - AI洞察面板
 * 
 * Week 6: AI洞察 - 基于用户行为的智能分析和建议
 * 升级版：支持多种洞察类型、优先级排序、刷新机制
 * 
 * 注意：此组件受系统设置控制，当"启用探索/推荐功能"关闭时不显示
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, Button, Badge } from '@/components/ui';
import { SparklesIcon, TrendingUpIcon, HeartIcon, AwardIcon, LightbulbIcon, RefreshCwIcon, ChevronRightIcon } from 'lucide-react';
import { api, APIError } from '@/lib/apiClient';
import { useSystemSettings } from '@/hooks/useSystemSettings';

interface Insight {
  type: 'trend' | 'recommendation' | 'achievement' | 'suggestion';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  action?: {
    label: string;
    link?: string;
  };
}

interface AIInsightsPanelProps {
  className?: string;
}

const iconComponents = {
  trend: TrendingUpIcon,
  recommendation: HeartIcon,
  achievement: AwardIcon,
  suggestion: LightbulbIcon,
};

const typeColors = {
  trend: 'from-blue-500/20 to-blue-600/20 border-blue-200 dark:border-blue-800',
  recommendation: 'from-pink-500/20 to-pink-600/20 border-pink-200 dark:border-pink-800',
  achievement: 'from-yellow-500/20 to-yellow-600/20 border-yellow-200 dark:border-yellow-800',
  suggestion: 'from-green-500/20 to-green-600/20 border-green-200 dark:border-green-800',
};

const typeLabels = {
  trend: '趋势分析',
  recommendation: '推荐',
  achievement: '成就',
  suggestion: '建议',
};

const priorityBadges = {
  high: { label: '重要', variant: 'error' as const },
  medium: { label: '一般', variant: 'warning' as const },
  low: { label: '提示', variant: 'default' as const },
};

export function AIInsightsPanel({ className }: AIInsightsPanelProps) {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(false);
  const { settings } = useSystemSettings();

  useEffect(() => {
    // 只有在探索功能启用时才获取洞察数据
    if (settings?.enable_explore) {
      fetchInsights();
    }
  }, [settings?.enable_explore]);

  const fetchInsights = async () => {
    setLoading(true);
    try {
      // 调用AI洞察分析API（需要认证）
      const data = await api.get<{ insights: Insight[] }>('/ai/insights', true);
      setInsights(data.insights || []);
    } catch (error) {
      if (error instanceof APIError) {
        console.error('Failed to fetch insights:', error.detail);
      }
      setInsights([]);
    } finally {
      setLoading(false);
    }
  };

  // 如果系统设置关闭了探索/推荐功能，不显示此组件
  if (settings && !settings.enable_explore) {
    return null;
  }

  return (
    <Card className={className}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <SparklesIcon className="w-5 h-5 text-primary-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              AI 智能洞察
            </h3>
            <Badge variant="primary" size="sm">
              AI
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchInsights}
            disabled={loading}
          >
            <RefreshCwIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg" />
              </div>
            ))}
          </div>
        ) : (
          /* Insights List */
          <div className="space-y-3">
            {insights.map((insight, index) => {
              const Icon = iconComponents[insight.type] || LightbulbIcon;
              const colorClass = typeColors[insight.type] || typeColors.suggestion;
              const badge = priorityBadges[insight.priority] || priorityBadges.low;

              return (
                <div
                  key={index}
                  className={`relative overflow-hidden p-4 rounded-lg border bg-gradient-to-br ${colorClass} transition-all hover:shadow-md`}
                >
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className="flex-shrink-0 mt-0.5">
                      <div className="w-10 h-10 rounded-lg bg-white/80 dark:bg-gray-800/80 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {insight.title}
                        </h4>
                        <Badge variant={badge.variant} size="sm">
                          {badge.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-2">
                        {insight.description}
                      </p>

                      {/* Type Label */}
                      <span className="inline-block text-xs font-medium text-gray-600 dark:text-gray-400 bg-white/50 dark:bg-gray-800/50 px-2 py-0.5 rounded">
                        {typeLabels[insight.type] || '其他'}
                      </span>
                    </div>

                    {/* Action Button */}
                    {insight.action && (
                      <div className="flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (insight.action?.link) {
                              window.location.href = insight.action.link;
                            }
                          }}
                        >
                          {insight.action.label}
                          <ChevronRightIcon className="w-4 h-4 ml-1" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {!loading && insights.length === 0 && (
          <div className="text-center py-8">
            <SparklesIcon className="w-12 h-12 text-gray-500 dark:text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              暂无洞察数据，请继续使用应用来获取个性化分析
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
