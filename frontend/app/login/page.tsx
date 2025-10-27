/**
 * 登录页面
 */

import { Metadata } from 'next'
import LoginForm from '@/components/auth/LoginForm'

export const metadata: Metadata = {
  title: '登录 - 阅影·log',
  description: '登录你的阅影·log账户',
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <LoginForm />
    </div>
  )
}

