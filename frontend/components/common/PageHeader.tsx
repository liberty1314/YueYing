/**
 * PageHeader 页面头部组件
 * 
 * 统一的页面头部布局
 */

import { cn } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'

interface PageHeaderProps {
  title: string
  description?: string
  actions?: React.ReactNode
  className?: string
}

export function PageHeader({
  title,
  description,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn('space-y-6 py-8', className)}>
      <div className="flex flex-col items-center text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
        {description && (
          <p className="text-lg text-muted-foreground max-w-2xl">{description}</p>
        )}
        {actions && <div className="flex items-center gap-2 mt-4">{actions}</div>}
      </div>
      <Separator />
    </div>
  )
}


