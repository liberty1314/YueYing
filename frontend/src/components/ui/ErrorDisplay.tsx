/**
 * 错误提示组件 - ErrorDisplay
 * 
 * 友好的错误信息展示，带有重试功能
 */

import { cn } from '@/lib/utils';
import { Button } from './button';
import { 
  AlertCircleIcon, 
  WifiOffIcon, 
  ServerCrashIcon, 
  XCircleIcon,
  RefreshCwIcon,
  HomeIcon
} from 'lucide-react';
import { APIError } from '@/lib/apiClient';

interface ErrorDisplayProps {
  error: Error | APIError | string;
  onRetry?: () => void;
  onGoHome?: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
}

/**
 * 根据错误类型返回友好的错误信息
 */
function getErrorInfo(error: Error | APIError | string) {
  // 字符串错误
  if (typeof error === 'string') {
    return {
      title: '操作失败',
      message: error,
      icon: AlertCircleIcon,
      suggestions: ['请稍后重试'],
    };
  }

  // API错误
  if (error instanceof APIError) {
    const { statusCode, detail } = error;

    // 网络错误
    if (statusCode === 0 || statusCode >= 500) {
      return {
        title: '服务器错误',
        message: detail || '服务器暂时无法响应，请稍后重试',
        icon: ServerCrashIcon,
        suggestions: [
          '检查网络连接',
          '刷新页面重试',
          '如问题持续，请联系管理员',
        ],
      };
    }

    // 认证错误
    if (statusCode === 401) {
      return {
        title: '未授权',
        message: detail || '您的登录已过期，请重新登录',
        icon: XCircleIcon,
        suggestions: ['重新登录以继续使用'],
      };
    }

    // 权限错误
    if (statusCode === 403) {
      return {
        title: '权限不足',
        message: detail || '您没有权限执行此操作',
        icon: XCircleIcon,
        suggestions: ['联系管理员获取权限'],
      };
    }

    // 404错误
    if (statusCode === 404) {
      return {
        title: '未找到资源',
        message: detail || '请求的内容不存在',
        icon: AlertCircleIcon,
        suggestions: ['检查URL是否正确', '返回首页查找内容'],
      };
    }

    // 其他客户端错误
    if (statusCode >= 400 && statusCode < 500) {
      return {
        title: '请求错误',
        message: detail || '请求参数有误',
        icon: AlertCircleIcon,
        suggestions: ['检查输入信息', '稍后重试'],
      };
    }
  }

  // 网络错误
  if (error.message.includes('Failed to fetch') || error.message.includes('Network')) {
    return {
      title: '网络连接失败',
      message: '无法连接到服务器，请检查您的网络连接',
      icon: WifiOffIcon,
      suggestions: [
        '检查网络连接',
        '关闭VPN或代理',
        '刷新页面重试',
      ],
    };
  }

  // 通用错误
  return {
    title: '发生错误',
    message: error.message || '未知错误',
    icon: AlertCircleIcon,
    suggestions: ['请稍后重试', '如问题持续，请联系支持'],
  };
}

export function ErrorDisplay({
  error,
  onRetry,
  onGoHome,
  className,
  size = 'md',
  showDetails = false,
}: ErrorDisplayProps) {
  const errorInfo = getErrorInfo(error);
  const Icon = errorInfo.icon;

  const sizeStyles = {
    sm: {
      container: 'p-4',
      icon: 'w-8 h-8',
      title: 'text-lg',
      message: 'text-sm',
      button: 'text-sm',
    },
    md: {
      container: 'p-6',
      icon: 'w-12 h-12',
      title: 'text-xl',
      message: 'text-base',
      button: 'text-base',
    },
    lg: {
      container: 'p-8',
      icon: 'w-16 h-16',
      title: 'text-2xl',
      message: 'text-lg',
      button: 'text-lg',
    },
  };

  const styles = sizeStyles[size];

  return (
    <div
      className={cn(
        'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg',
        styles.container,
        className
      )}
    >
      <div className="flex flex-col items-center text-center space-y-4">
        {/* 图标 */}
        <div className="rounded-full bg-red-100 dark:bg-red-900/40 p-3">
          <Icon className={cn('text-red-600 dark:text-red-400', styles.icon)} />
        </div>

        {/* 标题 */}
        <div>
          <h3 className={cn('font-semibold text-red-900 dark:text-red-100', styles.title)}>
            {errorInfo.title}
          </h3>
          <p className={cn('text-red-700 dark:text-red-300 mt-2', styles.message)}>
            {errorInfo.message}
          </p>
        </div>

        {/* 建议 */}
        {errorInfo.suggestions.length > 0 && (
          <div className="text-left w-full max-w-md">
            <p className="text-sm font-medium text-red-800 dark:text-red-200 mb-2">
              建议操作：
            </p>
            <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
              {errorInfo.suggestions.map((suggestion, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-red-500 mt-0.5">•</span>
                  <span>{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 操作按钮 */}
        <div className="flex gap-3">
          {onRetry && (
            <Button
              onClick={onRetry}
              variant="primary"
              size={size === 'sm' ? 'sm' : 'md'}
              className={styles.button}
            >
              <RefreshCwIcon className="w-4 h-4 mr-2" />
              重试
            </Button>
          )}
          {onGoHome && (
            <Button
              onClick={onGoHome}
              variant="outline"
              size={size === 'sm' ? 'sm' : 'md'}
              className={styles.button}
            >
              <HomeIcon className="w-4 h-4 mr-2" />
              返回首页
            </Button>
          )}
        </div>

        {/* 技术详情（调试用） */}
        {showDetails && error instanceof Error && (
          <details className="w-full text-left">
            <summary className="text-sm text-red-600 dark:text-red-400 cursor-pointer">
              技术详情
            </summary>
            <pre className="mt-2 p-3 bg-red-100 dark:bg-red-900/40 rounded text-xs text-red-800 dark:text-red-200 overflow-auto">
              {error.stack || error.message}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}

/**
 * 内联错误提示（适合表单等小范围使用）
 */
export function InlineError({
  message,
  className,
}: {
  message: string;
  className?: string;
}) {
  return (
    <div className={cn('flex items-center gap-2 text-sm text-red-600 dark:text-red-400', className)}>
      <AlertCircleIcon className="w-4 h-4 flex-shrink-0" />
      <span>{message}</span>
    </div>
  );
}

/**
 * Toast风格的错误提示
 */
export function ErrorToast({
  message,
  onClose,
  className,
}: {
  message: string;
  onClose?: () => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg shadow-lg',
        className
      )}
    >
      <div className="flex items-center gap-3">
        <AlertCircleIcon className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
        <p className="text-sm text-red-800 dark:text-red-200">{message}</p>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
        >
          <XCircleIcon className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
