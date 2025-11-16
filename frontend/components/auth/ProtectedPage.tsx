/**
 * 受保护页面组件
 * 
 * 用于包装需要登录才能访问的页面
 * 如果用户未登录，自动重定向到登录页
 */

"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface ProtectedPageProps {
    children: React.ReactNode;
    requireAdmin?: boolean;
    loadingComponent?: React.ReactNode;
}

export function ProtectedPage({
    children,
    requireAdmin = false,
    loadingComponent,
}: ProtectedPageProps) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const { toast } = useToast();

    useEffect(() => {
        if (status === "loading") {
            return;
        }

        if (status === "unauthenticated") {
            toast({
                title: "必须登录才可以访问",
                description: "请先登录您的账号",
                variant: "default",
            });
            router.push("/login");
            return;
        }

        if (requireAdmin && session?.user?.role !== "admin") {
            toast({
                title: "权限不足",
                description: "此页面仅限管理员访问",
                variant: "destructive",
            });
            router.push("/");
            return;
        }
    }, [status, session, requireAdmin, router, toast]);

    // 正在加载会话状态
    if (status === "loading") {
        return (
            loadingComponent || (
                <div className="flex items-center justify-center min-h-screen">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            )
        );
    }

    // 未登录或权限不足
    if (status === "unauthenticated" || (requireAdmin && session?.user?.role !== "admin")) {
        return null;
    }

    // 已登录且有权限
    return <>{children}</>;
}
