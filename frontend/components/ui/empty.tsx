/**
 * Empty 空状态组件
 * 
 * 用于显示空状态提示
 */

import { cn } from '@/lib/utils'
import { Button } from './button'

interface EmptyProps {
  icon?: React.ReactNode
  title?: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export function Empty({
  icon,
  title = '暂无数据',
  description,
  action,
  className,
}: EmptyProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12', className)}>
      {icon && <div className="mb-4 text-muted-foreground">{icon}</div>}
      
      <h3 className="mb-2 text-lg font-semibold">{title}</h3>
      
      {description && (
        <p className="mb-4 max-w-md text-center text-sm text-muted-foreground">
          {description}
        </p>
      )}
      
      {action && (
        <Button onClick={action.onClick}>{action.label}</Button>
      )}
    </div>
  )
}


