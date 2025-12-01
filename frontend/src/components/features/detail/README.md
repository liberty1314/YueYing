# ExternalContentDialog 组件

## 概述

`ExternalContentDialog` 是一个参考苹果官网设计风格的资源详情弹窗组件，针对不同数据源提供差异化的UI布局。

## 设计特点

### 1. TMDB 完整布局
当内容来自 TMDB API（包含完整信息）时：
- **Hero 背景区域**：大尺寸背景图，带渐变遮罩
- **海报展示**：高质量海报，带阴影和边框效果
- **完整元信息**：年份、评分、类型、时长等，使用毛玻璃效果的 Chip
- **详细简介**：完整的内容描述
- **类型标签**：所有类型标签展示
- **流畅动画**：图片加载淡入、悬停效果

### 2. Bangumi 简化布局
当内容来自 Bangumi API（信息不完整）时：
- **紧凑布局**：更小的弹窗尺寸
- **简洁信息**：只显示可用的基本信息
- **优雅降级**：缺失字段不显示，不留空白
- **图标+文字**：使用图标增强可读性

## 使用方法

```tsx
import ExternalContentDialog from '@/components/features/detail/ExternalContentDialog';

function MyComponent() {
  const [open, setOpen] = useState(false);
  const [selectedContent, setSelectedContent] = useState(null);

  const handleAddToLibrary = (content) => {
    // 处理添加到收藏库的逻辑
    console.log('Adding to library:', content);
  };

  return (
    <>
      <button onClick={() => {
        setSelectedContent(someContent);
        setOpen(true);
      }}>
        查看详情
      </button>

      <ExternalContentDialog
        open={open}
        content={selectedContent}
        onClose={() => setOpen(false)}
        onAddToLibrary={handleAddToLibrary}
      />
    </>
  );
}
```

## Props

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `open` | `boolean` | 是 | 控制弹窗显示/隐藏 |
| `content` | `ExternalContent \| null` | 是 | 要显示的内容数据 |
| `onClose` | `() => void` | 是 | 关闭弹窗的回调 |
| `onAddToLibrary` | `(content: ExternalContent) => void` | 否 | 添加到收藏库的回调 |

## ExternalContent 类型

```typescript
interface ExternalContent {
  id: number | string;
  title?: string;
  name?: string;
  name_cn?: string;
  original_title?: string;
  original_name?: string;
  poster_path?: string;
  poster_url?: string;
  backdrop_path?: string;
  images?: {
    large?: string;
    common?: string;
    medium?: string;
  };
  overview?: string;
  summary?: string;
  vote_average?: number;
  rating?: {
    score?: number;
  };
  release_date?: string;
  first_air_date?: string;
  air_date?: string;
  media_type?: string;
  content_type?: string;
  genres?: Array<{ id: number; name: string }>;
  eps?: number;
  eps_count?: number;
  runtime?: number;
  source?: string;
}
```

## 设计原则

1. **自动识别数据源**：根据 `backdrop_path` 和 `overview` 的存在自动判断使用哪种布局
2. **优雅降级**：缺失的字段不显示，保持界面整洁
3. **流畅动画**：所有交互都有平滑的过渡效果
4. **响应式设计**：在不同屏幕尺寸下都有良好表现
5. **无障碍支持**：正确的语义化标签和键盘导航

## 已集成的组件

- `TrendingSection` - 热门趋势
- `CategoryRecommendations` - 分类推荐
- `AIRecommendations` - AI 推荐

## 样式特点

- 使用 Material-UI 的 `alpha` 函数实现半透明效果
- 毛玻璃效果（backdrop-filter: blur）
- 苹果风格的圆角和阴影
- 平滑的 cubic-bezier 动画曲线
- 深色/浅色模式自适应
