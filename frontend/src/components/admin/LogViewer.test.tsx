/**
 * LogViewer 组件单元测试
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LogViewer } from './LogViewer';
import { LogEntry } from '@/types/log';

// Mock react-window
vi.mock('react-window', () => ({
  FixedSizeList: ({ children, itemCount, itemSize }: any) => (
    <div data-testid="virtual-list">
      {Array.from({ length: Math.min(itemCount, 10) }).map((_, index) => (
        <div key={index}>
          {children({ index, style: {} })}
        </div>
      ))}
    </div>
  ),
}));

// 示例日志数据
const mockLogs: LogEntry[] = [
  {
    id: '1',
    timestamp: new Date(Date.now() - 1000).toISOString(),
    level: 'INFO',
    message: 'User login successful',
    source: 'auth',
  },
  {
    id: '2',
    timestamp: new Date(Date.now() - 2000).toISOString(),
    level: 'ERROR',
    message: 'Database connection failed',
    source: 'database',
    user_id: 'user_123',
    request_id: 'req_abc',
    metadata: { error_code: 'ECONNREFUSED' },
  },
  {
    id: '3',
    timestamp: new Date(Date.now() - 3000).toISOString(),
    level: 'WARNING',
    message: 'API rate limit approaching',
    source: 'api',
  },
  {
    id: '4',
    timestamp: new Date(Date.now() - 4000).toISOString(),
    level: 'DEBUG',
    message: 'Debug information',
    source: 'system',
  },
];

describe('LogViewer', () => {
  describe('基础渲染', () => {
    it('应该渲染日志列表', () => {
      render(<LogViewer logs={mockLogs} />);
      
      // 检查表头
      expect(screen.getByText('时间')).toBeInTheDocument();
      expect(screen.getByText('级别')).toBeInTheDocument();
      expect(screen.getByText('来源')).toBeInTheDocument();
      expect(screen.getByText('消息')).toBeInTheDocument();
      
      // 检查日志内容
      expect(screen.getByText('User login successful')).toBeInTheDocument();
      expect(screen.getByText('Database connection failed')).toBeInTheDocument();
    });
    
    it('应该显示日志消息', () => {
      render(<LogViewer logs={mockLogs} />);
      
      expect(screen.getByText('User login successful')).toBeInTheDocument();
      expect(screen.getByText('Database connection failed')).toBeInTheDocument();
    });
    
    it('应该显示日志级别', () => {
      render(<LogViewer logs={mockLogs} />);
      
      expect(screen.getByText('INFO')).toBeInTheDocument();
      expect(screen.getByText('ERROR')).toBeInTheDocument();
      expect(screen.getByText('WARNING')).toBeInTheDocument();
      expect(screen.getByText('DEBUG')).toBeInTheDocument();
    });
    
    it('应该显示日志来源', () => {
      render(<LogViewer logs={mockLogs} />);
      
      expect(screen.getByText('auth')).toBeInTheDocument();
      expect(screen.getByText('database')).toBeInTheDocument();
      expect(screen.getByText('api')).toBeInTheDocument();
    });
  });
  
  describe('加载状态', () => {
    it('应该显示加载状态', () => {
      render(<LogViewer logs={[]} loading={true} />);
      
      expect(screen.getByText('加载日志中...')).toBeInTheDocument();
    });
  });
  
  describe('空状态', () => {
    it('应该显示空状态', () => {
      render(<LogViewer logs={[]} />);
      
      expect(screen.getByText('暂无日志')).toBeInTheDocument();
    });
  });
  
  describe('日志详情展开', () => {
    it('应该显示展开按钮（当有详情时）', () => {
      render(<LogViewer logs={mockLogs} />);
      
      // 第二条日志有详情（user_id, request_id, metadata）
      const expandButtons = screen.getAllByLabelText(/展开详情|折叠详情/);
      expect(expandButtons.length).toBeGreaterThan(0);
    });
    
    it('应该能够展开和折叠日志详情', async () => {
      render(<LogViewer logs={mockLogs} />);
      
      // 找到第一个展开按钮
      const expandButton = screen.getAllByLabelText('展开详情')[0];
      
      // 点击展开
      fireEvent.click(expandButton);
      
      // 等待详情显示
      await waitFor(() => {
        expect(screen.getByText('User ID:')).toBeInTheDocument();
      });
      
      // 再次点击折叠
      const collapseButton = screen.getByLabelText('折叠详情');
      fireEvent.click(collapseButton);
      
      // 详情应该消失
      await waitFor(() => {
        expect(screen.queryByText('User ID:')).not.toBeInTheDocument();
      });
    });
  });
  
  describe('复制功能', () => {
    it('应该显示复制按钮', () => {
      render(<LogViewer logs={mockLogs} />);
      
      const copyButtons = screen.getAllByLabelText('复制日志');
      expect(copyButtons.length).toBeGreaterThan(0);
    });
    
    it('应该能够复制日志', async () => {
      // Mock clipboard API
      Object.assign(navigator, {
        clipboard: {
          writeText: vi.fn().mockResolvedValue(undefined),
        },
      });
      
      render(<LogViewer logs={mockLogs} />);
      
      const copyButton = screen.getAllByLabelText('复制日志')[0];
      fireEvent.click(copyButton);
      
      await waitFor(() => {
        expect(navigator.clipboard.writeText).toHaveBeenCalled();
      });
    });
  });
  
  describe('自定义属性', () => {
    it('应该接受自定义高度', () => {
      const { container } = render(<LogViewer logs={mockLogs} height={800} />);
      
      // 检查容器样式 - 查找滚动容器
      const scrollContainer = container.querySelector('.overflow-y-auto');
      expect(scrollContainer).toBeInTheDocument();
      // 高度应该是 800 - 48 (表头高度) = 752px
      expect(scrollContainer).toHaveStyle({ height: '752px' });
    });
    
    it('应该接受自定义类名', () => {
      const { container } = render(<LogViewer logs={mockLogs} className="custom-class" />);
      
      const logContainer = container.querySelector('.custom-class');
      expect(logContainer).toBeInTheDocument();
    });
  });
  
  describe('日志级别颜色', () => {
    it('应该为不同级别应用不同的样式', () => {
      render(<LogViewer logs={mockLogs} />);
      
      // 检查所有级别徽章都存在
      const infoBadge = screen.getByText('INFO');
      const errorBadge = screen.getByText('ERROR');
      const warningBadge = screen.getByText('WARNING');
      const debugBadge = screen.getByText('DEBUG');
      
      expect(infoBadge).toBeInTheDocument();
      expect(errorBadge).toBeInTheDocument();
      expect(warningBadge).toBeInTheDocument();
      expect(debugBadge).toBeInTheDocument();
    });
  });
  
  describe('时间戳显示', () => {
    it('应该显示相对时间', () => {
      render(<LogViewer logs={mockLogs} />);
      
      // 应该显示相对时间（如 "刚刚"）
      const timeElements = screen.getAllByRole('time');
      expect(timeElements.length).toBeGreaterThan(0);
    });
  });
  
  describe('可访问性', () => {
    it('应该有正确的 ARIA 标签', () => {
      render(<LogViewer logs={mockLogs} />);
      
      // 检查展开按钮的 aria-label
      const expandButtons = screen.getAllByLabelText(/展开详情|折叠详情/);
      expect(expandButtons.length).toBeGreaterThan(0);
      
      // 检查复制按钮的 aria-label
      const copyButtons = screen.getAllByLabelText('复制日志');
      expect(copyButtons.length).toBeGreaterThan(0);
    });
    
    it('应该使用语义化的 time 元素', () => {
      render(<LogViewer logs={mockLogs} />);
      
      const timeElements = screen.getAllByRole('time');
      expect(timeElements.length).toBeGreaterThan(0);
      
      // 检查 time 元素有 dateTime 属性
      timeElements.forEach((timeElement) => {
        expect(timeElement).toHaveAttribute('dateTime');
      });
    });
  });
});
