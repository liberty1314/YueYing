/**
 * InputArea - 输入区域组件 (优化版)
 * 
 * 功能：
 * - 多行文本输入
 * - 快捷指令支持
 * - 发送按钮
 * - Enter键发送，Shift+Enter换行
 * - 字符计数
 * 
 * 优化点：
 * - 悬浮式设计，底部留白
 * - 玻璃拟态效果
 * - 聚焦时外发光
 * - 附件上传图标
 */

'use client';

import { useState, useRef, KeyboardEvent } from 'react';
import { Button } from '@/components/ui';
import {
  SendIcon,
  ZapIcon,
  SparklesIcon,
  PaperclipIcon
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
        <div className="absolute bottom-full left-0 right-0 mb-3 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200/60 dark:border-gray-700/60 overflow-hidden animate-fadeIn">
          <div className="p-3 border-b border-slate-200/60 dark:border-gray-700/60 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-950/30 dark:to-indigo-950/30">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-gray-300">
              <ZapIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              快捷指令
            </div>
          </div>
          <div className="max-h-48 overflow-y-auto p-2">
            {quickCommands.map((cmd, index) => (
              <button
                key={index}
                onClick={() => handleCommandSelect(cmd.prompt)}
                className="w-full text-left px-4 py-3 rounded-xl hover:bg-slate-100 dark:hover:bg-gray-800 transition-all duration-200 group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <SparklesIcon className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-slate-900 dark:text-white">
                      {cmd.label}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-gray-400 line-clamp-1 mt-0.5">
                      {cmd.prompt}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
          <div className="p-3 border-t border-slate-200/60 dark:border-gray-700/60 bg-slate-50/50 dark:bg-gray-900/50">
            <div className="text-xs text-slate-500 dark:text-gray-400 flex items-center gap-1.5">
              <span className="text-base">💡</span>
              输入 <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-800 rounded border border-slate-300 dark:border-gray-600 font-mono text-xs">/</kbd> 显示更多指令
            </div>
          </div>
        </div>
      )}

      {/* 输入框容器 - 悬浮式设计 */}
      <div className={cn(
        "relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-lg border transition-all duration-300",
        message.trim()
          ? "border-blue-500/50 dark:border-blue-400/50 shadow-blue-500/20 dark:shadow-blue-400/10 shadow-xl"
          : "border-slate-200/60 dark:border-gray-700/60 hover:border-slate-300 dark:hover:border-gray-600"
      )}>
        <div className="flex items-end gap-3 p-4">
          {/* 附件按钮 */}
          <button
            type="button"
            className="flex-shrink-0 p-2 rounded-lg text-slate-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-gray-800 transition-all duration-200"
            title="上传附件"
          >
            <PaperclipIcon className="w-5 h-5" />
          </button>

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

        {/* 底部工具栏 */}
        <div className="flex items-center justify-between px-4 pb-3 pt-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCommands(!showCommands)}
              className="text-xs text-slate-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1.5 font-medium"
            >
              <ZapIcon className="w-3.5 h-3.5" />
              快捷指令
            </button>
          </div>

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

      {/* 提示信息 */}
      <div className="mt-3 text-xs text-slate-500 dark:text-gray-400 text-center flex items-center justify-center gap-2">
        <span className="flex items-center gap-1">
          <kbd className="px-2 py-1 bg-white dark:bg-gray-800 rounded-md border border-slate-300 dark:border-gray-600 font-mono text-xs shadow-sm">
            Enter
          </kbd>
          发送
        </span>
        <span className="text-slate-300 dark:text-gray-600">•</span>
        <span className="flex items-center gap-1">
          <kbd className="px-2 py-1 bg-white dark:bg-gray-800 rounded-md border border-slate-300 dark:border-gray-600 font-mono text-xs shadow-sm">
            Shift + Enter
          </kbd>
          换行
        </span>
      </div>
    </div>
  );
}
