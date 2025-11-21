# 测试框架使用指南

本项目使用 Vitest、@testing-library/react 和 fast-check 进行测试。

## 测试框架

- **Vitest**: 快速的单元测试框架，与 Vite 深度集成
- **@testing-library/react**: React 组件测试库
- **fast-check**: 属性测试（Property-Based Testing）库

## 运行测试

```bash
# 运行所有测试
pnpm test

# 运行测试（单次，不监听）
pnpm test:run

# 运行测试并生成覆盖率报告
pnpm test:coverage

# 运行特定测试文件
pnpm test:run src/components/ui/Button.test.tsx

# 监听模式（开发时使用）
pnpm test
```

## 测试覆盖率

测试覆盖率目标：
- 行覆盖率：≥ 80%
- 函数覆盖率：≥ 80%
- 分支覆盖率：≥ 80%
- 语句覆盖率：≥ 80%

覆盖率报告会生成在 `coverage/` 目录下，可以打开 `coverage/index.html` 查看详细报告。

## 测试文件组织

```
src/
├── test/
│   ├── setup.ts          # 测试环境设置
│   ├── utils.tsx         # 测试工具函数
│   ├── generators.ts     # Property-Based Testing 生成器
│   └── README.md         # 本文档
├── components/
│   └── ui/
│       ├── Button.tsx
│       └── Button.test.tsx  # 组件测试
└── lib/
    ├── api/
    │   ├── client.ts
    │   └── client.test.ts   # API 客户端测试
    └── utils/
        ├── helpers.ts
        └── helpers.test.ts  # 工具函数测试
```

## 编写单元测试

### 基础组件测试

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/utils';
import { Button } from './Button';

describe('Button', () => {
    it('应该渲染按钮文本', () => {
        render(<Button>Click me</Button>);
        expect(screen.getByText('Click me')).toBeInTheDocument();
    });

    it('应该响应点击事件', async () => {
        const handleClick = vi.fn();
        const { user } = render(<Button onClick={handleClick}>Click</Button>);
        
        await user.click(screen.getByText('Click'));
        expect(handleClick).toHaveBeenCalledTimes(1);
    });
});
```

### API 测试

```typescript
import { describe, it, expect, vi } from 'vitest';
import axios from 'axios';
import { apiClient } from './client';

vi.mock('axios');

describe('API Client', () => {
    it('应该发送 GET 请求', async () => {
        const mockData = { id: 1, name: 'Test' };
        vi.mocked(axios.get).mockResolvedValue({ data: mockData });

        const result = await apiClient.get('/test');
        expect(result).toEqual(mockData);
    });
});
```

## 编写属性测试

属性测试用于验证代码在大量随机输入下的正确性。

### 基础属性测试

```typescript
import { describe, it } from 'vitest';
import * as fc from 'fast-check';
import { arbitraries } from '@/test/generators';

describe('Property Tests', () => {
    it('应该满足某个属性', () => {
        fc.assert(
            fc.property(
                arbitraries.nonEmptyString,
                (str) => {
                    // 测试属性：非空字符串的长度总是大于 0
                    return str.length > 0;
                }
            ),
            { numRuns: 100 } // 运行 100 次
        );
    });
});
```

### 使用自定义生成器

```typescript
import { generators } from '@/test/generators';

describe('User Item Properties', () => {
    it('创建的用户项目应该有有效的 ID', () => {
        fc.assert(
            fc.property(
                generators.userItem(),
                (item) => {
                    return typeof item.id === 'string' && item.id.length > 0;
                }
            )
        );
    });
});
```

### 复杂属性测试示例

```typescript
/**
 * Property: API Response Caching
 * 对于任何 API 端点，在缓存有效期内多次调用应该返回相同的结果
 */
it('应该缓存 API 响应', () => {
    fc.assert(
        fc.property(
            arbitraries.nonEmptyString, // endpoint
            fc.jsonValue(),             // params
            async (endpoint, params) => {
                const key = `${endpoint}:${JSON.stringify(params)}`;
                
                // 第一次调用
                const result1 = await fetchWithCache(endpoint, params);
                
                // 第二次调用（应该从缓存返回）
                const result2 = await fetchWithCache(endpoint, params);
                
                // 验证结果相同
                return JSON.stringify(result1) === JSON.stringify(result2);
            }
        )
    );
});
```

## 可用的生成器

### 基础类型生成器 (arbitraries)

- `nonEmptyString`: 非空字符串
- `email`: 邮箱地址
- `url`: URL
- `positiveInteger`: 正整数
- `nonNegativeInteger`: 非负整数
- `rating`: 评分 (0-10)
- `isoDateString`: ISO 8601 日期字符串
- `username`: 用户名
- `password`: 密码
- `tags`: 标签数组
- `itemType`: 内容类型
- `status`: 状态
- `userRole`: 用户角色

### 复杂对象生成器 (generators)

- `user()`: 生成用户对象
- `userItem()`: 生成用户项目对象
- `apiError()`: 生成 API 错误对象
- `envConfig()`: 生成环境变量配置

### 约束生成器 (constrained)

- `touchTargetSize`: 触摸目标尺寸 (≥44x44px)
- `breakpoint`: 响应式断点
- `viewportWidth`: 视口宽度
- `themeMode`: 主题模式
- `cacheKey`: 缓存键

## 测试工具函数

### renderWithProviders

自动包含必要的 Provider（ThemeProvider、CssBaseline）的渲染函数：

```typescript
import { render } from '@/test/utils';

const { container } = render(<MyComponent />);
```

## Mock 配置

测试环境已经预配置了以下 Mock：

- `window.matchMedia`: 用于响应式测试
- `IntersectionObserver`: 用于懒加载测试
- `ResizeObserver`: 用于响应式组件测试
- `window.scrollTo`: 用于滚动测试

## 环境变量

测试环境中的环境变量：

```typescript
process.env.NEXT_PUBLIC_API_URL = 'http://localhost:8000/api'
```

## 最佳实践

1. **测试行为，而非实现**：测试组件的输出和用户交互，而不是内部实现细节
2. **使用语义化查询**：优先使用 `getByRole`、`getByLabelText` 等语义化查询
3. **避免过度 Mock**：只 Mock 外部依赖，不要 Mock 被测试的代码
4. **编写可读的测试**：使用清晰的测试描述和断言消息
5. **属性测试配置**：每个属性测试至少运行 100 次迭代
6. **测试覆盖率**：保持 80% 以上的测试覆盖率

## 调试测试

```bash
# 使用 --reporter=verbose 查看详细输出
pnpm test:run --reporter=verbose

# 使用 --ui 启动 Vitest UI
pnpm test --ui

# 只运行失败的测试
pnpm test:run --changed
```

## 参考资源

- [Vitest 文档](https://vitest.dev/)
- [Testing Library 文档](https://testing-library.com/docs/react-testing-library/intro/)
- [fast-check 文档](https://fast-check.dev/)
