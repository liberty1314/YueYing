# 阅影·log 前端

基于 Next.js 14 的现代化前端应用，使用 shadcn/ui 组件库。

## 技术栈

- **框架**: Next.js 14 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **组件库**: shadcn/ui
- **状态管理**: Zustand
- **数据获取**: React Query
- **认证**: NextAuth.js
- **表单**: React Hook Form + Zod
- **图标**: Lucide Icons

## 已安装的 shadcn/ui 组件

### 基础组件
- ✅ Button - 按钮
- ✅ Input - 输入框
- ✅ Label - 标签
- ✅ Badge - 徽章
- ✅ Avatar - 头像

### 表单组件
- ✅ Form - 表单
- ✅ Select - 选择器
- ✅ Textarea - 文本域
- ✅ Checkbox - 复选框

### 布局组件
- ✅ Card - 卡片
- ✅ Separator - 分隔线
- ✅ Tabs - 标签页

### 反馈组件
- ✅ Dialog - 对话框
- ✅ Alert - 警告
- ✅ Toast - 提示
- ✅ Skeleton - 骨架屏

### 导航组件
- ✅ Dropdown Menu - 下拉菜单

### 自定义组件
- ✅ Loading - 加载指示器
- ✅ Empty - 空状态
- ✅ PageHeader - 页面头部
- ✅ Container - 容器
- ✅ ErrorBoundary - 错误边界

## 目录结构

```
frontend/
├── app/                    # Next.js App Router
│   ├── api/               # API 路由
│   ├── components/        # 组件展示页面
│   ├── login/             # 登录页面
│   ├── register/          # 注册页面
│   ├── layout.tsx         # 根布局
│   ├── page.tsx           # 首页
│   ├── providers.tsx      # Context Providers
│   └── globals.css        # 全局样式
├── components/            # React 组件
│   ├── ui/               # shadcn/ui 组件
│   ├── auth/             # 认证相关组件
│   └── common/           # 通用组件
├── lib/                  # 工具库
│   ├── api.ts           # API 客户端
│   ├── auth-api.ts      # 认证 API
│   └── utils.ts         # 工具函数
├── hooks/               # 自定义 Hooks
├── store/              # Zustand 状态管理
├── types/              # TypeScript 类型定义
└── config/             # 配置文件
```

## 开发命令

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm start

# 类型检查
npm run type-check

# 代码格式化
npm run format

# 运行测试
npm test

# 端到端测试
npm run test:e2e
```

## 组件使用示例

访问 http://localhost:3000/components 查看所有组件的使用示例。

### Button 按钮

```tsx
import { Button } from '@/components/ui/button'

<Button>默认按钮</Button>
<Button variant="secondary">次要按钮</Button>
<Button variant="destructive">危险按钮</Button>
<Button variant="outline">边框按钮</Button>
<Button size="sm">小按钮</Button>
```

### Card 卡片

```tsx
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'

<Card>
  <CardHeader>
    <CardTitle>卡片标题</CardTitle>
    <CardDescription>卡片描述</CardDescription>
  </CardHeader>
  <CardContent>
    卡片内容
  </CardContent>
  <CardFooter>
    卡片底部
  </CardFooter>
</Card>
```

### Form 表单

```tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'

const formSchema = z.object({
  username: z.string().min(2).max(50),
})

function MyForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  })

  return (
    <Form {...form}>
      <FormField
        control={form.control}
        name="username"
        render={({ field }) => (
          <FormItem>
            <FormLabel>用户名</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </Form>
  )
}
```

### Toast 提示

```tsx
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'

function MyComponent() {
  const { toast } = useToast()

  return (
    <Button
      onClick={() => {
        toast({
          title: '成功',
          description: '操作已完成',
        })
      }}
    >
      显示提示
    </Button>
  )
}
```

## 样式自定义

shadcn/ui 组件使用 CSS 变量进行主题定制，可在 `app/globals.css` 中修改：

```css
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --secondary: 210 40% 96.1%;
    /* ... 更多变量 */
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    /* ... 暗色模式变量 */
  }
}
```

## 环境变量

创建 `.env.local` 文件：

```bash
# API 配置
NEXT_PUBLIC_API_URL=http://localhost:8000/api

# NextAuth 配置
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here
```

## 部署

推荐使用 Vercel 进行部署：

```bash
# 安装 Vercel CLI
npm i -g vercel

# 部署
vercel
```

## 相关链接

- [Next.js 文档](https://nextjs.org/docs)
- [shadcn/ui 文档](https://ui.shadcn.com)
- [Tailwind CSS 文档](https://tailwindcss.com/docs)
- [React Hook Form 文档](https://react-hook-form.com)
- [Zod 文档](https://zod.dev)
