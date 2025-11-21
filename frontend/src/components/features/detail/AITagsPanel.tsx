/**
 * AITagsPanel - AI 标签面板
 * 
 * Week 5: 详情页AI功能 - 智能标签生成
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, Button, Badge } from '@/components/ui';
import { SparklesIcon, RefreshCwIcon, PlusIcon, XIcon } from 'lucide-react';
import { api, APIError } from '@/lib/apiClient';

interface AITagsPanelProps {
  itemId: number;
  existingTags?: string[];
  onTagsUpdate?: (tags: string[]) => void;
  className?: string;
}

export function AITagsPanel({ itemId, existingTags = [], onTagsUpdate, className }: AITagsPanelProps) {
  const [tags, setTags] = useState<string[]>(existingTags);
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [customTag, setCustomTag] = useState('');

  useEffect(() => {
    if (itemId) {
      generateTags();
    }
  }, [itemId]);

  const generateTags = async () => {
    setLoading(true);

    try {
      // 调用AI标签生成API
      const data = await api.post<{ tags: Array<{ tag_name: string; confidence: number }> }>(
        '/api/ai-tags/generate-tags',
        { user_item_id: itemId }
      );
      
      // 提取标签名称
      const newTags = (data.tags || []).map(t => t.tag_name);
      setSuggestedTags(newTags);
    } catch (err) {
      console.error('Failed to generate tags:', err);
      if (err instanceof APIError) {
        console.error('Tag generation error:', err.detail);
      }
      // 提供一些默认标签建议
      setSuggestedTags(['必看', '经典', '高分']);
    } finally {
      setLoading(false);
    }
  };

  const addTag = (tag: string) => {
    if (!tags.includes(tag)) {
      const newTags = [...tags, tag];
      setTags(newTags);
      onTagsUpdate?.(newTags);
      // 从建议中移除
      setSuggestedTags(suggestedTags.filter((t) => t !== tag));
    }
  };

  const removeTag = (tag: string) => {
    const newTags = tags.filter((t) => t !== tag);
    setTags(newTags);
    onTagsUpdate?.(newTags);
  };

  const handleAddCustomTag = () => {
    if (customTag.trim() && !tags.includes(customTag.trim())) {
      addTag(customTag.trim());
      setCustomTag('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAddCustomTag();
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
              智能标签
            </h3>
            <Badge variant="primary" size="sm">
              AI
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={generateTags}
            disabled={loading}
          >
            <RefreshCwIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {/* Current Tags */}
        {tags.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              当前标签
            </h4>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="primary"
                  size="sm"
                  className="cursor-pointer group"
                  onClick={() => removeTag(tag)}
                >
                  {tag}
                  <XIcon className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* AI Suggested Tags */}
        {suggestedTags.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              AI 建议标签
            </h4>
            {loading ? (
              <div className="flex gap-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {suggestedTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    size="sm"
                    className="cursor-pointer hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                    onClick={() => addTag(tag)}
                  >
                    <PlusIcon className="w-3 h-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Add Custom Tag */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            自定义标签
          </h4>
          <div className="flex gap-2">
            <input
              type="text"
              value={customTag}
              onChange={(e) => setCustomTag(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="输入自定义标签"
              className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <Button
              onClick={handleAddCustomTag}
              disabled={!customTag.trim()}
              size="sm"
            >
              <PlusIcon className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
