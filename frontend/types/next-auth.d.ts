/**
 * NextAuth 类型扩展
 */

import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
    } & DefaultSession['user']
    accessToken: string
    refreshToken: string
  }

  interface User {
    accessToken?: string
    refreshToken?: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    accessToken: string
    refreshToken: string
  }
}

