/**
 * AISummaryPanel - AI 摘要面板
 * 
 * Week 5: 详情页AI功能 - 智能摘要生成
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, Button, Badge } from '@/components/ui';
import { SparklesIcon, RefreshCwIcon, ThumbsUpIcon, ThumbsDownIcon } from 'lucide-react';
import { api, APIError } from '@/lib/apiClient';

interface AISummaryPanelProps {
  itemId: number;
  overview?: string;
  className?: string;
}

export function AISummaryPanel({ itemId, overview, className }: AISummaryPanelProps) {
  const [summary, setSummary] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (itemId) {
      generateSummary();
    }
  }, [itemId]);

  const generateSummary = async () => {
    setLoading(true);
    setError(null);

    try {
      // 调用AI内容摘要API
      const data = await api.post<{ summary: string; highlights: string[] }>(
        '/api/ai/content-summary',
        { item_id: itemId }
      );
      
      setSummary(data.summary || overview || '');
    } catch (err) {
      console.error('Failed to generate summary:', err);
      if (err instanceof APIError) {
        setError(err.detail);
      } else {
        setError(err instanceof Error ? err.message : '生成摘要失败');
      }
      // 使用原始简介作为后备
      if (overview) {
        setSummary(overview);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFeedback = async (isPositive: boolean) => {
    try {
      await api.post('/api/ai/summary/feedback', {
        item_id: itemId,
        summary: summary,
        is_positive: isPositive,
      });
      console.log('Feedback submitted:', isPositive);
    } catch (err) {
      if (err instanceof APIError) {
        console.error('Failed to submit feedback:', err.detail);
      }
    }
  };

  return (
    <Card className={className}>
      <div className="p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SparklesIcon className="w-5 h-5 text-primary-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              AI 智能摘要
            </h3>
            <Badge variant="primary" size="sm">
              AI
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={generateSummary}
            disabled={loading}
          >
            <RefreshCwIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-5/6" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-4/6" />
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        ) : summary ? (
          <div className="space-y-4">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {summary}
            </p>

            {/* Feedback */}
            <div className="flex items-center gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
              <span className="text-xs text-gray-500 dark:text-gray-400">这个摘要对你有帮助吗？</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleFeedback(true)}
                className="text-gray-600 dark:text-gray-400 hover:text-primary-500"
              >
                <ThumbsUpIcon className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleFeedback(false)}
                className="text-gray-600 dark:text-gray-400 hover:text-red-500"
              >
                <ThumbsDownIcon className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-sm">暂无摘要</p>
        )}
      </div>
    </Card>
  );
}
