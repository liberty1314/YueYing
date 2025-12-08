/**
 * ChatSidebar - 对话历史侧边栏 (优化版)
 * 
 * 功能：
 * - 对话列表展示
 * - 对话搜索
 * - 分组管理（今天、昨天、本周等）
 * - 新建对话
 * - 删除对话
 * 
 * 优化点：
 * - 更精致的新建对话按钮（渐变+光影效果）
 * - 优化的选中和 hover 状态
 * - 更细腻的阴影和圆角
 */

'use client';

import { useState } from 'react';
import { Input } from '@/components/ui';
import {
  PlusIcon,
  SearchIcon,
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
    today: '今天',
    yesterday: '昨天',
    thisWeek: '本周',
    older: '更早',
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
    <div className="w-80 bg-gradient-to-b from-slate-50 to-white dark:from-gray-900 dark:to-gray-950 border-r border-slate-200/60 dark:border-gray-800/60 flex flex-col">
      {/* Header - 新建对话按钮 */}
      <div className="p-4">
        <button
          onClick={onNewConversation}
          className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 p-[2px] transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/50 dark:hover:shadow-blue-400/30 hover:scale-[1.02] active:scale-[0.98]"
        >
          <div className="relative flex items-center justify-center gap-2 rounded-[10px] bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 px-4 py-3 transition-all">
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            <PlusIcon className="w-5 h-5 text-white relative z-10" />
            <span className="text-white font-semibold text-sm relative z-10">新建对话</span>
          </div>
        </button>
      </div>

      {/* Search */}
      <div className="px-4 pb-4">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-gray-500" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索对话..."
            className="pl-10 bg-white dark:bg-gray-900 border-slate-200 dark:border-gray-800 focus:border-blue-500 dark:focus:border-blue-400 rounded-lg"
          />
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto px-3 pb-4">
        {Object.entries(groups).map(([key, items]) => {
          if (items.length === 0) return null;

          return (
            <div key={key} className="mb-6">
              <div className="px-3 py-2 text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider">
                {groupLabels[key as keyof typeof groupLabels]}
              </div>
              <div className="space-y-1">
                {items.map((conv) => (
                  <div
                    key={conv.id}
                    className={cn(
                      'group relative p-3 rounded-xl cursor-pointer transition-all duration-200',
                      currentConversationId === conv.id
                        ? 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 shadow-sm border border-blue-200/50 dark:border-blue-800/50'
                        : 'hover:bg-slate-100/80 dark:hover:bg-gray-800/60 hover:shadow-sm'
                    )}
                    onClick={() => onSelectConversation(conv.id)}
                  >
                    <div className="flex items-start">
                      <div className="flex-1 min-w-0">
                        <h4 className={cn(
                          "text-sm font-semibold truncate",
                          currentConversationId === conv.id
                            ? "text-slate-900 dark:text-white"
                            : "text-slate-700 dark:text-gray-300"
                        )}>
                          {conv.title}
                        </h4>
                        {conv.last_message && (
                          <p className="text-xs text-slate-500 dark:text-gray-400 line-clamp-1 mt-1">
                            {conv.last_message}
                          </p>
                        )}
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
                          'absolute top-3 right-3 p-1.5 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100',
                          deleteConfirm === conv.id
                            ? 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 opacity-100 scale-110'
                            : 'hover:bg-slate-200 dark:hover:bg-gray-700 text-slate-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400'
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
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center">
              <ClockIcon className="w-8 h-8 text-slate-400 dark:text-gray-600" />
            </div>
            <p className="text-sm font-medium text-slate-600 dark:text-gray-400">
              {searchQuery ? '没有找到匹配的对话' : '还没有对话记录'}
            </p>
            <p className="text-xs text-slate-400 dark:text-gray-500 mt-1">
              {searchQuery ? '试试其他关键词' : '点击上方按钮开始新对话'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
