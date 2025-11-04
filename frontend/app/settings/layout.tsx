"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Container } from "@/components/common/Container";
import { cn } from "@/lib/utils";
import { Settings, Sparkles } from "lucide-react";

const settingsNav = [
  {
    href: "/settings",
    label: "通用设置",
    icon: Settings,
  },
  {
    href: "/settings/ai",
    label: "AI 功能",
    icon: Sparkles,
  },
];

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <Container>
      <div className="py-8">
        <h1 className="text-3xl font-bold mb-8">设置</h1>

        <div className="flex gap-8">
          {/* 侧边栏导航 */}
          <nav className="w-48 flex-shrink-0">
            <div className="space-y-1">
              {settingsNav.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* 主内容区 */}
          <div className="flex-1 max-w-2xl">{children}</div>
        </div>
      </div>
    </Container>
  );
}

