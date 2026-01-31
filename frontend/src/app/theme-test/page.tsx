"use client"

import { AnimatedThemeToggler } from '@/components/ui/animated-theme-toggler';
import { useUiStore } from '@/stores/uiStore';

/**
 * 主题测试页面
 * 
 * 用于验证主题切换和持久化功能
 * 验证需求: 10.1, 10.2, 10.6, 10.7, 14.1, 14.2, 14.3
 */
export default function ThemeTestPage() {
  const { theme, setTheme, toggleTheme } = useUiStore();

  return (
    <div className="min-h-screen bg-[var(--color-background-default)] p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* 页面标题 */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-[var(--color-text-primary)] mb-2">
            主题系统测试
          </h1>
          <p className="text-[var(--color-text-secondary)]">
            验证主题切换、持久化和 CSS 变量更新功能
          </p>
        </div>

        {/* 当前主题状态 */}
        <div className="bg-[var(--color-background-paper)] rounded-[var(--radius-lg)] p-6 shadow-[var(--shadow-md)]">
          <h2 className="text-2xl font-semibold text-[var(--color-text-primary)] mb-4">
            当前主题状态
          </h2>
          <div className="space-y-2">
            <p className="text-[var(--color-text-primary)]">
              <span className="font-medium">主题模式：</span>
              <span className="ml-2 px-3 py-1 rounded-full bg-[var(--color-primary)] text-white">
                {theme === 'dark' ? '暗色模式' : '亮色模式'}
              </span>
            </p>
            <p className="text-[var(--color-text-secondary)] text-sm">
              主题状态已保存到 localStorage，刷新页面后会自动恢复
            </p>
          </div>
        </div>

        {/* 主题切换控制 */}
        <div className="bg-[var(--color-background-paper)] rounded-[var(--radius-lg)] p-6 shadow-[var(--shadow-md)]">
          <h2 className="text-2xl font-semibold text-[var(--color-text-primary)] mb-4">
            主题切换控制
          </h2>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={toggleTheme}
              className="px-6 py-3 rounded-[var(--radius-md)] bg-[var(--color-primary)] text-white hover:opacity-90 transition-opacity"
            >
              切换主题
            </button>
            <button
              onClick={() => setTheme('light')}
              className="px-6 py-3 rounded-[var(--radius-md)] bg-[var(--color-background-elevated)] text-[var(--color-text-primary)] border border-[var(--color-text-disabled)] hover:bg-[var(--color-background-paper)] transition-colors"
            >
              设置为亮色
            </button>
            <button
              onClick={() => setTheme('dark')}
              className="px-6 py-3 rounded-[var(--radius-md)] bg-[var(--color-background-elevated)] text-[var(--color-text-primary)] border border-[var(--color-text-disabled)] hover:bg-[var(--color-background-paper)] transition-colors"
            >
              设置为暗色
            </button>
            <AnimatedThemeToggler className="ml-auto" />
          </div>
        </div>

        {/* CSS 变量展示 */}
        <div className="bg-[var(--color-background-paper)] rounded-[var(--radius-lg)] p-6 shadow-[var(--shadow-md)]">
          <h2 className="text-2xl font-semibold text-[var(--color-text-primary)] mb-4">
            设计 Token 展示
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 颜色 Token */}
            <div className="space-y-3">
              <h3 className="font-medium text-[var(--color-text-primary)]">颜色系统</h3>
              <div className="space-y-2">
                <ColorSwatch label="Primary" color="var(--color-primary)" />
                <ColorSwatch label="Secondary" color="var(--color-secondary)" />
                <ColorSwatch label="Success" color="var(--color-success)" />
                <ColorSwatch label="Warning" color="var(--color-warning)" />
                <ColorSwatch label="Error" color="var(--color-error)" />
              </div>
            </div>

            {/* 背景颜色 */}
            <div className="space-y-3">
              <h3 className="font-medium text-[var(--color-text-primary)]">背景颜色</h3>
              <div className="space-y-2">
                <ColorSwatch label="Default" color="var(--color-background-default)" />
                <ColorSwatch label="Paper" color="var(--color-background-paper)" />
                <ColorSwatch label="Elevated" color="var(--color-background-elevated)" />
              </div>
            </div>

            {/* 文本颜色 */}
            <div className="space-y-3">
              <h3 className="font-medium text-[var(--color-text-primary)]">文本颜色</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-[var(--color-text-primary)]">Primary Text</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[var(--color-text-secondary)]">Secondary Text</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[var(--color-text-disabled)]">Disabled Text</span>
                </div>
              </div>
            </div>

            {/* 阴影效果 */}
            <div className="space-y-3">
              <h3 className="font-medium text-[var(--color-text-primary)]">阴影效果</h3>
              <div className="space-y-3">
                <div className="p-3 bg-[var(--color-background-elevated)] rounded-[var(--radius-md)] shadow-[var(--shadow-sm)]">
                  Small Shadow
                </div>
                <div className="p-3 bg-[var(--color-background-elevated)] rounded-[var(--radius-md)] shadow-[var(--shadow-md)]">
                  Medium Shadow
                </div>
                <div className="p-3 bg-[var(--color-background-elevated)] rounded-[var(--radius-md)] shadow-[var(--shadow-lg)]">
                  Large Shadow
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 测试说明 */}
        <div className="bg-[var(--color-background-paper)] rounded-[var(--radius-lg)] p-6 shadow-[var(--shadow-md)]">
          <h2 className="text-2xl font-semibold text-[var(--color-text-primary)] mb-4">
            测试清单
          </h2>
          <ul className="space-y-2 text-[var(--color-text-primary)]">
            <li className="flex items-start gap-2">
              <span className="text-[var(--color-success)]">✓</span>
              <span>点击"切换主题"按钮，观察页面颜色是否平滑切换</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--color-success)]">✓</span>
              <span>切换主题后刷新页面，主题应该保持不变</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--color-success)]">✓</span>
              <span>打开浏览器开发者工具，检查 localStorage 中的 'ui-storage' 键</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--color-success)]">✓</span>
              <span>清除 localStorage，刷新页面，主题应该跟随系统偏好</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--color-success)]">✓</span>
              <span>观察所有 CSS 变量（颜色、阴影）是否正确更新</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--color-success)]">✓</span>
              <span>使用 AnimatedThemeToggler 组件，观察动画效果</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

/**
 * 颜色样本组件
 */
function ColorSwatch({ label, color }: { label: string; color: string }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="w-12 h-12 rounded-[var(--radius-sm)] border border-[var(--color-text-disabled)]"
        style={{ backgroundColor: `var(${color})` }}
      />
      <div>
        <p className="text-sm font-medium text-[var(--color-text-primary)]">{label}</p>
        <p className="text-xs text-[var(--color-text-secondary)]">{color}</p>
      </div>
    </div>
  );
}
