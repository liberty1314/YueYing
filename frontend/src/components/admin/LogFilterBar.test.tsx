/**
 * LogFilterBar 组件单元测试
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LogFilterBar } from './LogFilterBar';
import { LogFilters } from '@/types/log';

describe('LogFilterBar', () => {
  const mockOnFiltersChange = vi.fn();
  const mockOnAutoRefreshChange = vi.fn();
  const mockOnRefreshIntervalChange = vi.fn();
  const mockOnRefresh = vi.fn();
  
  const defaultFilters: LogFilters = {
    start_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    end_date: new Date().toISOString(),
  };
  
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  describe('渲染测试', () => {
    it('应该渲染搜索框', () => {
      render(
        <LogFilterBar
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
        />
      );
      
      expect(screen.getByPlaceholderText('搜索日志消息...')).toBeInTheDocument();
    });
    
    it('应该渲染过滤按钮', () => {
      render(
        <LogFilterBar
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
        />
      );
      
      expect(screen.getByLabelText('切换高级过滤器')).toBeInTheDocument();
    });
    
    it('应该在提供 onRefresh 时渲染刷新按钮', () => {
      render(
        <LogFilterBar
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
          onRefresh={mockOnRefresh}
        />
      );
      
      expect(screen.getByLabelText('刷新日志')).toBeInTheDocument();
    });
    
    it('应该默认隐藏高级过滤器', () => {
      render(
        <LogFilterBar
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
        />
      );
      
      expect(screen.queryByText('日志级别')).not.toBeInTheDocument();
    });
  });
  
  describe('搜索功能', () => {
    it('应该在输入搜索关键词时更新本地状态', async () => {
      const user = userEvent.setup();
      
      render(
        <LogFilterBar
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
        />
      );
      
      const searchInput = screen.getByPlaceholderText('搜索日志消息...');
      await user.type(searchInput, 'error');
      
      expect(searchInput).toHaveValue('error');
    });
    
    it('应该在 300ms 后触发过滤器更新（防抖）', async () => {
      vi.useFakeTimers();
      const user = userEvent.setup({ delay: null });
      
      render(
        <LogFilterBar
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
        />
      );
      
      const searchInput = screen.getByPlaceholderText('搜索日志消息...');
      await user.type(searchInput, 'error');
      
      // 立即检查，不应该调用
      expect(mockOnFiltersChange).not.toHaveBeenCalled();
      
      // 快进 300ms
      vi.advanceTimersByTime(300);
      
      // 现在应该调用了
      await waitFor(() => {
        expect(mockOnFiltersChange).toHaveBeenCalledWith({
          ...defaultFilters,
          search: 'error',
        });
      });
      
      vi.useRealTimers();
    });
    
    it('应该在快速输入时只触发一次更新', async () => {
      vi.useFakeTimers();
      const user = userEvent.setup({ delay: null });
      
      render(
        <LogFilterBar
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
        />
      );
      
      const searchInput = screen.getByPlaceholderText('搜索日志消息...');
      
      // 快速输入多个字符
      await user.type(searchInput, 'e');
      vi.advanceTimersByTime(100);
      await user.type(searchInput, 'r');
      vi.advanceTimersByTime(100);
      await user.type(searchInput, 'r');
      vi.advanceTimersByTime(100);
      await user.type(searchInput, 'o');
      vi.advanceTimersByTime(100);
      await user.type(searchInput, 'r');
      
      // 快进 300ms
      vi.advanceTimersByTime(300);
      
      // 应该只调用一次，使用最终的值
      await waitFor(() => {
        expect(mockOnFiltersChange).toHaveBeenCalledTimes(1);
        expect(mockOnFiltersChange).toHaveBeenCalledWith({
          ...defaultFilters,
          search: 'error',
        });
      });
      
      vi.useRealTimers();
    });
  });
  
  describe('高级过滤器', () => {
    it('应该在点击过滤按钮时展开高级过滤器', async () => {
      const user = userEvent.setup();
      
      render(
        <LogFilterBar
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
        />
      );
      
      const filterButton = screen.getByLabelText('切换高级过滤器');
      await user.click(filterButton);
      
      expect(screen.getByText('日志级别')).toBeInTheDocument();
      expect(screen.getByText('时间范围')).toBeInTheDocument();
    });
    
    it('应该在再次点击时折叠高级过滤器', async () => {
      const user = userEvent.setup();
      
      render(
        <LogFilterBar
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
        />
      );
      
      const filterButton = screen.getByLabelText('切换高级过滤器');
      
      // 展开
      await user.click(filterButton);
      expect(screen.getByText('日志级别')).toBeInTheDocument();
      
      // 折叠
      await user.click(filterButton);
      expect(screen.queryByText('日志级别')).not.toBeInTheDocument();
    });
  });
  
  describe('日志级别过滤', () => {
    it('应该渲染所有日志级别按钮', async () => {
      const user = userEvent.setup();
      
      render(
        <LogFilterBar
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
        />
      );
      
      // 展开高级过滤器
      await user.click(screen.getByLabelText('切换高级过滤器'));
      
      expect(screen.getByText('DEBUG')).toBeInTheDocument();
      expect(screen.getByText('INFO')).toBeInTheDocument();
      expect(screen.getByText('WARNING')).toBeInTheDocument();
      expect(screen.getByText('ERROR')).toBeInTheDocument();
    });
    
    it('应该在点击级别按钮时切换选中状态', async () => {
      const user = userEvent.setup();
      
      render(
        <LogFilterBar
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
        />
      );
      
      // 展开高级过滤器
      await user.click(screen.getByLabelText('切换高级过滤器'));
      
      // 点击 ERROR 级别
      const errorButton = screen.getByText('ERROR');
      await user.click(errorButton);
      
      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        ...defaultFilters,
        level: ['ERROR'],
      });
    });
    
    it('应该支持多选日志级别', async () => {
      const user = userEvent.setup();
      
      render(
        <LogFilterBar
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
        />
      );
      
      // 展开高级过滤器
      await user.click(screen.getByLabelText('切换高级过滤器'));
      
      // 选择 ERROR
      await user.click(screen.getByText('ERROR'));
      
      // 更新 filters prop 模拟父组件状态更新
      const { rerender } = render(
        <LogFilterBar
          filters={{ ...defaultFilters, level: ['ERROR'] }}
          onFiltersChange={mockOnFiltersChange}
        />
      );
      
      // 展开高级过滤器
      await user.click(screen.getByLabelText('切换高级过滤器'));
      
      // 再选择 WARNING
      await user.click(screen.getByText('WARNING'));
      
      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        ...defaultFilters,
        level: ['ERROR', 'WARNING'],
      });
    });
    
    it('应该在取消选择最后一个级别时移除 level 字段', async () => {
      const user = userEvent.setup();
      
      render(
        <LogFilterBar
          filters={{ ...defaultFilters, level: ['ERROR'] }}
          onFiltersChange={mockOnFiltersChange}
        />
      );
      
      // 展开高级过滤器
      await user.click(screen.getByLabelText('切换高级过滤器'));
      
      // 取消选择 ERROR
      await user.click(screen.getByText('ERROR'));
      
      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        ...defaultFilters,
        level: undefined,
      });
    });
  });
  
  describe('时间范围过滤', () => {
    it('应该渲染时间范围预设按钮', async () => {
      const user = userEvent.setup();
      
      render(
        <LogFilterBar
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
        />
      );
      
      // 展开高级过滤器
      await user.click(screen.getByLabelText('切换高级过滤器'));
      
      expect(screen.getByText('今天')).toBeInTheDocument();
      expect(screen.getByText('最近 7 天')).toBeInTheDocument();
      expect(screen.getByText('最近 30 天')).toBeInTheDocument();
      expect(screen.getByText('自定义')).toBeInTheDocument();
    });
    
    it('应该在选择"今天"时更新时间范围', async () => {
      const user = userEvent.setup();
      
      render(
        <LogFilterBar
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
        />
      );
      
      // 展开高级过滤器
      await user.click(screen.getByLabelText('切换高级过滤器'));
      
      // 点击"今天"
      await user.click(screen.getByText('今天'));
      
      expect(mockOnFiltersChange).toHaveBeenCalled();
      const call = mockOnFiltersChange.mock.calls[0][0];
      expect(call.start_date).toBeDefined();
      expect(call.end_date).toBeDefined();
      
      // 验证开始日期是今天 00:00
      const startDate = new Date(call.start_date);
      const today = new Date();
      expect(startDate.getDate()).toBe(today.getDate());
      expect(startDate.getHours()).toBe(0);
      expect(startDate.getMinutes()).toBe(0);
    });
    
    it('应该在选择"自定义"时显示日期选择器', async () => {
      const user = userEvent.setup();
      
      render(
        <LogFilterBar
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
        />
      );
      
      // 展开高级过滤器
      await user.click(screen.getByLabelText('切换高级过滤器'));
      
      // 点击"自定义"
      await user.click(screen.getByText('自定义'));
      
      expect(screen.getByLabelText('开始日期')).toBeInTheDocument();
      expect(screen.getByLabelText('结束日期')).toBeInTheDocument();
      expect(screen.getByText('应用')).toBeInTheDocument();
    });
  });
  
  describe('自动刷新', () => {
    it('应该在提供 onAutoRefreshChange 时渲染自动刷新开关', async () => {
      const user = userEvent.setup();
      
      render(
        <LogFilterBar
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
          onAutoRefreshChange={mockOnAutoRefreshChange}
        />
      );
      
      // 展开高级过滤器
      await user.click(screen.getByLabelText('切换高级过滤器'));
      
      expect(screen.getByText('自动刷新')).toBeInTheDocument();
    });
    
    it('应该在启用自动刷新时显示刷新间隔选项', async () => {
      const user = userEvent.setup();
      
      render(
        <LogFilterBar
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
          autoRefresh={true}
          onAutoRefreshChange={mockOnAutoRefreshChange}
          onRefreshIntervalChange={mockOnRefreshIntervalChange}
        />
      );
      
      // 展开高级过滤器
      await user.click(screen.getByLabelText('切换高级过滤器'));
      
      expect(screen.getByText('刷新间隔')).toBeInTheDocument();
      expect(screen.getByText('10 秒')).toBeInTheDocument();
      expect(screen.getByText('30 秒')).toBeInTheDocument();
      expect(screen.getByText('60 秒')).toBeInTheDocument();
      expect(screen.getByText('5 分钟')).toBeInTheDocument();
    });
    
    it('应该在点击刷新间隔按钮时调用回调', async () => {
      const user = userEvent.setup();
      
      render(
        <LogFilterBar
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
          autoRefresh={true}
          onAutoRefreshChange={mockOnAutoRefreshChange}
          refreshInterval={30}
          onRefreshIntervalChange={mockOnRefreshIntervalChange}
        />
      );
      
      // 展开高级过滤器
      await user.click(screen.getByLabelText('切换高级过滤器'));
      
      // 点击 60 秒
      await user.click(screen.getByText('60 秒'));
      
      expect(mockOnRefreshIntervalChange).toHaveBeenCalledWith(60);
    });
  });
  
  describe('手动刷新', () => {
    it('应该在点击刷新按钮时调用 onRefresh', async () => {
      const user = userEvent.setup();
      
      render(
        <LogFilterBar
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
          onRefresh={mockOnRefresh}
        />
      );
      
      await user.click(screen.getByLabelText('刷新日志'));
      
      expect(mockOnRefresh).toHaveBeenCalled();
    });
    
    it('应该在刷新时禁用刷新按钮', () => {
      render(
        <LogFilterBar
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
          onRefresh={mockOnRefresh}
          isRefreshing={true}
        />
      );
      
      const refreshButton = screen.getByLabelText('刷新日志');
      expect(refreshButton).toBeDisabled();
    });
  });
  
  describe('清除过滤器', () => {
    it('应该在点击清除按钮时重置所有过滤器', async () => {
      const user = userEvent.setup();
      
      render(
        <LogFilterBar
          filters={{
            ...defaultFilters,
            level: ['ERROR', 'WARNING'],
            search: 'test',
          }}
          onFiltersChange={mockOnFiltersChange}
        />
      );
      
      // 展开高级过滤器
      await user.click(screen.getByLabelText('切换高级过滤器'));
      
      // 点击清除按钮
      await user.click(screen.getByText('清除所有过滤器'));
      
      expect(mockOnFiltersChange).toHaveBeenCalled();
      const call = mockOnFiltersChange.mock.calls[0][0];
      expect(call.level).toBeUndefined();
      expect(call.search).toBeUndefined();
      expect(call.start_date).toBeDefined();
      expect(call.end_date).toBeDefined();
    });
  });
  
  describe('可访问性', () => {
    it('应该为所有按钮提供 aria-label', async () => {
      const user = userEvent.setup();
      
      render(
        <LogFilterBar
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
          onRefresh={mockOnRefresh}
        />
      );
      
      expect(screen.getByLabelText('刷新日志')).toBeInTheDocument();
      expect(screen.getByLabelText('切换高级过滤器')).toBeInTheDocument();
      
      // 展开高级过滤器
      await user.click(screen.getByLabelText('切换高级过滤器'));
      
      // 日志级别按钮应该有 aria-label
      expect(screen.getByLabelText(/选择 ERROR 级别/)).toBeInTheDocument();
    });
    
    it('应该使用 aria-pressed 表示按钮状态', async () => {
      const user = userEvent.setup();
      
      render(
        <LogFilterBar
          filters={{ ...defaultFilters, level: ['ERROR'] }}
          onFiltersChange={mockOnFiltersChange}
        />
      );
      
      // 展开高级过滤器
      await user.click(screen.getByLabelText('切换高级过滤器'));
      
      const errorButton = screen.getByText('ERROR');
      expect(errorButton).toHaveAttribute('aria-pressed', 'true');
      
      const infoButton = screen.getByText('INFO');
      expect(infoButton).toHaveAttribute('aria-pressed', 'false');
    });
    
    it('应该使用 aria-expanded 表示折叠状态', () => {
      render(
        <LogFilterBar
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
        />
      );
      
      const filterButton = screen.getByLabelText('切换高级过滤器');
      expect(filterButton).toHaveAttribute('aria-expanded', 'false');
    });
  });
});
