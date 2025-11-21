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
          <div key={index} className="my-3">
            <div className="bg-gray-900 rounded-lg overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
                <span className="text-xs text-gray-400">{language || 'code'}</span>
                <button
                  onClick={handleCopy}
                  className="text-xs text-gray-400 hover:text-white transition-colors"
                >
                  {isCopied ? <CheckIcon className="w-3 h-3" /> : <CopyIcon className="w-3 h-3" />}
                </button>
              </div>
              <pre className="p-4 overflow-x-auto">
                <code className="text-sm text-gray-100 font-mono">
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
    <div className={cn('flex gap-4 mb-6', isUser && 'flex-row-reverse')}>
      {/* Avatar */}
      <div className="flex-shrink-0">
        <div
          className={cn(
            'w-10 h-10 rounded-full flex items-center justify-center',
            isUser
              ? 'bg-blue-600 dark:bg-blue-500 text-white'
              : 'bg-gray-200 dark:bg-gray-700'
          )}
        >
          {isUser ? (
            <UserIcon className="w-5 h-5 text-white" />
          ) : (
            <SparklesIcon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          )}
        </div>
      </div>

      {/* Message Content */}
      <div className={cn('flex-1 max-w-3xl', isUser && 'flex justify-end')}>
        <Card
          variant={isUser ? 'default' : 'elevated'}
          className={cn(
            'inline-block',
            isUser
              ? 'bg-blue-600 dark:bg-blue-500 text-white'
              : 'bg-white dark:bg-gray-800'
          )}
        >
          <div className="p-4">
            {/* Role Label */}
            <div className="flex items-center gap-2 mb-2">
              <span
                className={cn(
                  'text-xs font-medium',
                  isUser
                    ? 'text-white opacity-90'
                    : 'text-gray-500 dark:text-gray-400'
                )}
              >
                {isUser ? '你' : 'AI 助手'}
              </span>
              <span
                className={cn(
                  'text-xs',
                  isUser
                    ? 'text-white opacity-75'
                    : 'text-gray-400 dark:text-gray-500'
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
                'text-sm leading-relaxed',
                isUser
                  ? 'text-white'
                  : 'text-gray-900 dark:text-white'
              )}
            >
              {displayedContent === '' && message.role === 'assistant' ? (
                <div className="flex items-center gap-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    AI 正在思考中...
                  </span>
                </div>
              ) : (
                <>
                  {renderContent(displayedContent)}
                  {isStreaming && message.role === 'assistant' && displayedContent !== '' && (
                    <span className="inline-block w-2 h-4 ml-1 bg-primary-500 animate-pulse" />
                  )}
                </>
              )}
            </div>

            {/* Copy Button for Assistant Messages */}
            {!isUser && !isStreaming && (
              <button
                onClick={handleCopy}
                className="mt-3 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 flex items-center gap-1 transition-colors"
              >
                {isCopied ? (
                  <>
                    <CheckIcon className="w-3 h-3" />
                    已复制
                  </>
                ) : (
                  <>
                    <CopyIcon className="w-3 h-3" />
                    复制
                  </>
                )}
              </button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
