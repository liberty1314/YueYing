'use client'

/**
 * 注册表单组件
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { register } from '@/lib/auth-api'

export default function RegisterForm() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // 验证密码
    if (formData.password !== formData.confirmPassword) {
      setError('两次输入的密码不一致')
      return
    }

    if (formData.password.length < 6) {
      setError('密码至少需要 6 个字符')
      return
    }

    setIsLoading(true)

    try {
      await register({
        email: formData.email,
        username: formData.username,
        password: formData.password,
      })

      // 注册成功，跳转到登录页
      router.push('/login?registered=true')
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.detail || err.message || '注册失败'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight">注册</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          创建你的阅影·log账户
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        {error && (
          <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium">
              邮箱
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label htmlFor="username" className="block text-sm font-medium">
              用户名
            </label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              required
              value={formData.username}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="username"
              minLength={3}
              maxLength={50}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              3-50个字符，仅支持字母、数字、下划线和连字符
            </p>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium">
              密码
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              value={formData.password}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="••••••••"
              minLength={6}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              至少 6 个字符
            </p>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium">
              确认密码
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="••••••••"
            />
          </div>
        </div>

        <div className="text-center text-sm">
          <span className="text-muted-foreground">已有账户？</span>{' '}
          <Link
            href="/login"
            className="font-medium text-primary hover:underline"
          >
            立即登录
          </Link>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
        >
          {isLoading ? '注册中...' : '注册'}
        </button>
      </form>
    </div>
  )
}

