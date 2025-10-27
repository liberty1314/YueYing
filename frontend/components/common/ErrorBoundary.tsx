'use client'

/**
 * ErrorBoundary 错误边界组件
 * 
 * 捕获子组件错误并显示友好的错误信息
 */

import React from 'react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="flex min-h-[400px] items-center justify-center p-4">
          <div className="w-full max-w-md">
            <Alert variant="destructive">
              <AlertTitle>出错了</AlertTitle>
              <AlertDescription className="mt-2">
                {this.state.error?.message || '发生了一个未知错误'}
              </AlertDescription>
              <Button
                onClick={() => this.setState({ hasError: false })}
                variant="outline"
                size="sm"
                className="mt-4"
              >
                重试
              </Button>
            </Alert>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}


