'use client'

/**
 * 用户菜单组件
 */

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'

export default function UserMenu() {
  const { data: session, status } = useSession()
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // 点击外部关闭菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (status === 'loading') {
    return (
      <div className="h-8 w-8 animate-pulse rounded-full bg-muted"></div>
    )
  }

  if (!session) {
    return (
      <div className="flex items-center space-x-4">
        <Link
          href="/login"
          className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          登录
        </Link>
        <Link
          href="/register"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          注册
        </Link>
      </div>
    )
  }

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' })
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      >
        {session.user?.image ? (
          <img
            src={session.user.image}
            alt={session.user.name || 'User'}
            className="h-8 w-8 rounded-full"
          />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
            {session.user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-md border border-border bg-background shadow-lg">
          <div className="px-4 py-3 border-b border-border">
            <p className="text-sm font-medium">{session.user?.name}</p>
            <p className="text-xs text-muted-foreground truncate">
              {session.user?.email}
            </p>
          </div>
          <div className="py-1">
            <Link
              href="/profile"
              className="block px-4 py-2 text-sm text-foreground hover:bg-muted"
              onClick={() => setIsOpen(false)}
            >
              个人资料
            </Link>
            <Link
              href="/settings"
              className="block px-4 py-2 text-sm text-foreground hover:bg-muted"
              onClick={() => setIsOpen(false)}
            >
              设置
            </Link>
            <button
              onClick={handleSignOut}
              className="block w-full px-4 py-2 text-left text-sm text-foreground hover:bg-muted"
            >
              退出登录
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

