/**
 * MessageBubble - 消息气泡组件
 * 
 * 功能：
 * - 用户/AI消息区分
 * - Markdown渲染支持
 * - 代码高亮
 * - 打字机流式输出效果
 */

'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui';
import { SparklesIcon, UserIcon, CopyIcon, CheckIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
  streaming?: boolean;
}

interface MessageBubbleProps {
  message: Message;
  isStreaming?: boolean;
}

export function MessageBubble({ message, isStreaming = false }: MessageBubbleProps) {
  const [displayedContent, setDisplayedContent] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const isUser = message.role === 'user';

  // 流式输出打字机效果
  useEffect(() => {
    if (isStreaming && message.role === 'assistant') {
      let currentIndex = 0;
      const interval = setInterval(() => {
        if (currentIndex <= message.content.length) {
          setDisplayedContent(message.content.slice(0, currentIndex));
          currentIndex += 2; // 每次显示2个字符，加快速度
        } else {
          clearInterval(interval);
        }
      }, 20);
      return () => clearInterval(interval);
    } else {
      setDisplayedContent(message.content);
    }
  }, [message.content, isStreaming, message.role]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // 简单的Markdown渲染（代码块）
  const renderContent = (content: string) => {
    const parts = content.split(/(```[\s\S]*?```)/g);

    return parts.map((part, index) => {
      // 代码块
      if (part.startsWith('```') && part.endsWith('```')) {
        const code = part.slice(3, -3);
        const lines = code.split('\n');
        const language = lines[0].trim();
        const codeContent = lines.slice(1).join('\n');

        return (
          <div key={index} className="my-4">
            <div className="bg-slate-900 dark:bg-black rounded-xl overflow-hidden border border-slate-800 dark:border-gray-800 shadow-lg">
              <div className="flex items-center justify-between px-4 py-2.5 bg-slate-800 dark:bg-gray-900 border-b border-slate-700 dark:border-gray-800">
                <span className="text-xs font-semibold text-slate-400 dark:text-gray-400 uppercase tracking-wide">
                  {language || 'code'}
                </span>
                <button
                  onClick={handleCopy}
                  className="text-xs text-slate-400 hover:text-white transition-colors px-2 py-1 rounded-md hover:bg-slate-700 dark:hover:bg-gray-800 flex items-center gap-1.5"
                >
                  {isCopied ? (
                    <>
                      <CheckIcon className="w-3.5 h-3.5" />
                      <span>已复制</span>
                    </>
                  ) : (
                    <>
                      <CopyIcon className="w-3.5 h-3.5" />
                      <span>复制</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-4 overflow-x-auto">
                <code className="text-sm text-slate-100 dark:text-gray-100 font-mono leading-relaxed">
                  {codeContent}
                </code>
              </pre>
            </div>
          </div>
        );
      }

      // 普通文本
      return (
        <div key={index} className="whitespace-pre-wrap">
          {part.split('\n').map((line, i) => (
            <div key={i}>
              {line}
              {i < part.split('\n').length - 1 && <br />}
            </div>
          ))}
        </div>
      );
    });
  };

  return (
    <div className={cn('flex gap-4 mb-8', isUser && 'flex-row-reverse')}>
      {/* Avatar */}
      <div className="flex-shrink-0">
        <div
          className={cn(
            'w-10 h-10 rounded-xl flex items-center justify-center shadow-md',
            isUser
              ? 'bg-gradient-to-br from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500'
              : 'bg-gradient-to-br from-slate-100 to-slate-200 dark:from-gray-800 dark:to-gray-900'
          )}
        >
          {isUser ? (
            <UserIcon className="w-5 h-5 text-white" strokeWidth={2} />
          ) : (
            <SparklesIcon className="w-5 h-5 text-slate-700 dark:text-gray-300" strokeWidth={2} />
          )}
        </div>
      </div>

      {/* Message Content */}
      <div className={cn('flex-1 max-w-3xl', isUser && 'flex justify-end')}>
        <div
          className={cn(
            'inline-block rounded-2xl shadow-sm border transition-all duration-200',
            isUser
              ? 'bg-gradient-to-br from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 text-white border-transparent'
              : 'bg-white dark:bg-gray-900 border-slate-200/60 dark:border-gray-800/60'
          )}
        >
          <div className="p-5">
            {/* Role Label */}
            <div className="flex items-center gap-2 mb-3">
              <span
                className={cn(
                  'text-xs font-semibold',
                  isUser
                    ? 'text-white/90'
                    : 'text-slate-600 dark:text-gray-400'
                )}
              >
                {isUser ? '你' : 'AI 助手'}
              </span>
              <span
                className={cn(
                  'text-xs',
                  isUser
                    ? 'text-white/70'
                    : 'text-slate-400 dark:text-gray-500'
                )}
              >
                {new Date(message.created_at).toLocaleTimeString('zh-CN', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>

            {/* Content */}
            <div
              className={cn(
                'text-[15px] leading-relaxed',
                isUser
                  ? 'text-white'
                  : 'text-slate-900 dark:text-white'
              )}
            >
              {displayedContent === '' && message.role === 'assistant' ? (
                <div className="flex items-center gap-3 py-2">
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-sm text-slate-600 dark:text-gray-400 font-medium">
                    AI 正在思考中...
                  </span>
                </div>
              ) : (
                <>
                  {renderContent(displayedContent)}
                  {isStreaming && message.role === 'assistant' && displayedContent !== '' && (
                    <span className="inline-block w-0.5 h-5 ml-1 bg-blue-500 dark:bg-blue-400 animate-pulse" />
                  )}
                </>
              )}
            </div>

            {/* Copy Button for Assistant Messages */}
            {!isUser && !isStreaming && displayedContent !== '' && (
              <button
                onClick={handleCopy}
                className="mt-4 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-gray-800 rounded-lg flex items-center gap-1.5 transition-all duration-200"
              >
                {isCopied ? (
                  <>
                    <CheckIcon className="w-3.5 h-3.5" />
                    已复制
                  </>
                ) : (
                  <>
                    <CopyIcon className="w-3.5 h-3.5" />
                    复制内容
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
