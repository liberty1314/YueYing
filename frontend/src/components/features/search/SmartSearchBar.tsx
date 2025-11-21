/**
 * SmartSearchBar - 智能搜索栏
 * 
 * 支持语义搜索和自动补全的智能搜索组件
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui';
import { SearchIcon, SparklesIcon, ClockIcon, XIcon } from 'lucide-react';
import { cn, debounce } from '@/lib/utils';
import Link from 'next/link';

interface SearchSuggestion {
  type: 'history' | 'suggestion' | 'ai';
  text: string;
  href?: string;
}

interface SmartSearchBarProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
  className?: string;
}

export function SmartSearchBar({
  onSearch,
  placeholder = '搜索或描述你想看的...',
  className
}: SmartSearchBarProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 获取搜索建议（防抖）
  const fetchSuggestions = debounce(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      // 显示搜索历史
      const history = getSearchHistory();
      setSuggestions(history.map(text => ({ type: 'history', text })));
      return;
    }

    setIsLoading(true);
    try {
      // TODO: 调用实际API
      // const response = await fetch(`/api/search/suggestions?q=${encodeURIComponent(searchQuery)}`);
      // const data = await response.json();

      // 模拟建议
      const mockSuggestions: SearchSuggestion[] = [
        { type: 'ai', text: `🤖 AI建议: "${searchQuery}" 相关的科幻电影` },
        { type: 'suggestion', text: `${searchQuery}` },
        { type: 'suggestion', text: `高分${searchQuery}` },
      ];

      setSuggestions(mockSuggestions);
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
    } finally {
      setIsLoading(false);
    }
  }, 300);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setIsOpen(true);
    fetchSuggestions(value);
  };

  const handleSearch = (searchQuery?: string) => {
    const finalQuery = searchQuery || query;
    if (!finalQuery.trim()) return;

    // 保存到搜索历史
    saveToHistory(finalQuery);

    // 执行搜索
    if (onSearch) {
      onSearch(finalQuery);
    } else {
      // 默认跳转到搜索页
      window.location.href = `/search?q=${encodeURIComponent(finalQuery)}`;
    }

    setIsOpen(false);
    setQuery('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const clearSearch = () => {
    setQuery('');
    setSuggestions([]);
    inputRef.current?.focus();
  };

  // 搜索历史管理
  const getSearchHistory = (): string[] => {
    try {
      const history = localStorage.getItem('search_history');
      return history ? JSON.parse(history) : [];
    } catch {
      return [];
    }
  };

  const saveToHistory = (searchQuery: string) => {
    try {
      const history = getSearchHistory();
      const newHistory = [searchQuery, ...history.filter(q => q !== searchQuery)].slice(0, 10);
      localStorage.setItem('search_history', JSON.stringify(newHistory));
    } catch (error) {
      console.error('Failed to save search history:', error);
    }
  };

  const clearHistory = () => {
    localStorage.removeItem('search_history');
    setSuggestions([]);
  };

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      {/* 搜索输入框 */}
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 dark:text-gray-400" />
        <Input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="pl-10 pr-10"
          fullWidth
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <XIcon className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* 搜索建议下拉 */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-white dark:bg-[#1C1C1E] rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden z-50 animate-fadeIn">
          <div className="py-2">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSearch(suggestion.text.replace('🤖 AI建议: ', ''))}
                className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center gap-3"
              >
                {suggestion.type === 'history' && (
                  <ClockIcon className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                )}
                {suggestion.type === 'ai' && (
                  <SparklesIcon className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                )}
                {suggestion.type === 'suggestion' && (
                  <SearchIcon className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                )}
                <span className="text-sm text-gray-900 dark:text-white flex-1 truncate">
                  {suggestion.text}
                </span>
              </button>
            ))}
          </div>

          {/* 清空历史 */}
          {suggestions.some(s => s.type === 'history') && (
            <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-2">
              <button
                onClick={clearHistory}
                className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                清空搜索历史
              </button>
            </div>
          )}
        </div>
      )}

      {/* 加载状态 */}
      {isLoading && isOpen && (
        <div className="absolute top-full mt-2 w-full bg-white dark:bg-[#1C1C1E] rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden z-50 p-4">
          <div className="flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 dark:border-blue-400"></div>
            <span className="text-sm">搜索中...</span>
          </div>
        </div>
      )}
    </div>
  );
}
