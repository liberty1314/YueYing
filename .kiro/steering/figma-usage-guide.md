---
inclusion: manual
---

# Figma Power 使用指南

## 快速开始

### 1. 基本工作流程

当你有 Figma 设计需要转换为代码时，按照以下步骤操作：

#### 步骤 1: 获取 Figma URL
从 Figma 中复制设计节点的 URL，格式如下：
```
https://figma.com/design/ABC123/ProjectName?node-id=1-2
```

#### 步骤 2: 获取设计上下文
告诉 Kiro：
```
请帮我从这个 Figma 设计生成代码：
https://figma.com/design/ABC123/ProjectName?node-id=1-2
```

Kiro 会自动：
- 提取 fileKey (`ABC123`) 和 nodeId (`1:2`)
- 调用 `get_design_context` 工具
- 生成 React + Tailwind 代码
- 根据设计系统规则转换样式

#### 步骤 3: 审查和调整
Kiro 会：
- 识别可复用的现有组件
- 将 Tailwind 类替换为设计 token
- 确保符合项目的代码规范
- 支持暗色模式和响应式设计

### 2. 常用命令示例

#### 获取设计截图
```
请帮我获取这个 Figma 节点的截图：
https://figma.com/design/ABC123/ProjectName?node-id=1-2
```

#### 查看设计变量
```
请帮我提取这个 Figma 文件的设计变量（颜色、字体、间距等）：
https://figma.com/design/ABC123/ProjectName?node-id=1-2
```

#### 获取页面结构
```
请帮我查看这个 Figma 页面的结构概览：
https://figma.com/design/ABC123/ProjectName?node-id=0-1
```

#### 检查 Code Connect 映射
```
请检查这个 Figma 组件是否已经映射到代码库：
https://figma.com/design/ABC123/ProjectName?node-id=1-2
```

### 3. 实际使用场景

#### 场景 1: 创建新的 UI 组件
```
我需要根据这个 Figma 设计创建一个新的卡片组件：
https://figma.com/design/ABC123/ProjectName?node-id=10-20

请生成代码并保存到 frontend/src/components/ui/ProductCard.tsx
```

#### 场景 2: 更新现有组件
```
这个按钮组件需要更新以匹配新的 Figma 设计：
https://figma.com/design/ABC123/ProjectName?node-id=5-10

请更新 frontend/src/components/ui/AppleButton.tsx
```

#### 场景 3: 实现整个页面
```
请帮我实现这个 Figma 设计的整个页面：
https://figma.com/design/ABC123/ProjectName?node-id=100-1

页面应该包含：
- 响应式布局
- 暗色模式支持
- 使用现有的组件库
```

### 4. 自动化 Hook

项目已配置 `figma-code-connect` Hook，当你编辑组件文件时：

1. Hook 会自动触发
2. 询问是否需要连接到 Figma 组件
3. 如果同意，会检查 Code Connect 映射
4. 帮助维护设计和代码的同步

### 5. 最佳实践

#### ✅ 推荐做法

1. **提供完整的 Figma URL**
   - 包含 fileKey 和 node-id
   - 确保有访问权限

2. **明确说明需求**
   ```
   请从 Figma 生成代码，要求：
   - 使用 AppleCard 组件
   - 支持暗色模式
   - 添加加载状态
   ```

3. **验证视觉一致性**
   - 要求生成截图对比
   - 检查间距和颜色是否匹配

4. **复用现有组件**
   - 优先使用 ui/ 目录下的组件
   - 避免重复创建相似组件

#### ❌ 避免做法

1. 不要提供不完整的 URL
2. 不要跳过设计系统规则
3. 不要硬编码颜色和尺寸值
4. 不要忽略可访问性要求

### 6. 故障排除

#### 问题：无法访问 Figma 文件
**解决方案**：
- 确保已登录 Figma
- 检查文件访问权限
- 使用 `whoami` 工具验证身份

#### 问题：生成的代码不符合项目规范
**解决方案**：
- 检查 design-system.md 规则是否最新
- 明确告诉 Kiro 使用哪些组件
- 要求重新生成并遵循设计系统

#### 问题：样式与 Figma 不匹配
**解决方案**：
- 要求生成截图进行对比
- 检查设计 token 是否正确应用
- 调整间距和尺寸以匹配设计

### 7. 高级用法

#### 批量处理多个组件
```
请帮我从这个 Figma 页面生成所有组件：
https://figma.com/design/ABC123/ProjectName?node-id=0-1

首先获取页面结构，然后为每个主要组件生成代码。
```

#### 提取设计系统
```
请分析这个 Figma 文件的设计系统：
https://figma.com/design/ABC123/ProjectName

提取：
- 颜色变量
- 字体样式
- 间距系统
- 圆角规范

并更新 globals.css
```

#### 生成响应式布局
```
请从这个 Figma 设计生成响应式布局：
https://figma.com/design/ABC123/ProjectName?node-id=50-1

要求：
- 移动端：单列
- 平板：两列
- 桌面：三列
```

## 总结

Figma Power 让设计到代码的转换变得简单高效：

1. ✅ **设计系统规则已配置** - 自动遵循项目规范
2. ✅ **自动化 Hook 已启用** - 保持设计代码同步
3. ✅ **完整的工作流程** - 从设计到部署

现在你可以开始使用了！只需提供 Figma URL，Kiro 会处理其余的工作。

---

**提示**: 将此文档添加到聊天上下文中使用 `#figma-usage-guide.md`
