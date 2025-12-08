/**
 * ChatSidebar - 对话历史侧边栏 (Gemini 风格重构版)
 * 
 * 功能：
 * - 对话列表展示
 * - 对话搜索
 * - 分组管理（今天、昨天、本周等）
 * - 发起新对话
 * - 删除对话
 * - 侧边栏收起/展开动画
 * 
 * 布局结构：
 * - 头部固定（新对话按钮 + 搜索框）
 * - 列表区域独立滚动
 */

'use client';

import { useState } from 'react';
import { Input } from '@/components/ui';
import { MenuIcon } from 'lucide-react';
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
  const [isCollapsed, setIsCollapsed] = useState(false);

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
    <div
      className={cn(
        "bg-gradient-to-b from-slate-50 to-white dark:from-gray-900 dark:to-gray-950 border-r border-slate-200/60 dark:border-gray-800/60 flex flex-col overflow-hidden h-full transition-all duration-300 ease-in-out",
        isCollapsed ? "w-[68px]" : "w-[280px]"
      )}
    >
      {/* Header - 固定区域 */}
      <div className="flex-shrink-0">
        {/* 顶部控制栏 - Gemini 风格 */}
        <div className="flex items-center justify-start p-3 border-b border-slate-200/60 dark:border-gray-800/60">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-gray-800 transition-colors flex-shrink-0"
            title={isCollapsed ? '展开侧边栏' : '收起侧边栏'}
          >
            <MenuIcon className="w-5 h-5 text-slate-600 dark:text-gray-400" />
          </button>

          <h2 className={cn(
            "text-base font-semibold text-slate-900 dark:text-white ml-3 whitespace-nowrap overflow-hidden transition-all duration-300",
            isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"
          )}>
            对话历史
          </h2>
        </div>

        {/* 发起新对话按钮 - Gemini 风格 */}
        <div className="p-3">
          <button
            onClick={onNewConversation}
            className="w-full flex items-center justify-start gap-3 px-3 py-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-gray-800 transition-colors"
          >
            <svg className="w-5 h-5 text-slate-700 dark:text-gray-300 flex-shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className={cn(
              "text-slate-700 dark:text-gray-300 font-medium text-sm whitespace-nowrap overflow-hidden transition-all duration-300",
              isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"
            )}>
              新对话
            </span>
          </button>
        </div>

        {/* 搜索框 - Gemini 风格 */}
        {!isCollapsed && (
          <div className="px-3 pb-3">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-gray-500 transition-colors" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索对话..."
                className="pl-10 h-9 bg-white dark:bg-gray-900 border-slate-200 dark:border-gray-800 focus:border-blue-500 dark:focus:border-blue-400 rounded-full text-sm"
              />
            </div>
          </div>
        )}
      </div>

      {/* Conversation List - 独立滚动区域 */}
      <div
        className="flex-1 overflow-y-auto px-2 pb-4 scroll-smooth"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgb(203 213 225) transparent'
        }}
      >
        {Object.entries(groups).map(([key, items]) => {
          if (items.length === 0) return null;

          return (
            <div key={key} className="mb-6">
              <div className="px-3 py-2 text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider">
                {groupLabels[key as keyof typeof groupLabels]}
              </div>
              <div className="space-y-0.5">
                {items.map((conv) => (
                  <div
                    key={conv.id}
                    className={cn(
                      'group relative flex items-center justify-start gap-3 px-3 py-2.5 rounded-full cursor-pointer transition-all duration-200',
                      currentConversationId === conv.id
                        ? 'bg-slate-200 dark:bg-gray-800'
                        : 'hover:bg-slate-100 dark:hover:bg-gray-800/60'
                    )}
                    onClick={() => onSelectConversation(conv.id)}
                  >
                    {/* 对话图标 */}
                    <svg className="w-5 h-5 text-slate-600 dark:text-gray-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>

                    {/* 对话标题 */}
                    <span className={cn(
                      "text-sm font-medium truncate whitespace-nowrap overflow-hidden transition-all duration-300",
                      currentConversationId === conv.id
                        ? "text-slate-900 dark:text-white"
                        : "text-slate-700 dark:text-gray-300",
                      isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"
                    )}>
                      {conv.title}
                    </span>

                    {/* Delete Button */}
                    {onDeleteConversation && !isCollapsed && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(conv.id);
                        }}
                        className={cn(
                          'ml-auto p-1.5 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100 flex-shrink-0',
                          deleteConfirm === conv.id
                            ? 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 opacity-100'
                            : 'hover:bg-slate-200 dark:hover:bg-gray-700 text-slate-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400'
                        )}
                        title={deleteConfirm === conv.id ? '再次点击确认删除' : '删除对话'}
                      >
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M3 6H5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M10 11V17M14 11V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {filteredConversations.length === 0 && !isCollapsed && (
          <div className="text-center py-12 px-4">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center shadow-lg">
              <svg className="w-8 h-8 text-slate-400 dark:text-gray-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="12" cy="12" r="2" fill="currentColor" opacity="0.3" />
              </svg>
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
