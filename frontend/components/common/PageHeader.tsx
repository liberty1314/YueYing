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
  action?: React.ReactNode
  align?: 'left' | 'center'
  className?: string
}

export function PageHeader({
  title,
  description,
  action,
  align = 'left',
  className,
}: PageHeaderProps) {
  return (
    <div className={cn('space-y-4', className)}>
      <div className={cn(
        'flex gap-4',
        align === 'center' ? 'flex-col items-center text-center' : 'flex-col sm:flex-row sm:items-center sm:justify-between'
      )}>
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>
        {action && (
          <div className="flex items-center gap-2">
            {action}
          </div>
        )}
      </div>
      <Separator />
    </div>
  )
}


