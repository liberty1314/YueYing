"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Moon, Sun } from "lucide-react"
import { flushSync } from "react-dom"
import { useTheme } from "next-themes"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface AnimatedThemeTogglerProps
  extends React.ComponentPropsWithoutRef<"button"> {
  duration?: number
}

// 检查浏览器是否支持 View Transitions API
const supportsViewTransitions = () => {
  return typeof document !== "undefined" && "startViewTransition" in document
}

export const AnimatedThemeToggler = ({
  className,
  duration = 400,
  ...props
}: AnimatedThemeTogglerProps) => {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)

  // 防止水合错误
  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = useCallback(async () => {
    if (!buttonRef.current || !mounted) return

    const newTheme = theme === "dark" ? "light" : "dark"

    // 如果浏览器支持 View Transitions API，使用动画
    if (supportsViewTransitions()) {
      const { top, left, width, height } =
        buttonRef.current.getBoundingClientRect()
      const x = left + width / 2
      const y = top + height / 2
      const maxRadius = Math.hypot(
        Math.max(left, window.innerWidth - left),
        Math.max(top, window.innerHeight - top)
      )

      // @ts-ignore - startViewTransition is not yet in TypeScript types
      const transition = document.startViewTransition(() => {
        flushSync(() => {
          setTheme(newTheme)
        })
      })

      await transition.ready

      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${maxRadius}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration,
          easing: "ease-in-out",
          pseudoElement: "::view-transition-new(root)",
        }
      )
    } else {
      // 降级：直接切换主题，不使用动画
      setTheme(newTheme)
    }
  }, [theme, setTheme, mounted, duration])

  // 在服务端渲染时返回一个占位符
  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className={cn("h-9 w-9", className)}
        disabled
      >
        <Sun className="h-4 w-4" />
        <span className="sr-only">切换主题</span>
      </Button>
    )
  }

  const isDark = theme === "dark"

  return (
    <Button
      ref={buttonRef}
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className={cn("h-9 w-9 relative", className)}
      {...props}
    >
      {/* 太阳图标（亮色模式） */}
      <Sun className={cn(
        "h-4 w-4 transition-all",
        isDark ? "rotate-90 scale-0" : "rotate-0 scale-100"
      )} />
      {/* 月亮图标（深色模式） */}
      <Moon className={cn(
        "absolute h-4 w-4 transition-all",
        isDark ? "rotate-0 scale-100" : "-rotate-90 scale-0"
      )} />
      <span className="sr-only">切换主题</span>
    </Button>
  )
}
