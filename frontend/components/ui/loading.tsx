/**
 * Loading 加载组件
 * 
 * 自定义加载指示器组件
 */

import { cn } from '@/lib/utils'

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  text?: string
}

export function Loading({ size = 'md', className, text }: LoadingProps) {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-3',
    lg: 'h-12 w-12 border-4',
  }

  return (
    <div className={cn('flex flex-col items-center justify-center gap-2', className)}>
      <div
        className={cn(
          'animate-spin rounded-full border-primary border-t-transparent',
          sizeClasses[size]
        )}
      />
      {text && (
        <p className="text-sm text-muted-foreground">{text}</p>
      )}
    </div>
  )
}

export function LoadingPage({ text = '加载中...' }: { text?: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Loading size="lg" text={text} />
    </div>
  )
}

export function LoadingOverlay({ text }: { text?: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <Loading size="lg" text={text} />
    </div>
  )
}


