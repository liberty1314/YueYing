'use client';

import { useState } from 'react';
import { AppleInput } from '@/components/ui/AppleInput';
import { Search, X, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';

/**
 * AppleInput 组件测试页面
 * 
 * 用于测试和展示 AppleInput 组件的各种状态和功能
 */
export default function TestAppleInputPage() {
  const [basicValue, setBasicValue] = useState('');
  const [emailValue, setEmailValue] = useState('');
  const [passwordValue, setPasswordValue] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorValue, setErrorValue] = useState('invalid@');

  return (
    <div className="min-h-screen bg-[var(--color-background-default)] p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* 页面标题 */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">
            AppleInput 组件测试
          </h1>
          <p className="text-[var(--color-text-secondary)]">
            测试 AppleInput 组件的各种状态和功能
          </p>
        </div>

        {/* 测试区域 */}
        <div className="space-y-12">
          {/* 1. 基础输入框 */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">
              1. 基础输入框
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AppleInput
                label="用户名"
                placeholder="请输入用户名"
                value={basicValue}
                onChange={(e) => setBasicValue(e.target.value)}
              />
              <AppleInput
                label="无标签输入框"
                placeholder="这是一个没有标签的输入框"
              />
            </div>
          </section>

          {/* 2. 带图标的输入框 */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">
              2. 带图标的输入框
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AppleInput
                label="邮箱"
                placeholder="请输入邮箱"
                leftIcon={Mail}
                value={emailValue}
                onChange={(e) => setEmailValue(e.target.value)}
              />
              <AppleInput
                label="搜索"
                placeholder="搜索用户..."
                leftIcon={Search}
                rightIcon={X}
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onRightIconClick={() => setSearchValue('')}
              />
            </div>
          </section>

          {/* 3. 密码输入框（带切换显示） */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">
              3. 密码输入框（带切换显示）
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AppleInput
                label="密码"
                type={showPassword ? 'text' : 'password'}
                placeholder="请输入密码"
                leftIcon={Lock}
                rightIcon={showPassword ? EyeOff : Eye}
                value={passwordValue}
                onChange={(e) => setPasswordValue(e.target.value)}
                onRightIconClick={() => setShowPassword(!showPassword)}
                helpText="密码至少 8 个字符"
              />
              <AppleInput
                label="确认密码"
                type="password"
                placeholder="请再次输入密码"
                leftIcon={Lock}
              />
            </div>
          </section>

          {/* 4. 错误状态 */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">
              4. 错误状态
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AppleInput
                label="邮箱（错误）"
                placeholder="请输入邮箱"
                leftIcon={Mail}
                value={errorValue}
                onChange={(e) => setErrorValue(e.target.value)}
                error="邮箱格式不正确"
              />
              <AppleInput
                label="用户名（错误）"
                placeholder="请输入用户名"
                leftIcon={User}
                error="用户名已存在"
              />
            </div>
          </section>

          {/* 5. 禁用状态 */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">
              5. 禁用状态
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AppleInput
                label="禁用输入框"
                placeholder="这是一个禁用的输入框"
                disabled
                value="不可编辑的内容"
              />
              <AppleInput
                label="禁用输入框（带图标）"
                placeholder="禁用状态"
                leftIcon={User}
                rightIcon={Lock}
                disabled
              />
            </div>
          </section>

          {/* 6. 帮助文本 */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">
              6. 帮助文本
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AppleInput
                label="用户名"
                placeholder="请输入用户名"
                helpText="用户名长度为 3-20 个字符"
              />
              <AppleInput
                label="邮箱"
                placeholder="请输入邮箱"
                leftIcon={Mail}
                helpText="我们不会向您发送垃圾邮件"
              />
            </div>
          </section>

          {/* 7. 不同尺寸（通过 className 调整） */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">
              7. 自定义样式
            </h2>
            <div className="space-y-4">
              <AppleInput
                label="小尺寸输入框"
                placeholder="小尺寸"
                className="py-2 text-sm"
              />
              <AppleInput
                label="大尺寸输入框"
                placeholder="大尺寸"
                className="py-4 text-lg"
              />
            </div>
          </section>

          {/* 8. 聚焦状态演示 */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">
              8. 聚焦状态演示
            </h2>
            <div className="space-y-4">
              <p className="text-sm text-[var(--color-text-secondary)]">
                点击输入框查看聚焦效果：
              </p>
              <AppleInput
                label="聚焦测试"
                placeholder="点击这里查看聚焦效果"
                leftIcon={Search}
                helpText="注意观察边框和背景色的变化"
              />
            </div>
          </section>

          {/* 9. 完整表单示例 */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">
              9. 完整表单示例
            </h2>
            <div className="bg-[var(--color-background-paper)] rounded-[var(--radius-lg)] p-6 space-y-4">
              <AppleInput
                label="姓名"
                placeholder="请输入您的姓名"
                leftIcon={User}
                required
              />
              <AppleInput
                label="邮箱"
                type="email"
                placeholder="your@email.com"
                leftIcon={Mail}
                required
              />
              <AppleInput
                label="密码"
                type="password"
                placeholder="至少 8 个字符"
                leftIcon={Lock}
                helpText="密码应包含字母、数字和特殊字符"
                required
              />
              <button
                type="submit"
                className="w-full bg-[var(--color-primary)] text-white rounded-[var(--radius-md)] py-3 font-medium hover:opacity-90 transition-opacity"
              >
                提交
              </button>
            </div>
          </section>
        </div>

        {/* 当前值显示 */}
        <section className="space-y-4 border-t border-[var(--color-text-disabled)] pt-8">
          <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">
            当前输入值
          </h2>
          <div className="bg-[var(--color-background-paper)] rounded-[var(--radius-lg)] p-6 space-y-2 font-mono text-sm">
            <div>
              <span className="text-[var(--color-text-secondary)]">基础输入框: </span>
              <span className="text-[var(--color-text-primary)]">{basicValue || '(空)'}</span>
            </div>
            <div>
              <span className="text-[var(--color-text-secondary)]">邮箱: </span>
              <span className="text-[var(--color-text-primary)]">{emailValue || '(空)'}</span>
            </div>
            <div>
              <span className="text-[var(--color-text-secondary)]">密码: </span>
              <span className="text-[var(--color-text-primary)]">{passwordValue || '(空)'}</span>
            </div>
            <div>
              <span className="text-[var(--color-text-secondary)]">搜索: </span>
              <span className="text-[var(--color-text-primary)]">{searchValue || '(空)'}</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
