/**
 * MessageBubble - 消息气泡组件
 * 
 * 功能：
 * - 用户/AI消息区分
 * - 头像显示
 * - Markdown渲染支持
 * - 代码高亮
 * - AI消息打字机效果
 */

'use client';

import { useState } from 'react';
import { CopyIcon, CheckIcon, User, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TextType } from '@/components/ui/TextType';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
  streaming?: boolean;
}

interface MessageBubbleProps {
  message: Message;
  isStreaming?: boolean;
  onTypingComplete?: () => void;
}

export function MessageBubble({ message, isStreaming = false, onTypingComplete }: MessageBubbleProps) {
  const [isCopied, setIsCopied] = useState(false);
  const isUser = message.role === 'user';

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // 简单的Markdown渲染（代码块）
  const renderContent = (content: string, useTypeEffect: boolean = false) => {
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

      // 普通文本 - 使用打字机效果或直接显示
      if (useTypeEffect && part.trim()) {
        return (
          <TextType
            key={index}
            text={part}
            speed={30}
            showCursor={index === parts.length - 1}
            className="whitespace-pre-wrap"
            onComplete={index === parts.length - 1 ? onTypingComplete : undefined}
          />
        );
      }

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
    <div className={cn('mb-8 flex gap-4 items-start', isUser && 'flex-row-reverse')}>
      {/* 头像 */}
      <div className="flex-shrink-0">
        <div
          className={cn(
            'w-10 h-10 rounded-full flex items-center justify-center shadow-lg',
            isUser
              ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white ring-2 ring-blue-500/20'
              : 'bg-gradient-to-br from-purple-500 to-pink-600 text-white ring-2 ring-purple-500/20'
          )}
        >
          {isUser ? (
            <User className="w-5 h-5" />
          ) : (
            <Bot className="w-5 h-5" />
          )}
        </div>
      </div>

      {/* 消息内容 */}
      <div className={cn('flex-1 max-w-3xl', isUser && 'flex justify-end')}>
        <div className={cn(
          'text-[15px] leading-relaxed',
          isUser
            ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white px-5 py-3.5 rounded-2xl rounded-tr-sm shadow-lg max-w-[85%]'
            : 'text-slate-900 dark:text-white'
        )}>
          {message.content === '' && message.role === 'assistant' ? (
            // Loading animation
            <div className="flex items-center gap-3 py-2">
              <div className="relative flex gap-1.5">
                {[0, 150, 300].map((delay, i) => (
                  <div key={i} className="relative">
                    <div
                      className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 animate-bounce"
                      style={{ animationDelay: `${delay}ms` }}
                    />
                    <div
                      className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 animate-pulse opacity-50"
                      style={{ animationDelay: `${delay}ms` }}
                    />
                  </div>
                ))}
              </div>
              <span className="text-sm text-slate-600 dark:text-gray-400 font-medium">
                AI 正在思考中...
              </span>
            </div>
          ) : (
            <>
              {/* AI消息使用打字机效果，用户消息直接显示 */}
              {renderContent(message.content, isStreaming && !isUser)}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
