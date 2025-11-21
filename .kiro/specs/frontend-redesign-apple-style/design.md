# Design Document

## Overview

本设计文档描述了 YueYing 前端应用的完全重构方案。新前端将采用 Next.js 15、Material-UI v6、Tailwind CSS 和 GSAP 构建，实现 Apple 风格的现代化设计美学。

### 设计目标

1. **现代化技术栈**: 使用最新的 Next.js 15 App Router、React 18 和 TypeScript
2. **Apple 风格美学**: 极简主义、高端品质、流畅动画
3. **性能优化**: 快速加载、流畅交互、优秀的 Lighthouse 评分
4. **开发体验**: 清晰的代码组织、类型安全、可维护性
5. **无缝迁移**: 保留所有现有功能，确保用户体验连续性

### 技术选型理由

- **Next.js 15**: 最新的 React 框架，提供 App Router、Server Components、优化的图片处理
- **Material-UI v6**: 成熟的组件库，提供丰富的基础组件和主题系统
- **Tailwind CSS**: 原子化 CSS，快速开发，与 MUI 互补
- **GSAP**: 业界领先的动画库，性能优异，适合实现 Apple 风格的流畅动画
- **Zustand**: 轻量级状态管理，简单易用，TypeScript 友好
- **pnpm**: 快速、节省磁盘空间的包管理器

## Architecture

### 整体架构

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              Next.js Frontend (Port 3000)             │  │
│  │  ┌─────────────┐  ┌──────────────┐  ┌─────────────┐  │  │
│  │  │   Pages     │  │  Components  │  │   Stores    │  │  │
│  │  │ (App Router)│  │  (MUI+Custom)│  │  (Zustand)  │  │  │
│  │  └─────────────┘  └──────────────┘  └─────────────┘  │  │
│  │  ┌─────────────┐  ┌──────────────┐  ┌─────────────┐  │  │
│  │  │  API Client │  │    Styles    │  │  Animations │  │  │
│  │  │   (Axios)   │  │ (MUI+Tailwind│  │   (GSAP)    │  │  │
│  │  └─────────────┘  └──────────────┘  └─────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTP/WebSocket
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              FastAPI Backend (Port 8000)                     │
│                    (Existing Service)                        │
└─────────────────────────────────────────────────────────────┘
```

### 目录结构

```
frontend/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── layout.tsx           # Root layout
│   │   ├── page.tsx             # Home page
│   │   ├── providers.tsx        # Context providers
│   │   ├── globals.css          # Global styles
│   │   ├── (auth)/              # Auth route group
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── library/             # User library
│   │   ├── explore/             # Search and explore
│   │   ├── discover/            # Recommendations
│   │   ├── stats/               # Statistics
│   │   ├── assistant/           # AI assistant
│   │   ├── settings/            # User settings
│   │   └── admin/               # Admin dashboard
│   │
│   ├── components/              # React components
│   │   ├── ui/                  # Base UI components (MUI-based)
│   │   ├── layout/              # Layout components
│   │   ├── features/            # Feature-specific components
│   │   └── shared/              # Shared components
│   │
│   ├── lib/                     # Utilities and helpers
│   │   ├── api/                 # API client
│   │   ├── theme/               # MUI theme configuration
│   │   ├── animations/          # GSAP animation utilities
│   │   └── utils/               # Helper functions
│   │
│   ├── hooks/                   # Custom React hooks
│   ├── stores/                  # Zustand stores
│   ├── types/                   # TypeScript types
│   └── styles/                  # Global styles and Tailwind config
│
├── public/                      # Static assets
├── .env.example                 # Environment variables template
├── next.config.js               # Next.js configuration
├── tailwind.config.ts           # Tailwind configuration
├── tsconfig.json                # TypeScript configuration
├── package.json                 # Dependencies
└── Dockerfile                   # Docker configuration
```

### 分层架构

1. **Presentation Layer (表现层)**
   - Pages: Next.js App Router 页面
   - Components: React 组件（UI + Feature）
   - Styles: MUI Theme + Tailwind CSS

2. **Business Logic Layer (业务逻辑层)**
   - Stores: Zustand 状态管理
   - Hooks: 自定义 React Hooks
   - Utils: 工具函数

3. **Data Access Layer (数据访问层)**
   - API Client: Axios 封装
   - WebSocket: 实时通信
   - Cache: 客户端缓存策略

## Components and Interfaces

### 核心组件系统

#### 1. Design System Components (设计系统组件)

基于 MUI 构建的基础组件库，遵循 Apple 风格设计原则：

```typescript
// src/components/ui/Button.tsx
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'ghost' | 'text';
  size: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  loading?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  onClick?: () => void;
  children: React.ReactNode;
}

// src/components/ui/Card.tsx
interface CardProps {
  variant: 'elevated' | 'outlined' | 'glass';
  padding?: 'none' | 'small' | 'medium' | 'large';
  hover?: boolean;
  children: React.ReactNode;
}

// src/components/ui/Input.tsx
interface InputProps {
  label?: string;
  placeholder?: string;
  type?: 'text' | 'email' | 'password' | 'number';
  error?: string;
  helperText?: string;
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
  fullWidth?: boolean;
}
```

#### 2. Layout Components (布局组件)

```typescript
// src/components/layout/AppLayout.tsx
interface AppLayoutProps {
  children: React.ReactNode;
  showNavbar?: boolean;
  showSidebar?: boolean;
}

// src/components/layout/Navbar.tsx
interface NavbarProps {
  transparent?: boolean;
  sticky?: boolean;
}

// src/components/layout/Sidebar.tsx
interface SidebarProps {
  open: boolean;
  onClose: () => void;
  items: NavItem[];
}
```

#### 3. Feature Components (功能组件)

```typescript
// src/components/features/library/ItemCard.tsx
interface ItemCardProps {
  item: UserItem;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onView: (id: string) => void;
}

// src/components/features/search/SearchBar.tsx
interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  filters?: SearchFilter[];
}

// src/components/features/stats/Chart.tsx
interface ChartProps {
  data: ChartData[];
  type: 'line' | 'bar' | 'pie' | 'area';
  height?: number;
}
```

### API Client 接口

```typescript
// src/lib/api/client.ts
interface ApiClient {
  get<T>(url: string, config?: RequestConfig): Promise<T>;
  post<T>(url: string, data?: any, config?: RequestConfig): Promise<T>;
  put<T>(url: string, data?: any, config?: RequestConfig): Promise<T>;
  delete<T>(url: string, config?: RequestConfig): Promise<T>;
}

// src/lib/api/endpoints.ts
interface UserItemsApi {
  getAll(params: GetAllParams): Promise<UserItem[]>;
  getById(id: string): Promise<UserItem>;
  create(data: CreateUserItemDto): Promise<UserItem>;
  update(id: string, data: UpdateUserItemDto): Promise<UserItem>;
  delete(id: string): Promise<void>;
}

interface AuthApi {
  login(credentials: LoginDto): Promise<AuthResponse>;
  register(data: RegisterDto): Promise<AuthResponse>;
  logout(): Promise<void>;
  refreshToken(): Promise<AuthResponse>;
}
```

### State Management 接口

```typescript
// src/stores/authStore.ts
interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (credentials: LoginDto) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
}

// src/stores/uiStore.ts
interface UiStore {
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
  loading: boolean;
  toggleTheme: () => void;
  toggleSidebar: () => void;
  setLoading: (loading: boolean) => void;
}

// src/stores/libraryStore.ts
interface LibraryStore {
  items: UserItem[];
  filters: LibraryFilters;
  sortBy: SortOption;
  viewMode: 'grid' | 'list';
  setFilters: (filters: LibraryFilters) => void;
  setSortBy: (sortBy: SortOption) => void;
  setViewMode: (mode: 'grid' | 'list') => void;
}
```

## Data Models

### 核心数据模型

```typescript
// src/types/user.ts
interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  role: 'user' | 'admin';
  createdAt: string;
  updatedAt: string;
}

// src/types/userItem.ts
interface UserItem {
  id: string;
  userId: string;
  itemType: 'movie' | 'tv' | 'anime' | 'game' | 'book';
  externalId: string;
  title: string;
  originalTitle?: string;
  description?: string;
  coverImage?: string;
  status: 'want' | 'in_progress' | 'completed';
  rating?: number;
  tags: string[];
  notes?: string;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

// src/types/stats.ts
interface UserStats {
  totalItems: number;
  byType: Record<ItemType, number>;
  byStatus: Record<ItemStatus, number>;
  averageRating: number;
  recentActivity: ActivityItem[];
  topTags: TagCount[];
}

// src/types/recommendation.ts
interface Recommendation {
  id: string;
  itemType: ItemType;
  externalId: string;
  title: string;
  coverImage?: string;
  score: number;
  reason: string;
}
```

### API 请求/响应模型

```typescript
// src/types/api.ts
interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

interface ApiError {
  message: string;
  code: string;
  details?: Record<string, any>;
}

// Request DTOs
interface LoginDto {
  username: string;
  password: string;
}

interface RegisterDto {
  username: string;
  email: string;
  password: string;
}

interface CreateUserItemDto {
  itemType: ItemType;
  externalId: string;
  title: string;
  status: ItemStatus;
  rating?: number;
  tags?: string[];
  notes?: string;
}

interface UpdateUserItemDto {
  status?: ItemStatus;
  rating?: number;
  tags?: string[];
  notes?: string;
  startDate?: string;
  endDate?: string;
}
```

### Theme 配置模型

```typescript
// src/lib/theme/types.ts
interface ThemeConfig {
  palette: {
    mode: 'light' | 'dark';
    primary: PaletteColor;
    secondary: PaletteColor;
    background: {
      default: string;
      paper: string;
      elevated: string;
    };
    text: {
      primary: string;
      secondary: string;
      disabled: string;
    };
  };
  typography: {
    fontFamily: string;
    fontSize: number;
    h1: TypographyStyle;
    h2: TypographyStyle;
    h3: TypographyStyle;
    body1: TypographyStyle;
    body2: TypographyStyle;
  };
  spacing: (factor: number) => string;
  borderRadius: {
    small: string;
    medium: string;
    large: string;
  };
  shadows: string[];
}

interface PaletteColor {
  main: string;
  light: string;
  dark: string;
  contrastText: string;
}
```


## MUI and Tailwind CSS Integration

### 样式系统架构

为了实现 MUI 和 Tailwind CSS 的和谐共存，我们采用以下策略：

#### 1. 职责分工

- **MUI**: 负责组件的基础结构、交互逻辑和主题系统
- **Tailwind CSS**: 负责快速布局、间距、响应式设计和自定义样式

#### 2. CSS 优先级解决方案

```typescript
// src/app/layout.tsx
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from '@/lib/theme';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <AppRouterCacheProvider options={{ enableCssLayer: true }}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            {children}
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
```

#### 3. Tailwind 配置

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  important: '#__next', // 提高 Tailwind 优先级
  theme: {
    extend: {
      colors: {
        // 与 MUI 主题同步的颜色
        primary: {
          main: '#007AFF',
          light: '#5AC8FA',
          dark: '#0051D5',
        },
        secondary: {
          main: '#5856D6',
          light: '#AF52DE',
          dark: '#3634A3',
        },
        background: {
          default: '#FFFFFF',
          paper: '#F5F5F7',
          elevated: '#FFFFFF',
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'sans-serif'],
      },
      borderRadius: {
        'apple': '12px',
        'apple-lg': '20px',
      },
      boxShadow: {
        'apple': '0 4px 16px rgba(0, 0, 0, 0.08)',
        'apple-lg': '0 8px 32px rgba(0, 0, 0, 0.12)',
      },
    },
  },
  plugins: [],
  corePlugins: {
    // 禁用与 MUI 冲突的插件
    preflight: false,
  },
};

export default config;
```

#### 4. MUI 主题配置

```typescript
// src/lib/theme/index.ts
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#007AFF',
      light: '#5AC8FA',
      dark: '#0051D5',
    },
    secondary: {
      main: '#5856D6',
      light: '#AF52DE',
      dark: '#3634A3',
    },
    background: {
      default: '#FFFFFF',
      paper: '#F5F5F7',
    },
    text: {
      primary: '#1D1D1F',
      secondary: '#86868B',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      'SF Pro Display',
      'Segoe UI',
      'Roboto',
      'sans-serif',
    ].join(','),
    h1: {
      fontSize: '3rem',
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontSize: '2.25rem',
      fontWeight: 600,
      lineHeight: 1.3,
      letterSpacing: '-0.01em',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 12,
          padding: '10px 20px',
          fontSize: '1rem',
          fontWeight: 500,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
        },
      },
    },
  },
});

export default theme;
```

### 使用指南

```tsx
// 组件中同时使用 MUI 和 Tailwind
import { Button } from '@mui/material';

export function MyComponent() {
  return (
    <div className="flex flex-col gap-4 p-6">
      {/* Tailwind 负责布局和间距 */}
      <Button 
        variant="contained" 
        className="w-full"
      >
        {/* MUI 负责组件样式 */}
        Click Me
      </Button>
    </div>
  );
}
```

## GSAP Animation System

### 动画架构

```typescript
// src/lib/animations/types.ts
interface AnimationConfig {
  duration?: number;
  ease?: string;
  delay?: number;
  stagger?: number;
}

interface ScrollAnimationConfig extends AnimationConfig {
  trigger: string | HTMLElement;
  start?: string;
  end?: string;
  scrub?: boolean;
  markers?: boolean;
}
```

### 核心动画工具

```typescript
// src/lib/animations/utils.ts
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// 淡入动画
export const fadeIn = (
  element: string | HTMLElement,
  config?: AnimationConfig
) => {
  return gsap.from(element, {
    opacity: 0,
    y: 20,
    duration: config?.duration || 0.6,
    ease: config?.ease || 'power2.out',
    delay: config?.delay || 0,
  });
};

// 滚动视差效果
export const parallax = (
  element: string | HTMLElement,
  config?: ScrollAnimationConfig
) => {
  return gsap.to(element, {
    y: -100,
    ease: 'none',
    scrollTrigger: {
      trigger: config?.trigger || element,
      start: config?.start || 'top bottom',
      end: config?.end || 'bottom top',
      scrub: config?.scrub !== false,
    },
  });
};

// 页面过渡动画
export const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3, ease: 'easeInOut' },
};

// 卡片悬停效果
export const cardHover = (element: HTMLElement) => {
  const tl = gsap.timeline({ paused: true });
  
  tl.to(element, {
    y: -8,
    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
    duration: 0.3,
    ease: 'power2.out',
  });
  
  return tl;
};
```

### React Hooks 集成

```typescript
// src/hooks/useGsapAnimation.ts
import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export function useGsapAnimation<T extends HTMLElement>(
  animationFn: (element: T) => gsap.core.Tween | gsap.core.Timeline,
  deps: any[] = []
) {
  const elementRef = useRef<T>(null);
  
  useEffect(() => {
    if (!elementRef.current) return;
    
    const animation = animationFn(elementRef.current);
    
    return () => {
      animation.kill();
    };
  }, deps);
  
  return elementRef;
}

// 使用示例
export function AnimatedCard() {
  const cardRef = useGsapAnimation<HTMLDivElement>(
    (element) => fadeIn(element, { duration: 0.8 })
  );
  
  return <div ref={cardRef}>Animated Content</div>;
}
```

### 性能优化

```typescript
// src/lib/animations/performance.ts

// 检测用户动画偏好
export const shouldReduceMotion = () => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// 条件性应用动画
export const applyAnimation = (
  element: HTMLElement,
  animation: () => gsap.core.Tween
) => {
  if (shouldReduceMotion()) {
    // 跳过动画，直接显示最终状态
    gsap.set(element, { opacity: 1, y: 0 });
    return null;
  }
  return animation();
};

// 优化滚动性能
export const optimizeScrollTrigger = () => {
  ScrollTrigger.config({
    limitCallbacks: true,
    syncInterval: 150,
  });
};
```

## Apple-Style Design System

### 设计原则

1. **极简主义 (Minimalism)**
   - 大量留白
   - 清晰的视觉层级
   - 简洁的界面元素

2. **现代感 (Modernity)**
   - 流畅的动画过渡
   - 毛玻璃效果 (Glassmorphism)
   - 柔和的阴影

3. **高端品质 (Premium Quality)**
   - 精致的排版
   - 高质量的图片
   - 细腻的交互反馈

### 颜色系统

```typescript
// src/lib/theme/colors.ts
export const appleColors = {
  light: {
    primary: '#007AFF',
    secondary: '#5856D6',
    success: '#34C759',
    warning: '#FF9500',
    error: '#FF3B30',
    background: {
      primary: '#FFFFFF',
      secondary: '#F5F5F7',
      tertiary: '#E5E5EA',
    },
    text: {
      primary: '#1D1D1F',
      secondary: '#86868B',
      tertiary: '#C7C7CC',
    },
  },
  dark: {
    primary: '#0A84FF',
    secondary: '#5E5CE6',
    success: '#30D158',
    warning: '#FF9F0A',
    error: '#FF453A',
    background: {
      primary: '#000000',
      secondary: '#1C1C1E',
      tertiary: '#2C2C2E',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#98989D',
      tertiary: '#48484A',
    },
  },
};
```

### 排版系统

```typescript
// src/lib/theme/typography.ts
export const appleTypography = {
  fontFamily: {
    display: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'sans-serif'],
    text: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Text', 'sans-serif'],
    mono: ['SF Mono', 'Monaco', 'Courier New', 'monospace'],
  },
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem',// 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem',    // 48px
    '6xl': '3.75rem', // 60px
  },
  fontWeight: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};
```

### 间距系统

```typescript
// src/lib/theme/spacing.ts
export const appleSpacing = {
  0: '0',
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px
  8: '2rem',      // 32px
  10: '2.5rem',   // 40px
  12: '3rem',     // 48px
  16: '4rem',     // 64px
  20: '5rem',     // 80px
  24: '6rem',     // 96px
};
```

### 组件样式指南

```typescript
// src/components/ui/AppleButton.tsx
import { Button as MuiButton, ButtonProps as MuiButtonProps } from '@mui/material';
import { styled } from '@mui/material/styles';

const AppleButton = styled(MuiButton)(({ theme, variant }) => ({
  borderRadius: 12,
  padding: '10px 20px',
  fontSize: '1rem',
  fontWeight: 500,
  textTransform: 'none',
  transition: 'all 0.2s ease',
  
  ...(variant === 'contained' && {
    background: 'linear-gradient(180deg, #007AFF 0%, #0051D5 100%)',
    boxShadow: '0 4px 16px rgba(0, 122, 255, 0.3)',
    '&:hover': {
      boxShadow: '0 6px 24px rgba(0, 122, 255, 0.4)',
      transform: 'translateY(-2px)',
    },
  }),
  
  ...(variant === 'outlined' && {
    borderWidth: 1.5,
    borderColor: theme.palette.primary.main,
    '&:hover': {
      backgroundColor: 'rgba(0, 122, 255, 0.05)',
      borderWidth: 1.5,
    },
  }),
}));

export default AppleButton;
```

```typescript
// src/components/ui/AppleCard.tsx
import { Card as MuiCard, CardProps as MuiCardProps } from '@mui/material';
import { styled } from '@mui/material/styles';

interface AppleCardProps extends MuiCardProps {
  variant?: 'elevated' | 'outlined' | 'glass';
}

const AppleCard = styled(MuiCard, {
  shouldForwardProp: (prop) => prop !== 'variant',
})<AppleCardProps>(({ theme, variant = 'elevated' }) => ({
  borderRadius: 16,
  transition: 'all 0.3s ease',
  
  ...(variant === 'elevated' && {
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
    '&:hover': {
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
      transform: 'translateY(-4px)',
    },
  }),
  
  ...(variant === 'glass' && {
    background: 'rgba(255, 255, 255, 0.7)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
  }),
}));

export default AppleCard;
```

## Docker Configuration

### Dockerfile 设计

```dockerfile
# ====================================
# Stage 1: Dependencies
# ====================================
FROM node:20-alpine AS deps

# 启用 corepack 并安装 pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# 复制依赖文件
COPY package.json pnpm-lock.yaml* ./

# 安装依赖
RUN pnpm install --frozen-lockfile

# ====================================
# Stage 2: Development
# ====================================
FROM node:20-alpine AS development

WORKDIR /app

# 启用 pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# 复制依赖
COPY --from=deps /app/node_modules ./node_modules

# 复制源代码
COPY . .

# 暴露端口
EXPOSE 3000

ENV PORT=3000 \
    NODE_ENV=development

# 开发命令
CMD ["pnpm", "run", "dev"]

# ====================================
# Stage 3: Builder
# ====================================
FROM node:20-alpine AS builder

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

# 复制依赖和源代码
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 构建环境变量
ENV NEXT_TELEMETRY_DISABLED=1 \
    NODE_ENV=production

# 构建应用
RUN pnpm run build

# ====================================
# Stage 4: Production
# ====================================
FROM node:20-alpine AS production

WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME="0.0.0.0"

# 创建非 root 用户
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# 复制构建产物
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["node", "server.js"]
```

### Docker Compose 集成

```yaml
# docker-compose.yml 中的前端服务配置
frontend:
  build:
    context: ./frontend
    dockerfile: Dockerfile
    target: development
  container_name: yueying-frontend
  restart: unless-stopped
  environment:
    API_URL: http://backend:8000/api
    NEXT_PUBLIC_API_URL: http://localhost:8000/api
    NODE_ENV: development
  ports:
    - "3000:3000"
  volumes:
    - ./frontend:/app
    - /app/node_modules
    - /app/.next
  depends_on:
    - backend
  networks:
    - yueying-network
  command: pnpm run dev
```

### 环境变量配置

```bash
# .env.example
# API Configuration
API_URL=http://backend:8000/api
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_WS_URL=ws://localhost:8000

# App Configuration
NODE_ENV=development
PORT=3000

# NextAuth (if used)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

基于需求分析，以下是可测试的正确性属性：

### Property 1: Environment Variable Configuration
*For any* API client request, the application should read the API URL from environment variables (API_URL for server-side, NEXT_PUBLIC_API_URL for client-side) rather than hardcoded values.
**Validates: Requirements 4.3**

### Property 2: API Error Handling Consistency
*For any* API request that fails, the application should handle the error gracefully by catching the exception, logging it appropriately, and displaying a user-friendly error message to the user.
**Validates: Requirements 4.5**

### Property 3: Theme Mode Switching
*For any* theme mode (light or dark), when the user toggles the theme, all components should immediately reflect the new theme colors and styles without requiring a page reload.
**Validates: Requirements 5.4**

### Property 4: API Response Caching
*For any* API endpoint that is called multiple times with the same parameters within a cache validity period, the application should return the cached response instead of making a new network request.
**Validates: Requirements 8.4**

### Property 5: Loading and Error State Consistency
*For any* data fetching operation, the application should consistently display a loading state while fetching, an error state if the request fails, and the data state when successful, following the same pattern across all components.
**Validates: Requirements 8.5**

### Property 6: Responsive Layout Adaptation
*For any* viewport width (mobile: <768px, tablet: 768-1024px, desktop: >1024px), the application should adapt the layout appropriately using the corresponding breakpoint styles without causing horizontal scrolling.
**Validates: Requirements 10.2, 10.4**

### Property 7: Touch Target Accessibility
*For any* interactive element (button, link, input) on mobile devices, the element should have a minimum touch target size of 44x44 pixels to ensure accessibility.
**Validates: Requirements 10.5**

### Property 8: Motion Preference Respect
*For any* animation, when the user's system has prefers-reduced-motion enabled, the application should either skip the animation or use a reduced, instant version of the animation.
**Validates: Requirements 11.5**

### Property 9: Authentication Feature Parity
*For any* authentication operation (login, register, logout, token refresh), the new frontend should provide the same functionality and API contract as the old frontend, ensuring users can authenticate successfully.
**Validates: Requirements 12.2**

### Property 10: CRUD Operations Feature Parity
*For any* user item CRUD operation (create, read, update, delete), the new frontend should provide the same functionality as the old frontend, maintaining data integrity and user workflows.
**Validates: Requirements 12.3**

### Property 11: Backend API Compatibility
*For any* API request made by the frontend, the request format (headers, body structure, query parameters) should match the contract expected by the existing Backend API.
**Validates: Requirements 12.4**

## Error Handling

### Error Handling Strategy

```typescript
// src/lib/api/errorHandler.ts
export class ApiError extends Error {
  constructor(
    public message: string,
    public code: string,
    public status: number,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const handleApiError = (error: any): ApiError => {
  if (error.response) {
    // 服务器返回错误响应
    return new ApiError(
      error.response.data.message || '请求失败',
      error.response.data.code || 'UNKNOWN_ERROR',
      error.response.status,
      error.response.data.details
    );
  } else if (error.request) {
    // 请求已发送但没有收到响应
    return new ApiError(
      '网络连接失败，请检查您的网络',
      'NETWORK_ERROR',
      0
    );
  } else {
    // 请求配置错误
    return new ApiError(
      error.message || '未知错误',
      'CLIENT_ERROR',
      0
    );
  }
};
```

### Error Display Components

```typescript
// src/components/ui/ErrorAlert.tsx
interface ErrorAlertProps {
  error: ApiError | Error;
  onRetry?: () => void;
  onDismiss?: () => void;
}

export function ErrorAlert({ error, onRetry, onDismiss }: ErrorAlertProps) {
  const isApiError = error instanceof ApiError;
  
  return (
    <Alert severity="error" onClose={onDismiss}>
      <AlertTitle>
        {isApiError ? error.message : '发生错误'}
      </AlertTitle>
      {isApiError && error.details && (
        <Typography variant="body2">
          {JSON.stringify(error.details)}
        </Typography>
      )}
      {onRetry && (
        <Button size="small" onClick={onRetry}>
          重试
        </Button>
      )}
    </Alert>
  );
}
```

### Global Error Boundary

```typescript
// src/components/ErrorBoundary.tsx
import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error caught by boundary:', error, errorInfo);
    // 可以发送到错误追踪服务
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">出错了</h1>
            <p className="text-gray-600 mb-4">
              {this.state.error?.message || '应用程序遇到了一个错误'}
            </p>
            <Button onClick={() => window.location.reload()}>
              刷新页面
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### Error Handling in API Client

```typescript
// src/lib/api/client.ts
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { handleApiError } from './errorHandler';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // 请求拦截器
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(handleApiError(error))
    );

    // 响应拦截器
    this.client.interceptors.response.use(
      (response) => response.data,
      (error) => {
        const apiError = handleApiError(error);
        
        // 401 错误自动跳转登录
        if (apiError.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
        
        return Promise.reject(apiError);
      }
    );
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      return await this.client.get<any, T>(url, config);
    } catch (error) {
      throw error;
    }
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      return await this.client.post<any, T>(url, data, config);
    } catch (error) {
      throw error;
    }
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      return await this.client.put<any, T>(url, data, config);
    } catch (error) {
      throw error;
    }
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      return await this.client.delete<any, T>(url, config);
    } catch (error) {
      throw error;
    }
  }
}

export const apiClient = new ApiClient();
```

## Testing Strategy

### 测试方法论

本项目采用双重测试策略：

1. **单元测试 (Unit Tests)**: 验证具体示例、边缘情况和错误条件
2. **属性测试 (Property-Based Tests)**: 验证应该在所有输入上成立的通用属性

两种测试方法互补：单元测试捕获具体的 bug，属性测试验证通用的正确性。

### 测试工具栈

- **测试框架**: Vitest (快速、与 Vite 集成良好)
- **React 测试**: @testing-library/react
- **属性测试**: fast-check
- **E2E 测试**: Playwright (可选)

### 单元测试示例

```typescript
// src/components/ui/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Button } from './Button';

describe('Button Component', () => {
  it('renders with correct text', () => {
    render(<Button>Click Me</Button>);
    expect(screen.getByText('Click Me')).toBeInTheDocument();
  });

  it('calls onClick handler when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click Me</Button>);
    fireEvent.click(screen.getByText('Click Me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('shows loading state', () => {
    render(<Button loading>Click Me</Button>);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('is disabled when loading', () => {
    render(<Button loading>Click Me</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

### 属性测试示例

```typescript
// src/lib/api/client.test.ts
import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { apiClient } from './client';

describe('API Client - Property Tests', () => {
  /**
   * Feature: frontend-redesign-apple-style, Property 1: Environment Variable Configuration
   * Validates: Requirements 4.3
   */
  it('should always read API URL from environment variables', () => {
    fc.assert(
      fc.property(
        fc.string(), // arbitrary endpoint
        (endpoint) => {
          const baseURL = apiClient['client'].defaults.baseURL;
          expect(baseURL).toBe(process.env.NEXT_PUBLIC_API_URL);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: frontend-redesign-apple-style, Property 2: API Error Handling Consistency
   * Validates: Requirements 4.5
   */
  it('should handle all API errors gracefully', async () => {
    fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 400, max: 599 }), // HTTP error codes
        fc.string(), // error message
        async (statusCode, message) => {
          // Mock API error response
          const mockError = {
            response: {
              status: statusCode,
              data: { message, code: 'TEST_ERROR' },
            },
          };

          try {
            throw mockError;
          } catch (error: any) {
            const handled = handleApiError(error);
            expect(handled).toBeInstanceOf(ApiError);
            expect(handled.message).toBeTruthy();
            expect(handled.status).toBe(statusCode);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

```typescript
// src/lib/theme/theme.test.ts
import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { createTheme } from '@mui/material/styles';
import { appleColors } from './colors';

describe('Theme System - Property Tests', () => {
  /**
   * Feature: frontend-redesign-apple-style, Property 3: Theme Mode Switching
   * Validates: Requirements 5.4
   */
  it('should provide valid colors for both light and dark modes', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('light', 'dark'),
        (mode) => {
          const theme = createTheme({
            palette: {
              mode,
              ...appleColors[mode],
            },
          });

          expect(theme.palette.mode).toBe(mode);
          expect(theme.palette.primary.main).toBeTruthy();
          expect(theme.palette.background.default).toBeTruthy();
          expect(theme.palette.text.primary).toBeTruthy();
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

```typescript
// src/components/ui/Button.test.tsx (Property Test)
import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { render } from '@testing-library/react';
import { Button } from './Button';

describe('Button Component - Property Tests', () => {
  /**
   * Feature: frontend-redesign-apple-style, Property 7: Touch Target Accessibility
   * Validates: Requirements 10.5
   */
  it('should have minimum 44x44px touch target on mobile', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('small', 'medium', 'large'),
        fc.string({ minLength: 1, maxLength: 20 }),
        (size, text) => {
          const { container } = render(
            <Button size={size}>{text}</Button>
          );
          
          const button = container.querySelector('button');
          const rect = button?.getBoundingClientRect();
          
          // On mobile viewport, ensure minimum touch target
          if (window.innerWidth < 768) {
            expect(rect?.width).toBeGreaterThanOrEqual(44);
            expect(rect?.height).toBeGreaterThanOrEqual(44);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### 测试配置

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.test.{ts,tsx}',
        '**/*.spec.{ts,tsx}',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

```typescript
// src/test/setup.ts
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// 每个测试后清理
afterEach(() => {
  cleanup();
});

// Mock environment variables
process.env.NEXT_PUBLIC_API_URL = 'http://localhost:8000/api';
process.env.API_URL = 'http://backend:8000/api';
```

### 测试覆盖率目标

- **整体代码覆盖率**: ≥ 80%
- **关键业务逻辑**: ≥ 90%
- **UI 组件**: ≥ 70%
- **工具函数**: ≥ 95%

### 持续集成

```yaml
# .github/workflows/test.yml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm run test
      - run: pnpm run test:coverage
      - uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
```

## Migration Strategy

### 阶段性迁移计划

#### Phase 1: 基础设施搭建 (Week 1-2)

1. **项目初始化**
   - 创建新的 Next.js 15 项目
   - 配置 TypeScript、ESLint、Prettier
   - 设置 Docker 环境
   - 配置环境变量

2. **技术栈集成**
   - 安装并配置 MUI v6
   - 集成 Tailwind CSS
   - 配置 GSAP
   - 设置 Zustand 状态管理

3. **基础组件开发**
   - 创建设计系统基础组件
   - 实现主题系统
   - 开发布局组件

#### Phase 2: 核心功能迁移 (Week 3-5)

1. **认证系统**
   - 登录/注册页面
   - Token 管理
   - 路由守卫

2. **用户库功能**
   - 列表展示
   - 筛选和排序
   - CRUD 操作

3. **搜索和发现**
   - 搜索界面
   - 外部 API 集成
   - 推荐系统

#### Phase 3: 高级功能 (Week 6-7)

1. **统计分析**
   - 数据可视化
   - AI 洞察

2. **AI 助手**
   - 对话界面
   - RAG 集成

3. **管理后台**
   - 用户管理
   - 系统配置

#### Phase 4: 优化和测试 (Week 8)

1. **性能优化**
   - 代码分割
   - 图片优化
   - 缓存策略

2. **测试**
   - 单元测试
   - 属性测试
   - E2E 测试

3. **文档**
   - 组件文档
   - API 文档
   - 部署文档

### 功能对照表

| 旧版功能 | 新版实现 | 优先级 | 状态 |
|---------|---------|--------|------|
| 用户认证 | /app/(auth) | P0 | 待开发 |
| 用户库 | /app/library | P0 | 待开发 |
| 搜索 | /app/explore | P0 | 待开发 |
| 推荐 | /app/discover | P1 | 待开发 |
| 统计 | /app/stats | P1 | 待开发 |
| AI 助手 | /app/assistant | P1 | 待开发 |
| 设置 | /app/settings | P2 | 待开发 |
| 管理后台 | /app/admin | P2 | 待开发 |

### 数据迁移

由于后端 API 保持不变，不需要数据迁移。新前端将直接使用现有的后端服务和数据库。

### 回滚策略

1. **保留旧版本**: frontend_old 目录保持完整，可随时回滚
2. **Docker 切换**: 通过修改 docker-compose.yml 中的 context 路径快速切换
3. **渐进式发布**: 使用 Nginx 配置实现 A/B 测试或金丝雀发布

## Performance Optimization

### 代码分割策略

```typescript
// src/app/library/page.tsx
import dynamic from 'next/dynamic';

// 动态导入重型组件
const LibraryGrid = dynamic(() => import('@/components/features/library/LibraryGrid'), {
  loading: () => <LibrarySkeleton />,
  ssr: false, // 客户端渲染
});

const FilterPanel = dynamic(() => import('@/components/features/library/FilterPanel'), {
  loading: () => <div>Loading filters...</div>,
});

export default function LibraryPage() {
  return (
    <div>
      <FilterPanel />
      <LibraryGrid />
    </div>
  );
}
```

### 图片优化

```typescript
// src/components/shared/OptimizedImage.tsx
import Image from 'next/image';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
}

export function OptimizedImage({ 
  src, 
  alt, 
  width = 300, 
  height = 450,
  priority = false 
}: OptimizedImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      priority={priority}
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRg..."
      quality={85}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
    />
  );
}
```

### 缓存策略

```typescript
// src/lib/cache/cacheManager.ts
interface CacheConfig {
  ttl: number; // Time to live in seconds
  key: string;
}

class CacheManager {
  private cache = new Map<string, { data: any; expiry: number }>();

  set(key: string, data: any, ttl: number) {
    const expiry = Date.now() + ttl * 1000;
    this.cache.set(key, { data, expiry });
  }

  get(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    if (Date.now() > cached.expiry) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  clear() {
    this.cache.clear();
  }
}

export const cacheManager = new CacheManager();
```

### 预加载策略

```typescript
// src/lib/prefetch/routePrefetch.ts
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function usePrefetchRoutes(routes: string[]) {
  const router = useRouter();

  useEffect(() => {
    routes.forEach((route) => {
      router.prefetch(route);
    });
  }, [routes, router]);
}

// 使用示例
export function HomePage() {
  usePrefetchRoutes(['/library', '/explore', '/discover']);
  
  return <div>Home Page</div>;
}
```

## Security Considerations

### XSS 防护

```typescript
// src/lib/security/sanitize.ts
import DOMPurify from 'isomorphic-dompurify';

export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    ALLOWED_ATTR: ['href', 'target'],
  });
}
```

### CSRF 防护

```typescript
// src/lib/api/client.ts
// 在 API 客户端中添加 CSRF token
this.client.interceptors.request.use((config) => {
  const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
  if (csrfToken) {
    config.headers['X-CSRF-Token'] = csrfToken;
  }
  return config;
});
```

### 敏感数据处理

```typescript
// src/lib/security/storage.ts
// 不在 localStorage 中存储敏感信息
// 使用 httpOnly cookies 存储 token（由后端设置）

export const secureStorage = {
  setItem(key: string, value: string) {
    // 仅存储非敏感数据
    if (key.includes('token') || key.includes('password')) {
      console.warn('Attempting to store sensitive data in localStorage');
      return;
    }
    localStorage.setItem(key, value);
  },
  
  getItem(key: string) {
    return localStorage.getItem(key);
  },
};
```

## Deployment

### 生产构建

```bash
# 构建生产版本
pnpm run build

# 启动生产服务器
pnpm run start
```

### Docker 部署

```bash
# 构建生产镜像
docker build -t yueying-frontend:latest --target production .

# 运行生产容器
docker run -d \
  -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=https://api.yueying.com \
  --name yueying-frontend \
  yueying-frontend:latest
```

### 环境变量管理

```bash
# 生产环境 .env.production
NEXT_PUBLIC_API_URL=https://api.yueying.com
NEXT_PUBLIC_WS_URL=wss://api.yueying.com
NODE_ENV=production
```

## Monitoring and Logging

### 错误监控

```typescript
// src/lib/monitoring/errorTracking.ts
export function trackError(error: Error, context?: Record<string, any>) {
  // 发送到错误追踪服务 (如 Sentry)
  console.error('Error tracked:', error, context);
  
  // 在生产环境中发送到监控服务
  if (process.env.NODE_ENV === 'production') {
    // Sentry.captureException(error, { extra: context });
  }
}
```

### 性能监控

```typescript
// src/lib/monitoring/performance.ts
export function trackPerformance(metric: string, value: number) {
  // 发送到性能监控服务
  console.log(`Performance metric: ${metric} = ${value}ms`);
  
  // 在生产环境中发送到监控服务
  if (process.env.NODE_ENV === 'production') {
    // Analytics.track(metric, value);
  }
}
```

## Conclusion

本设计文档详细描述了 YueYing 前端应用的完全重构方案。通过采用 Next.js 15、Material-UI v6、Tailwind CSS 和 GSAP，我们将构建一个具有 Apple 风格设计美学的现代化前端应用。

设计的核心原则包括：
- 极简主义和现代感的 UI 设计
- 流畅的动画和交互体验
- 优秀的性能和可访问性
- 清晰的代码组织和可维护性
- 完整的测试覆盖和错误处理

通过分阶段的迁移策略，我们将确保新前端保留所有现有功能，同时提供更好的用户体验和开发体验。
