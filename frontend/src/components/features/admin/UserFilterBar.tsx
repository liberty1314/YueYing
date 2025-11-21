/**
 * UserFilterBar - 用户筛选栏
 * Week 7 Day 4: 用户管理组件
 */

'use client';

import { useState } from 'react';
import { SearchIcon, FilterIcon, XIcon } from 'lucide-react';
import type { UserListFilters } from '@/hooks/useAdminUsers';

export interface UserFilterBarProps {
  filters: UserListFilters;
  onFilterChange: (filters: UserListFilters) => void;
  onReset: () => void;
}

export function UserFilterBar({ filters, onFilterChange, onReset }: UserFilterBarProps) {
  const [searchInput, setSearchInput] = useState(filters.search || '');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange({ ...filters, search: searchInput || undefined });
  };

  const handleRoleChange = (role: string) => {
    onFilterChange({ ...filters, role: role === 'all' ? undefined : (role as 'user' | 'admin') });
  };

  const handleStatusChange = (status: string) => {
    onFilterChange({
      ...filters,
      is_active: status === 'all' ? undefined : status === 'active',
    });
  };

  const hasActiveFilters = filters.search || filters.role || filters.is_active !== undefined;

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4">
      {/* 搜索栏 */}
      <form onSubmit={handleSearchSubmit} className="flex gap-2">
        <div className="flex-1 relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="搜索邮箱、用户名或全名..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
        >
          搜索
        </button>
      </form>

      {/* 筛选器 */}
      <div className="flex flex-wrap gap-4">
        {/* 角色筛选 */}
        <div className="flex items-center gap-2">
          <FilterIcon className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-700 dark:text-gray-300">角色:</span>
          <select
            value={filters.role || 'all'}
            onChange={(e) => handleRoleChange(e.target.value)}
            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">全部</option>
            <option value="admin">管理员</option>
            <option value="user">普通用户</option>
          </select>
        </div>

        {/* 状态筛选 */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-700 dark:text-gray-300">状态:</span>
          <select
            value={
              filters.is_active === undefined
                ? 'all'
                : filters.is_active
                ? 'active'
                : 'inactive'
            }
            onChange={(e) => handleStatusChange(e.target.value)}
            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">全部</option>
            <option value="active">激活</option>
            <option value="inactive">禁用</option>
          </select>
        </div>

        {/* 重置按钮 */}
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="flex items-center gap-1 px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
          >
            <XIcon className="w-4 h-4" />
            重置筛选
          </button>
        )}
      </div>
    </div>
  );
}
