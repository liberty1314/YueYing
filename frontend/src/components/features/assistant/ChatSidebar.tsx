/**
 * ChatSidebar - 对话历史侧边栏
 * 
 * 功能：
 * - 对话列表展示
 * - 对话搜索
 * - 分组管理（今天、昨天、本周等）
 * - 新建对话
 * - 删除对话
 */

'use client';

import { useState } from 'react';
import { Button, Card, Badge } from '@/components/ui';
import { Input } from '@/components/ui';
import {
  PlusIcon,
  SearchIcon,
  MessageSquareIcon,
  Trash2Icon,
  ClockIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Conversation {
  id: number;
  title: string;
  message_count: number;
  last_message?: string;
  created_at: string;
  updated_at: string;
}

interface ChatSidebarProps {
  conversations: Conversation[];
  currentConversationId: number | null;
  onSelectConversation: (id: number) => void;
  onNewConversation: () => void;
  onDeleteConversation?: (id: number) => void;
}

// 时间分组辅助函数
function groupConversationsByTime(conversations: Conversation[]) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);

  const groups: Record<string, Conversation[]> = {
    today: [],
    yesterday: [],
    thisWeek: [],
    older: [],
  };

  conversations.forEach((conv) => {
    const convDate = new Date(conv.updated_at);
    if (convDate >= today) {
      groups.today.push(conv);
    } else if (convDate >= yesterday) {
      groups.yesterday.push(conv);
    } else if (convDate >= weekAgo) {
      groups.thisWeek.push(conv);
    } else {
      groups.older.push(conv);
    }
  });

  return groups;
}

export function ChatSidebar({
  conversations,
  currentConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
}: ChatSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  // 过滤对话
  const filteredConversations = conversations.filter((conv) =>
    conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.last_message?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 分组
  const groups = groupConversationsByTime(filteredConversations);
  const groupLabels = {
    today: '📅 今天',
    yesterday: '📅 昨天',
    thisWeek: '📅 本周',
    older: '📅 更早',
  };

  const handleDelete = (id: number) => {
    if (deleteConfirm === id) {
      onDeleteConversation?.(id);
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(id);
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  };

  return (
    <div className="w-80 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <Button
          variant="primary"
          className="w-full bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white"
          onClick={onNewConversation}
        >
          <PlusIcon className="w-4 h-4 mr-2 text-white" />
          <span className="text-white font-medium">新对话</span>
        </Button>
      </div>

      {/* Search */}
      <div className="p-4">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索对话..."
            className="pl-10"
          />
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto px-2">
        {Object.entries(groups).map(([key, items]) => {
          if (items.length === 0) return null;

          return (
            <div key={key} className="mb-4">
              <div className="px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                {groupLabels[key as keyof typeof groupLabels]}
              </div>
              <div className="space-y-1">
                {items.map((conv) => (
                  <div
                    key={conv.id}
                    className={cn(
                      'group relative p-3 rounded-lg cursor-pointer transition-colors',
                      currentConversationId === conv.id
                        ? 'bg-blue-100 dark:bg-blue-900/30'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                    )}
                    onClick={() => onSelectConversation(conv.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        <MessageSquareIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {conv.title}
                        </h4>
                        {conv.last_message && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-1">
                            {conv.last_message}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="default" size="sm" className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                            {conv.message_count} 条
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Delete Button */}
                    {onDeleteConversation && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(conv.id);
                        }}
                        className={cn(
                          'absolute top-3 right-3 p-1.5 rounded transition-colors opacity-0 group-hover:opacity-100',
                          deleteConfirm === conv.id
                            ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                            : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500'
                        )}
                        title={deleteConfirm === conv.id ? '再次点击确认删除' : '删除对话'}
                      >
                        <Trash2Icon className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {filteredConversations.length === 0 && (
          <div className="text-center py-8">
            <ClockIcon className="w-12 h-12 mx-auto mb-3 text-gray-400 dark:text-gray-600" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {searchQuery ? '没有找到匹配的对话' : '还没有对话记录'}
            </p>
          </div>
        )}
      </div>

      {/* Footer - Quick Actions */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="text-xs text-gray-500 dark:text-gray-400">
          💡 快捷提问
        </div>
        <div className="mt-2 space-y-1">
          {['推荐电影', '数据统计', '标签分析'].map((prompt) => (
            <button
              key={prompt}
              onClick={() => {
                onNewConversation();
                // 可以触发自动输入提示词
              }}
              className="w-full text-left px-3 py-2 text-xs rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
