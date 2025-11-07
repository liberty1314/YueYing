/**
 * 登录页面
 */

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import LoginForm from '@/components/auth/LoginForm';
import { Loading } from "@/components/ui/loading";
import { useAuthStore } from "@/store/authStore";

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuthStore();

  useEffect(() => {
    // 等待 auth 状态加载完成
    if (isAuthLoading) {
      return;
    }

    // 如果已登录，重定向到首页
    if (isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, isAuthLoading, router]);

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
      <LoginForm />
    </div>
  );
}

