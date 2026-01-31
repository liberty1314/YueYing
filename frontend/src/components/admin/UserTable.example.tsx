/**
 * UserTable 组件使用示例
 * 
 * 展示如何使用 UserTable 组件
 */

import { useState } from 'react';
import { UserTable } from './UserTable';
import type { AdminUser } from '@/lib/api/admin';

// 模拟用户数据
const mockUsers: AdminUser[] = [
  {
    id: 1,
    username: 'admin',
    email: 'admin@example.com',
    role: 'admin',
    is_active: true,
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-01-15T10:30:00Z',
  },
  {
    id: 2,
    username: 'john_doe',
    email: 'john@example.com',
    role: 'user',
    is_active: true,
    created_at: '2024-02-20T14:20:00Z',
    updated_at: '2024-02-20T14:20:00Z',
  },
  {
    id: 3,
    username: 'jane_smith',
    email: 'jane@example.com',
    role: 'user',
    is_active: false,
    created_at: '2024-03-10T09:15:00Z',
    updated_at: '2024-03-10T09:15:00Z',
  },
  {
    id: 4,
    username: 'bob_wilson',
    email: 'bob@example.com',
    role: 'user',
    is_active: true,
    created_at: '2024-03-25T16:45:00Z',
    updated_at: '2024-03-25T16:45:00Z',
  },
  {
    id: 5,
    username: 'alice_brown',
    email: 'alice@example.com',
    role: 'admin',
    is_active: true,
    created_at: '2024-04-05T11:00:00Z',
    updated_at: '2024-04-05T11:00:00Z',
  },
];

export function UserTableExample() {
  const [users, setUsers] = useState<AdminUser[]>(mockUsers);
  const [loading, setLoading] = useState(false);

  const handleEdit = (user: AdminUser) => {
    console.log('编辑用户:', user);
    // 这里可以打开编辑对话框
  };

  const handleDelete = (user: AdminUser) => {
    console.log('删除用户:', user);
    // 这里可以打开删除确认对话框
    if (window.confirm(`确定要删除用户 ${user.username} 吗？`)) {
      setUsers(users.filter((u) => u.id !== user.id));
    }
  };

  const handleToggleStatus = (user: AdminUser) => {
    console.log('切换用户状态:', user);
    // 更新用户状态
    setUsers(
      users.map((u) =>
        u.id === user.id ? { ...u, is_active: !u.is_active } : u
      )
    );
  };

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-2">
          UserTable 组件示例
        </h1>
        <p className="text-[var(--color-text-secondary)]">
          展示用户表格的各种功能：搜索、排序、分页、操作按钮
        </p>
      </div>

      {/* 基础用法 */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">
          基础用法
        </h2>
        <UserTable
          users={users}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleStatus={handleToggleStatus}
        />
      </section>

      {/* 加载状态 */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">
          加载状态
        </h2>
        <div className="flex gap-4 mb-4">
          <button
            onClick={() => setLoading(!loading)}
            className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-[var(--radius-md)] hover:opacity-90 transition-opacity"
          >
            {loading ? '停止加载' : '显示加载状态'}
          </button>
        </div>
        <UserTable
          users={users}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleStatus={handleToggleStatus}
        />
      </section>

      {/* 空状态 */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">
          空状态
        </h2>
        <UserTable
          users={[]}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleStatus={handleToggleStatus}
        />
      </section>

      {/* 功能说明 */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">
          功能说明
        </h2>
        <div className="bg-[var(--color-background-paper)] rounded-[var(--radius-lg)] p-6 space-y-4">
          <div>
            <h3 className="font-semibold text-[var(--color-text-primary)] mb-2">
              搜索功能
            </h3>
            <p className="text-sm text-[var(--color-text-secondary)]">
              在搜索框中输入用户名或邮箱进行过滤
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-[var(--color-text-primary)] mb-2">
              排序功能
            </h3>
            <p className="text-sm text-[var(--color-text-secondary)]">
              点击"用户名"或"注册时间"列标题进行排序，再次点击切换升序/降序
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-[var(--color-text-primary)] mb-2">
              分页功能
            </h3>
            <p className="text-sm text-[var(--color-text-secondary)]">
              每页显示 10 条数据，可通过底部分页器切换页面
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-[var(--color-text-primary)] mb-2">
              操作按钮
            </h3>
            <ul className="text-sm text-[var(--color-text-secondary)] list-disc list-inside space-y-1">
              <li>编辑按钮：打开编辑用户对话框</li>
              <li>启用/禁用按钮：切换用户状态</li>
              <li>删除按钮：删除用户（需要确认）</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-[var(--color-text-primary)] mb-2">
              徽章显示
            </h3>
            <ul className="text-sm text-[var(--color-text-secondary)] list-disc list-inside space-y-1">
              <li>角色徽章：管理员显示蓝色，用户显示灰色</li>
              <li>状态徽章：活跃显示绿色，禁用显示灰色</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}

export default UserTableExample;
