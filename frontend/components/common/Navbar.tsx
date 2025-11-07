"use client";

import { useState, useRef, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search, Home, Library, X, BarChart3, Shield, Sparkles, Bot } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import UserMenu from "@/components/auth/UserMenu";
import { useAuthStore } from "@/store/authStore";
import { useSystemSettings } from "@/hooks/use-system-settings";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";

const baseNavItems = [
  {
    label: "首页",
    href: "/",
    icon: Home,
  },
  {
    label: "我的记录",
    href: "/library",
    icon: Library,
  },
  {
    label: "统计",
    href: "/stats",
    icon: BarChart3,
  },
  {
    label: "AI助手",
    href: "/assistant",
    icon: Bot,
  },
];

const exploreNavItem = {
  label: "探索发现",
  href: "/discover",
  icon: Sparkles,
};

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const { isAdmin } = useAuthStore();
  
  // 使用全局缓存的系统设置 Hook
  const { data: settings } = useSystemSettings();

  // 使用 useMemo 计算导航项，只在相关依赖变化时重新计算
  const navItems = useMemo(() => {
    // 如果探索功能启用，在"我的记录"后插入"探索发现"
    if (settings && settings.enable_explore) {
      return [
        baseNavItems[0], // 首页
        baseNavItems[1], // 我的记录
        exploreNavItem,  // 探索发现
        baseNavItems[2], // 统计
        baseNavItems[3], // AI助手
      ];
    }
    return baseNavItems;
  }, [settings]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleClear = () => {
    setSearchQuery("");
    inputRef.current?.focus();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <span className="text-lg font-bold">阅</span>
          </div>
          <span className="text-xl font-bold">阅影·log</span>
        </Link>

        {/* 导航链接 */}
        <nav className="hidden md:flex items-center space-x-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Link key={item.href} href={item.href} prefetch={true}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className={cn(
                    "gap-2",
                    isActive && "bg-primary text-primary-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
          
          {/* 管理后台入口 - 仅管理员可见 */}
          {isAdmin && (
            <Link href="/admin" prefetch={true}>
              <Button
                variant={pathname?.startsWith("/admin") ? "default" : "ghost"}
                className={cn(
                  "gap-2",
                  pathname?.startsWith("/admin") && "bg-primary text-primary-foreground"
                )}
              >
                <Shield className="h-4 w-4" />
                管理后台
              </Button>
            </Link>
          )}
        </nav>

        {/* 搜索框 */}
        <form onSubmit={handleSearch} className="flex-1 max-w-md ml-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索电影、剧集、动漫、书籍..."
              className="h-10 pl-9 pr-9 rounded-full"
            />
            {searchQuery && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0 rounded-full"
              >
                <X className="h-3 w-3" />
                <span className="sr-only">清除</span>
              </Button>
            )}
          </div>
        </form>

        {/* 主题切换和用户菜单 */}
        <div className="flex items-center gap-2">
          <AnimatedThemeToggler />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}

