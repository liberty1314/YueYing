/**
 * UserTable 用户表格组件
 * 
 * 展示用户列表，支持排序、搜索、分页和操作
 * 
 * 功能：
 * - 表格布局（用户名、邮箱、角色、状态、注册时间、操作）
 * - Apple 风格表格样式
 * - 排序功能（用户名、注册时间）
 * - 搜索过滤功能
 * - 分页功能
 * - 操作按钮（编辑、删除、启用/禁用）
 * - 状态和角色徽章
 * - 加载状态（Skeleton）
 */

import { useState, useMemo } from 'react';
import { Edit, Trash2, Power, ChevronUp, ChevronDown, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { SkeletonTable } from '@/components/ui/Skeleton';
import { cn, formatRelativeTime } from '@/lib/utils';
import type { AdminUser } from '@/lib/api/admin';

export interface UserTableProps {
  users: AdminUser[];
  loading?: boolean;
  onEdit: (user: AdminUser) => void;
  onDelete: (user: AdminUser) => void;
  onToggleStatus: (user: AdminUser) => void;
  className?: string;
}

type SortField = 'username' | 'created_at';
type SortDirection = 'asc' | 'desc';

export function UserTable({
  users,
  loading = false,
  onEdit,
  onDelete,
  onToggleStatus,
  className,
}: UserTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  // 搜索过滤
  const filteredUsers = useMemo(() => {
    if (!searchTerm) return users;
    
    const term = searchTerm.toLowerCase();
    return users.filter(
      (user) =>
        user.username.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term)
    );
  }, [users, searchTerm]);

  // 排序
  const sortedUsers = useMemo(() => {
    const sorted = [...filteredUsers];
    
    sorted.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;
      
      if (sortField === 'username') {
        aValue = a.username.toLowerCase();
        bValue = b.username.toLowerCase();
      } else {
        aValue = new Date(a.created_at).getTime();
        bValue = new Date(b.created_at).getTime();
      }
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    
    return sorted;
  }, [filteredUsers, sortField, sortDirection]);

  // 分页
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return sortedUsers.slice(startIndex, endIndex);
  }, [sortedUsers, currentPage, pageSize]);

  const totalPages = Math.ceil(sortedUsers.length / pageSize);

  // 处理排序
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // 渲染排序图标
  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    
    return sortDirection === 'asc' ? (
      <ChevronUp className="w-4 h-4 ml-1 inline" />
    ) : (
      <ChevronDown className="w-4 h-4 ml-1 inline" />
    );
  };

  // 加载状态
  if (loading) {
    return (
      <div className={cn('space-y-4', className)}>
        {/* 搜索框骨架 */}
        <div className="h-10 bg-[var(--color-background-paper)] rounded-[var(--radius-md)] animate-pulse" />
        {/* 表格骨架 */}
        <SkeletonTable rows={5} cols={6} />
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* 搜索栏 */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-secondary)]" />
        <input
          type="text"
          placeholder="搜索用户名或邮箱..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1); // 重置到第一页
          }}
          className={cn(
            'w-full pl-10 pr-4 py-2.5',
            'rounded-[var(--radius-md)]',
            'bg-[var(--color-background-elevated)]',
            'border border-[var(--color-text-disabled)] border-opacity-20',
            'text-[var(--color-text-primary)]',
            'placeholder:text-[var(--color-text-disabled)]',
            'focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent',
            'transition-all duration-200'
          )}
        />
      </div>

      {/* 表格 */}
      <div className="overflow-x-auto rounded-[var(--radius-lg)] border border-[var(--color-text-disabled)] border-opacity-20">
        <table className="w-full">
          {/* 表头 */}
          <thead className="bg-[var(--color-background-paper)]">
            <tr>
              <th
                className={cn(
                  'px-6 py-4 text-left text-sm font-semibold text-[var(--color-text-primary)]',
                  'cursor-pointer hover:bg-[var(--color-background-elevated)] transition-colors',
                  'select-none'
                )}
                onClick={() => handleSort('username')}
              >
                <div className="flex items-center">
                  用户名
                  {renderSortIcon('username')}
                </div>
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--color-text-primary)]">
                邮箱
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--color-text-primary)]">
                角色
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--color-text-primary)]">
                状态
              </th>
              <th
                className={cn(
                  'px-6 py-4 text-left text-sm font-semibold text-[var(--color-text-primary)]',
                  'cursor-pointer hover:bg-[var(--color-background-elevated)] transition-colors',
                  'select-none'
                )}
                onClick={() => handleSort('created_at')}
              >
                <div className="flex items-center">
                  注册时间
                  {renderSortIcon('created_at')}
                </div>
              </th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-[var(--color-text-primary)]">
                操作
              </th>
            </tr>
          </thead>

          {/* 表格主体 */}
          <tbody className="divide-y divide-[var(--color-text-disabled)] divide-opacity-10">
            {paginatedUsers.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <p className="text-[var(--color-text-secondary)]">
                      {searchTerm ? '未找到匹配的用户' : '暂无用户数据'}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedUsers.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-[var(--color-background-elevated)] transition-colors"
                >
                  {/* 用户名 */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[var(--color-primary)] bg-opacity-10 flex items-center justify-center">
                        <span className="text-sm font-medium text-[var(--color-primary)]">
                          {user.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-[var(--color-text-primary)]">
                        {user.username}
                      </span>
                    </div>
                  </td>

                  {/* 邮箱 */}
                  <td className="px-6 py-4">
                    <span className="text-sm text-[var(--color-text-secondary)]">
                      {user.email}
                    </span>
                  </td>

                  {/* 角色 */}
                  <td className="px-6 py-4">
                    <Badge
                      variant={user.role === 'admin' ? 'primary' : 'default'}
                      size="sm"
                    >
                      {user.role === 'admin' ? '管理员' : '用户'}
                    </Badge>
                  </td>

                  {/* 状态 */}
                  <td className="px-6 py-4">
                    <Badge
                      variant={user.is_active ? 'success' : 'default'}
                      size="sm"
                    >
                      {user.is_active ? '活跃' : '禁用'}
                    </Badge>
                  </td>

                  {/* 注册时间 */}
                  <td className="px-6 py-4">
                    <span className="text-sm text-[var(--color-text-secondary)]">
                      {formatRelativeTime(user.created_at)}
                    </span>
                  </td>

                  {/* 操作按钮 */}
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      {/* 编辑按钮 */}
                      <button
                        onClick={() => onEdit(user)}
                        aria-label="编辑用户"
                        className={cn(
                          'p-2 rounded-[var(--radius-sm)]',
                          'text-[var(--color-text-secondary)]',
                          'hover:bg-[var(--color-background-paper)] hover:text-[var(--color-primary)]',
                          'transition-all duration-200',
                          'focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2'
                        )}
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      {/* 启用/禁用按钮 */}
                      <button
                        onClick={() => onToggleStatus(user)}
                        aria-label={user.is_active ? '禁用用户' : '启用用户'}
                        className={cn(
                          'p-2 rounded-[var(--radius-sm)]',
                          'text-[var(--color-text-secondary)]',
                          'hover:bg-[var(--color-background-paper)]',
                          user.is_active
                            ? 'hover:text-[var(--color-warning)]'
                            : 'hover:text-[var(--color-success)]',
                          'transition-all duration-200',
                          'focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2'
                        )}
                      >
                        <Power className="w-4 h-4" />
                      </button>

                      {/* 删除按钮 */}
                      <button
                        onClick={() => onDelete(user)}
                        aria-label="删除用户"
                        className={cn(
                          'p-2 rounded-[var(--radius-sm)]',
                          'text-[var(--color-text-secondary)]',
                          'hover:bg-[var(--color-background-paper)] hover:text-[var(--color-error)]',
                          'transition-all duration-200',
                          'focus:outline-none focus:ring-2 focus:ring-[var(--color-error)] focus:ring-offset-2'
                        )}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 分页 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-[var(--color-text-secondary)]">
            显示 {(currentPage - 1) * pageSize + 1} 到{' '}
            {Math.min(currentPage * pageSize, sortedUsers.length)} 条，共{' '}
            {sortedUsers.length} 条
          </div>

          <div className="flex items-center gap-2">
            {/* 上一页 */}
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className={cn(
                'px-3 py-1.5 rounded-[var(--radius-sm)]',
                'text-sm font-medium',
                'transition-all duration-200',
                currentPage === 1
                  ? 'text-[var(--color-text-disabled)] cursor-not-allowed'
                  : 'text-[var(--color-text-primary)] hover:bg-[var(--color-background-paper)]'
              )}
            >
              上一页
            </button>

            {/* 页码 */}
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                // 只显示当前页附近的页码
                if (
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={cn(
                        'min-w-[32px] h-8 px-2 rounded-[var(--radius-sm)]',
                        'text-sm font-medium',
                        'transition-all duration-200',
                        page === currentPage
                          ? 'bg-[var(--color-primary)] text-white'
                          : 'text-[var(--color-text-primary)] hover:bg-[var(--color-background-paper)]'
                      )}
                    >
                      {page}
                    </button>
                  );
                }
                
                // 显示省略号
                if (page === currentPage - 2 || page === currentPage + 2) {
                  return (
                    <span
                      key={page}
                      className="px-2 text-[var(--color-text-disabled)]"
                    >
                      ...
                    </span>
                  );
                }
                
                return null;
              })}
            </div>

            {/* 下一页 */}
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(totalPages, prev + 1))
              }
              disabled={currentPage === totalPages}
              className={cn(
                'px-3 py-1.5 rounded-[var(--radius-sm)]',
                'text-sm font-medium',
                'transition-all duration-200',
                currentPage === totalPages
                  ? 'text-[var(--color-text-disabled)] cursor-not-allowed'
                  : 'text-[var(--color-text-primary)] hover:bg-[var(--color-background-paper)]'
              )}
            >
              下一页
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
