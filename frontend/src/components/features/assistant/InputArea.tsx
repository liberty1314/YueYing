/**
 * InputArea - 输入区域组件 (简化版)
 * 
 * 功能：
 * - 多行文本输入
 * - 发送按钮
 * - Enter键发送，Shift+Enter换行
 * - 字符计数
 */

'use client';

import { useState, useRef, KeyboardEvent } from 'react';
import { SendIcon } from 'lucide-react';
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

    // 自动调整高度
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
  };

  const charCount = message.length;
  const maxChars = 2000;

  return (
    <div className="relative">
      {/* 输入框容器 - Gemini 风格 */}
      <div className={cn(
        "relative bg-white dark:bg-gray-900 rounded-2xl shadow-sm border transition-all duration-300",
        message.trim()
          ? "border-blue-500/50 dark:border-blue-400/50 ring-2 ring-blue-500/10 dark:ring-blue-400/10"
          : "border-slate-200 dark:border-gray-700 hover:border-slate-300 dark:hover:border-gray-600"
      )}>
        <div className="flex items-end gap-3 p-3">
          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder={placeholder}
            rows={1}
            className={cn(
              'flex-1 resize-none bg-transparent text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none text-[15px] leading-relaxed',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
            style={{
              minHeight: '28px',
              maxHeight: '200px',
            }}
          />

          {/* 发送按钮 */}
          <button
            onClick={handleSend}
            disabled={disabled || !message.trim()}
            className={cn(
              "flex-shrink-0 p-2.5 rounded-xl transition-all duration-300 group",
              message.trim() && !disabled
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 hover:shadow-lg hover:shadow-blue-500/50 dark:hover:shadow-blue-400/30 hover:scale-105 active:scale-95"
                : "bg-slate-200 dark:bg-gray-700 opacity-50 cursor-not-allowed"
            )}
          >
            <SendIcon className={cn(
              "w-5 h-5 transition-transform",
              message.trim() && !disabled
                ? "text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                : "text-slate-400 dark:text-gray-500"
            )} />
          </button>
        </div>

        {/* 底部字符计数 */}
        <div className="flex items-center justify-end px-4 pb-2.5 pt-0">
          <div className={cn(
            "text-xs font-medium transition-colors",
            charCount > maxChars * 0.9
              ? "text-red-500 dark:text-red-400"
              : "text-slate-400 dark:text-gray-500"
          )}>
            {charCount}/{maxChars}
          </div>
        </div>
      </div>
    </div>
  );
}
