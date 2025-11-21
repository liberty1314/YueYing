import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ComponentsShowcase from './page';
import { ThemeProvider, createTheme } from '@mui/material/styles';

// 创建测试主题
const theme = createTheme();

// 包装组件以提供必要的上下文
const renderWithTheme = (component: React.ReactElement) => {
    return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

describe('ComponentsShowcase', () => {
    it('应该渲染页面标题', () => {
        renderWithTheme(<ComponentsShowcase />);
        expect(screen.getByText('设计系统组件库')).toBeInTheDocument();
    });

    it('应该渲染所有组件标签页', () => {
        renderWithTheme(<ComponentsShowcase />);
        expect(screen.getByText('按钮 (Button)')).toBeInTheDocument();
        expect(screen.getByText('卡片 (Card)')).toBeInTheDocument();
        expect(screen.getByText('输入框 (Input)')).toBeInTheDocument();
        expect(screen.getByText('加载 (Loading)')).toBeInTheDocument();
    });

    it('应该渲染按钮组件示例', () => {
        renderWithTheme(<ComponentsShowcase />);
        expect(screen.getByText('AppleButton 组件')).toBeInTheDocument();
        expect(screen.getByText('Primary Button')).toBeInTheDocument();
    });

    it('应该包含代码示例', () => {
        renderWithTheme(<ComponentsShowcase />);
        expect(screen.getByText('代码示例')).toBeInTheDocument();
    });
});
