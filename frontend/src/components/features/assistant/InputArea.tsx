/**
 * InputArea - 输入区域组件
 * 
 * 参考设计: AICodingPrompt/ChatInput.tsx
 * 
 * 功能：
 * - 多行文本输入
 * - 发送按钮
 * - Enter键发送，Shift+Enter换行
 * - 字符计数
 */

'use client';

import { useState, useRef, KeyboardEvent, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface InputAreaProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function InputArea({
  onSend,
  disabled = false,
  placeholder = '输入你的问题...'
}: InputAreaProps) {
  const [message, setMessage] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage || disabled) return;

    onSend(trimmedMessage);
    setMessage('');

    // 重置textarea高度
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter键发送，Shift+Enter换行
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 300)}px`;
    }
  }, [message]);

  const charCount = message.length;
  const maxChars = 2000;

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      {/* 输入框容器 - 参考 AICodingPrompt 设计 */}
      <div
        className={cn(
          "relative rounded-[18px] transition-all duration-300 border border-transparent",
          isFocused
            ? "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
            : "bg-[#f0f4f9] dark:bg-gray-800/50 hover:bg-[#e9eef6] dark:hover:bg-gray-800/70"
        )}
      >
        {/* 文本输入区域 */}
        <div className="px-2.5 pt-2 pb-0.5">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            disabled={disabled}
            placeholder={placeholder}
            rows={1}
            className={cn(
              'w-full bg-transparent border-0 focus:ring-0 focus:outline-none resize-none text-sm text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 py-0.5 max-h-[300px] overflow-y-auto leading-5',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
            style={{ minHeight: '24px' }}
          />
        </div>

        {/* 底部控制栏 */}
        <div className="flex items-center justify-between px-2.5 pb-2 pt-0">
          {/* 左侧：字符计数 */}
          <div className={cn(
            "text-[11px] font-medium transition-colors",
            charCount > maxChars * 0.9
              ? "text-red-500 dark:text-red-400"
              : "text-gray-400 dark:text-gray-500"
          )}>
            {charCount > 0 && `${charCount}/${maxChars}`}
          </div>

          {/* 右侧：发送按钮 */}
          <div>
            <button
              onClick={handleSend}
              disabled={disabled || !message.trim()}
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center transition-all relative overflow-hidden",
                message.trim() && !disabled
                  ? "bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-100 hover:scale-105 active:scale-95"
                  : "bg-[#f0f4f9] dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
              )}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={cn(
                  "relative z-10",
                  message.trim() && !disabled && "ml-0.5"
                )}
              >
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
