"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Settings,
  Bot,
  Users,
  Database,
  Activity,
  Brain,
  Key,
  FileText,
  Layers,
} from "lucide-react";

const menuItems = [
  {
    title: "仪表板",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "LLM 配置",
    href: "/admin/llm-config",
    icon: Bot,
  },
  {
    title: "RAG 系统",
    href: "/admin/rag",
    icon: Brain,
  },
  {
    title: "用户管理",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "API 密钥",
    href: "/admin/api-keys",
    icon: Key,
  },
  {
    title: "缓存管理",
    href: "/admin/cache",
    icon: Layers,
  },
  {
    title: "系统日志",
    href: "/admin/logs",
    icon: FileText,
  },
  {
    title: "数据管理",
    href: "/admin/data",
    icon: Database,
  },
  {
    title: "系统监控",
    href: "/admin/monitoring",
    icon: Activity,
  },
  {
    title: "系统设置",
    href: "/admin/system",
    icon: Settings,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r bg-card fixed top-16 left-0 h-[calc(100vh-4rem)] z-40">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-14 items-center border-b px-6">
          <Link href="/admin" prefetch={true} className="flex items-center gap-2 font-semibold">
            <Bot className="h-6 w-6" />
            <span>阅影·log 管理</span>
          </Link>
        </div>

        {/* 导航菜单 */}
        <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={true}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.title}
              </Link>
            );
          })}
        </nav>

        {/* 底部 */}
        <div className="border-t p-4">
          <Link
            href="/"
            prefetch={true}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            返回首页
          </Link>
        </div>
      </div>
    </aside>
  );
}

