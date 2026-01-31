/**
 * UnifiedSearchBar - 统一搜索栏
 * 
 * 关键词搜索入口
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui';
import { AppleInput } from '@/components/ui/AppleInput';
import { SearchIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UnifiedSearchBarProps {
  onSearch: (query: string) => void;
  initialQuery?: string;
  className?: string;
}

export function UnifiedSearchBar({
  onSearch,
  initialQuery = '',
  className,
}: UnifiedSearchBarProps) {
  const [query, setQuery] = useState(initialQuery);

  const handleSearch = () => {
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Search Input */}
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10">
          <SearchIcon className="w-5 h-5" />
        </div>
        <AppleInput
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="搜索标题、演员、导演..."
          className="pl-12 pr-28 h-14 text-base"
          fullWidth
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2">
          <Button onClick={handleSearch} disabled={!query.trim()}>
            搜索
          </Button>
        </div>
      </div>
    </div>
  );
}
