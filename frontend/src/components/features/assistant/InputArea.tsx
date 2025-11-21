/**
 * InputArea - 输入区域组件
 * 
 * 功能：
 * - 多行文本输入
 * - 快捷指令支持
 * - 发送按钮
 * - Enter键发送，Shift+Enter换行
 * - 字符计数
 */

'use client';

import { useState, useRef, KeyboardEvent } from 'react';
import { Button } from '@/components/ui';
import {
  SendIcon,
  ZapIcon,
  SparklesIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface InputAreaProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

const quickCommands = [
  { label: '推荐电影', prompt: '请根据我的观看历史推荐一些高分电影' },
  { label: '统计分析', prompt: '帮我分析一下最近的观影数据和趋势' },
  { label: '标签总结', prompt: '总结一下我最常看的内容类型和标签' },
];

export function InputArea({
  onSend,
  disabled = false,
  placeholder = '输入你的问题...'
}: InputAreaProps) {
  const [message, setMessage] = useState('');
  const [showCommands, setShowCommands] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage || disabled) return;

    onSend(trimmedMessage);
    setMessage('');
    setShowCommands(false);

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

    // 触发快捷指令
    if (e.key === '/' && message === '') {
      e.preventDefault();
      setShowCommands(true);
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);

    // 自动调整高度
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';

    // 显示快捷指令
    if (e.target.value === '/') {
      setShowCommands(true);
    } else if (!e.target.value.startsWith('/')) {
      setShowCommands(false);
    }
  };

  const handleCommandSelect = (prompt: string) => {
    setMessage(prompt);
    setShowCommands(false);
    textareaRef.current?.focus();
  };

  const charCount = message.length;
  const maxChars = 2000;

  return (
    <div className="relative">
      {/* 快捷指令面板 */}
      {showCommands && (
        <div className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-fadeIn">
          <div className="p-2 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <ZapIcon className="w-4 h-4" />
              快捷指令
            </div>
          </div>
          <div className="max-h-48 overflow-y-auto">
            {quickCommands.map((cmd, index) => (
              <button
                key={index}
                onClick={() => handleCommandSelect(cmd.prompt)}
                className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <SparklesIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {cmd.label}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                      {cmd.prompt}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
          <div className="p-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              💡 输入 / 显示更多指令
            </div>
          </div>
        </div>
      )}

      {/* 输入框容器 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 focus-within:border-primary-500 transition-colors">
        <div className="flex items-end gap-2 p-4">
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
              'flex-1 resize-none bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
            style={{
              minHeight: '24px',
              maxHeight: '200px',
            }}
          />

          {/* 发送按钮 */}
          <Button
            variant="primary"
            size="sm"
            onClick={handleSend}
            disabled={disabled || !message.trim()}
            className="flex-shrink-0 bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white disabled:opacity-50"
          >
            <SendIcon className="w-4 h-4 text-white" />
          </Button>
        </div>

        {/* 底部工具栏 */}
        <div className="flex items-center justify-between px-4 pb-3 pt-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCommands(!showCommands)}
              className="text-xs text-gray-500 dark:text-gray-400 hover:text-primary-500 transition-colors flex items-center gap-1"
            >
              <ZapIcon className="w-3 h-3" />
              快捷指令
            </button>
          </div>

          <div className="text-xs text-gray-400 dark:text-gray-500">
            {charCount}/{maxChars}
          </div>
        </div>
      </div>

      {/* 提示信息 */}
      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
        <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-600">
          Enter
        </kbd>{' '}
        发送{' '}
        <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-600">
          Shift + Enter
        </kbd>{' '}
        换行
      </div>
    </div>
  );
}
