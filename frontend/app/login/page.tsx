/**
 * 登录页面
 */

"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import LoginForm from '@/components/auth/LoginForm';
import { Loading } from "@/components/ui/loading";
import { useAuthStore } from "@/store/authStore";
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuthStore();
  const { toast } = useToast();

  // 获取 URL 参数
  const callbackUrl = searchParams?.get('callbackUrl') || '/';
  const error = searchParams?.get('error');

  useEffect(() => {
    // 显示需要登录的提示（仅当有 SessionRequired 错误时）
    if (error === 'SessionRequired') {
      toast({
        title: '需要登录',
        description: '请先登录才能访问此页面',
        variant: 'default',
      });
    }
  }, [error, toast]);

  useEffect(() => {
    // 等待 auth 状态加载完成
    if (isAuthLoading) {
      return;
    }

    // 如果已登录，重定向到回调 URL 或首页
    if (isAuthenticated) {
      router.push(callbackUrl);
    }
  }, [isAuthenticated, isAuthLoading, router, callbackUrl]);

  // Auth 状态加载中，显示 loading
  if (isAuthLoading) {
    return <Loading />;
  }

  // 已登录用户，在重定向期间显示 loading（避免闪烁）
  if (isAuthenticated) {
    return <Loading />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <LoginForm callbackUrl={callbackUrl} />
    </div>
  );
}

