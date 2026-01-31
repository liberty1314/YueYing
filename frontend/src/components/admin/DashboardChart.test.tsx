/**
 * DashboardChart 组件单元测试
 * 
 * 测试图表组件的渲染、数据展示和交互功能
 * 
 * 注意：Recharts 在测试环境中需要 ResizeObserver mock
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DashboardChart } from './DashboardChart';

// Mock ResizeObserver for Recharts
beforeAll(() => {
  global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

describe('DashboardChart', () => {
  const mockData = [
    { date: '2024-01', value: 100 },
    { date: '2024-02', value: 150 },
    { date: '2024-03', value: 200 },
  ];

  describe('基本渲染', () => {
    it('应该渲染图表标题', () => {
      render(
        <DashboardChart
          title="测试图表"
          data={mockData}
          type="line"
          xAxisKey="date"
          yAxisKey="value"
        />
      );

      expect(screen.getByText('测试图表')).toBeInTheDocument();
    });

    it('应该渲染折线图容器', () => {
      const { container } = render(
        <DashboardChart
          title="折线图"
          data={mockData}
          type="line"
          xAxisKey="date"
          yAxisKey="value"
        />
      );

      // 检查 ResponsiveContainer 是否存在
      const responsiveContainer = container.querySelector('.recharts-responsive-container');
      expect(responsiveContainer).toBeInTheDocument();
    });

    it('应该渲染柱状图容器', () => {
      const { container } = render(
        <DashboardChart
          title="柱状图"
          data={mockData}
          type="bar"
          xAxisKey="date"
          yAxisKey="value"
        />
      );

      const responsiveContainer = container.querySelector('.recharts-responsive-container');
      expect(responsiveContainer).toBeInTheDocument();
    });

    it('应该渲染面积图容器', () => {
      const { container } = render(
        <DashboardChart
          title="面积图"
          data={mockData}
          type="area"
          xAxisKey="date"
          yAxisKey="value"
        />
      );

      const responsiveContainer = container.querySelector('.recharts-responsive-container');
      expect(responsiveContainer).toBeInTheDocument();
    });
  });

  describe('加载状态', () => {
    it('应该在加载时显示骨架屏', () => {
      const { container } = render(
        <DashboardChart
          title="加载中"
          data={mockData}
          type="line"
          xAxisKey="date"
          yAxisKey="value"
          loading={true}
        />
      );

      // 骨架屏应该包含动画类
      const skeleton = container.querySelector('.animate-pulse');
      expect(skeleton).toBeInTheDocument();
    });

    it('加载完成后应该显示图表', () => {
      const { container, rerender } = render(
        <DashboardChart
          title="测试图表"
          data={mockData}
          type="line"
          xAxisKey="date"
          yAxisKey="value"
          loading={true}
        />
      );

      // 初始状态：骨架屏
      expect(container.querySelector('.animate-pulse')).toBeInTheDocument();

      // 加载完成：图表
      rerender(
        <DashboardChart
          title="测试图表"
          data={mockData}
          type="line"
          xAxisKey="date"
          yAxisKey="value"
          loading={false}
        />
      );

      // 检查 ResponsiveContainer 是否存在
      expect(container.querySelector('.recharts-responsive-container')).toBeInTheDocument();
      expect(container.querySelector('.animate-pulse')).not.toBeInTheDocument();
    });
  });

  describe('空数据状态', () => {
    it('应该在数据为空时显示提示', () => {
      render(
        <DashboardChart
          title="空数据图表"
          data={[]}
          type="line"
          xAxisKey="date"
          yAxisKey="value"
        />
      );

      expect(screen.getByText('暂无数据')).toBeInTheDocument();
    });

    it('应该在数据为 undefined 时显示提示', () => {
      render(
        <DashboardChart
          title="空数据图表"
          data={undefined as any}
          type="line"
          xAxisKey="date"
          yAxisKey="value"
        />
      );

      expect(screen.getByText('暂无数据')).toBeInTheDocument();
    });
  });

  describe('样式和类名', () => {
    it('应该应用自定义类名', () => {
      const { container } = render(
        <DashboardChart
          title="自定义样式"
          data={mockData}
          type="line"
          xAxisKey="date"
          yAxisKey="value"
          className="custom-class"
        />
      );

      const card = container.firstChild;
      expect(card).toHaveClass('custom-class');
    });

    it('应该包含 Apple 风格的设计类', () => {
      const { container } = render(
        <DashboardChart
          title="Apple 风格"
          data={mockData}
          type="line"
          xAxisKey="date"
          yAxisKey="value"
        />
      );

      const card = container.firstChild;
      expect(card).toHaveClass('backdrop-blur-xl');
      expect(card).toHaveClass('rounded-[var(--radius-lg)]');
    });
  });

  describe('数据展示', () => {
    it('应该正确处理不同的数据键', () => {
      const customData = [
        { month: 'Jan', count: 10 },
        { month: 'Feb', count: 20 },
      ];

      const { container } = render(
        <DashboardChart
          title="自定义键"
          data={customData}
          type="line"
          xAxisKey="month"
          yAxisKey="count"
        />
      );

      // 检查图表容器是否存在
      expect(container.querySelector('.recharts-responsive-container')).toBeInTheDocument();
    });

    it('应该处理大数字数据', () => {
      const largeData = [
        { date: '2024-01', value: 1500000 },
        { date: '2024-02', value: 2500000 },
      ];

      const { container } = render(
        <DashboardChart
          title="大数字"
          data={largeData}
          type="bar"
          xAxisKey="date"
          yAxisKey="value"
        />
      );

      // Y 轴应该格式化大数字（如 1.5M）
      expect(container.querySelector('.recharts-responsive-container')).toBeInTheDocument();
    });
  });

  describe('响应式', () => {
    it('应该使用 ResponsiveContainer', () => {
      const { container } = render(
        <DashboardChart
          title="响应式图表"
          data={mockData}
          type="line"
          xAxisKey="date"
          yAxisKey="value"
        />
      );

      // ResponsiveContainer 会创建一个包含 SVG 的容器
      const responsiveContainer = container.querySelector('.recharts-responsive-container');
      expect(responsiveContainer).toBeInTheDocument();
    });
  });
});
