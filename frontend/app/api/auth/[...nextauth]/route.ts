/**
 * NextAuth.js API 路由
 */

import NextAuth, { AuthOptions, User } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { login, getCurrentUser } from '@/lib/auth-api'

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('请输入邮箱和密码')
        }

        try {
          // 调用后端登录 API
          const tokenResponse = await login({
            email: credentials.email,
            password: credentials.password,
          })

          // 获取用户信息
          const user = await getCurrentUser(tokenResponse.access_token)

          // 返回用户信息和 tokens
          return {
            id: user.id.toString(),
            email: user.email,
            name: user.username,
            image: user.avatar_url,
            accessToken: tokenResponse.access_token,
            refreshToken: tokenResponse.refresh_token,
          } as User & { accessToken: string; refreshToken: string }
        } catch (error: any) {
          console.error('登录失败:', error)
          throw new Error(error.response?.data?.detail || '登录失败')
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // 首次登录时，将 tokens 添加到 JWT
      if (user) {
        token.accessToken = (user as any).accessToken
        token.refreshToken = (user as any).refreshToken
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      // 将 token 中的信息添加到 session
      if (token) {
        session.user.id = token.id as string
        session.accessToken = token.accessToken as string
        session.refreshToken = token.refreshToken as string
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 天
  },
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }

