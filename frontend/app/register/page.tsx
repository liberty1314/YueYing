/**
 * 注册页面
 */

import { Metadata } from 'next'
import RegisterForm from '@/components/auth/RegisterForm'

export const metadata: Metadata = {
  title: '注册 - 阅影·log',
  description: '创建你的阅影·log账户',
}

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <RegisterForm />
    </div>
  )
}

