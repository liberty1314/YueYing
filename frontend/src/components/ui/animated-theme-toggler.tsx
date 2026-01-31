"use client"

import { useCallback, useEffect, useRef } from "react"
import { Moon, Sun } from "lucide-react"
import { flushSync } from "react-dom"

import { cn } from "@/lib/utils"
import { useUiStore } from "@/stores/uiStore"

interface AnimatedThemeTogglerProps
  extends React.ComponentPropsWithoutRef<"button"> {
  duration?: number
}

/**
 * AnimatedThemeToggler - 主题切换按钮组件
 * 
 * 集成 Zustand store 进行主题状态管理
 * 使用 View Transition API 实现平滑的主题切换动画
 * 
 * @param duration - 动画持续时间（毫秒），默认 400ms
 */
export const AnimatedThemeToggler = ({
  className,
  duration = 400,
  ...props
}: AnimatedThemeTogglerProps) => {
  const buttonRef = useRef<HTMLButtonElement>(null)
  const { theme, toggleTheme: toggleThemeStore } = useUiStore()
  const isDark = theme === 'dark'

  const toggleTheme = useCallback(async () => {
    if (!buttonRef.current) return

    // 检查浏览器是否支持 View Transition API
    if (!document.startViewTransition) {
      // 不支持则直接切换主题
      toggleThemeStore()
      return
    }

    await document.startViewTransition(() => {
      flushSync(() => {
        toggleThemeStore()
      })
    }).ready

    const { top, left, width, height } =
      buttonRef.current.getBoundingClientRect()
    const x = left + width / 2
    const y = top + height / 2
    const maxRadius = Math.hypot(
      Math.max(left, window.innerWidth - left),
      Math.max(top, window.innerHeight - top)
    )

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
  }, [toggleThemeStore, duration])

  return (
    <button
      ref={buttonRef}
      onClick={toggleTheme}
      aria-label={isDark ? "切换到亮色模式" : "切换到暗色模式"}
      className={cn(
        "flex items-center justify-center w-9 h-9 rounded-lg",
        "text-[var(--color-text-secondary)]",
        "hover:bg-[var(--color-background-paper)]",
        "transition-colors duration-200",
        "focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]",
        className
      )}
      {...props}
    >
      {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      <span className="sr-only">
        {isDark ? "切换到亮色模式" : "切换到暗色模式"}
      </span>
    </button>
  )
}
