/**
 * UnifiedSearchBar - 统一搜索栏
 * 
 * 支持AI语义搜索和关键词搜索的统一入口
 */

'use client';

import { useState } from 'react';
import { Input, Button, Badge } from '@/components/ui';
import { SearchIcon, SparklesIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UnifiedSearchBarProps {
  onSearch: (query: string, mode: 'keyword' | 'semantic') => void;
  initialQuery?: string;
  initialMode?: 'keyword' | 'semantic';
  className?: string;
}

export function UnifiedSearchBar({
  onSearch,
  initialQuery = '',
  initialMode = 'keyword',
  className,
}: UnifiedSearchBarProps) {
  const [query, setQuery] = useState(initialQuery);
  const [searchMode, setSearchMode] = useState<'keyword' | 'semantic'>(initialMode);

  const handleSearch = () => {
    if (query.trim()) {
      onSearch(query.trim(), searchMode);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Search Mode Toggle */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setSearchMode('keyword')}
          className={cn(
            'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
            searchMode === 'keyword'
              ? 'bg-blue-600 dark:bg-blue-500 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          )}
        >
          <SearchIcon className="w-4 h-4 inline mr-2" />
          关键词搜索
        </button>
        <button
          onClick={() => setSearchMode('semantic')}
          className={cn(
            'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
            searchMode === 'semantic'
              ? 'bg-blue-600 dark:bg-blue-500 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          )}
        >
          <SparklesIcon className="w-4 h-4 inline mr-2" />
          AI 语义搜索
        </button>
        {searchMode === 'semantic' && (
          <Badge variant="primary" size="sm">
            AI
          </Badge>
        )}
      </div>

      {/* Search Input */}
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
          {searchMode === 'semantic' ? (
            <SparklesIcon className="w-5 h-5" />
          ) : (
            <SearchIcon className="w-5 h-5" />
          )}
        </div>
        <Input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            searchMode === 'semantic'
              ? '描述你想看的内容，AI 会帮你找到相关结果...'
              : '搜索标题、演员、导演...'
          }
          className="pl-12 pr-28 h-14 text-base"
          fullWidth
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2">
          <Button onClick={handleSearch} disabled={!query.trim()}>
            搜索
          </Button>
        </div>
      </div>

      {/* Tips */}
      {searchMode === 'semantic' && (
        <div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-3">
          <p className="text-xs text-primary-700 dark:text-primary-300">
            💡 提示：AI 语义搜索可以理解自然语言，例如 "科幻类高分电影" 或 "轻松搞笑的日漫"
          </p>
        </div>
      )}
    </div>
  );
}
