/**
 * DeleteConfirmDialog 组件单元测试
 * 
 * 测试内容：
 * - 组件渲染
 * - 确认和取消按钮功能
 * - 加载状态
 * - 可访问性属性
 * - 警告信息显示
 * 
 * 验证需求: 13.3
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DeleteConfirmDialog } from './DeleteConfirmDialog';

describe('DeleteConfirmDialog', () => {
  const defaultProps = {
    open: true,
    onClose: vi.fn(),
    onConfirm: vi.fn(),
    message: '确定要删除此项目吗？',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('渲染测试', () => {
    it('应该正确渲染对话框', () => {
      render(<DeleteConfirmDialog {...defaultProps} />);

      expect(screen.getByText('确认删除')).toBeInTheDocument();
      expect(screen.getByText('确定要删除此项目吗？')).toBeInTheDocument();
      expect(screen.getByText('取消')).toBeInTheDocument();
      expect(screen.getByText('删除')).toBeInTheDocument();
    });

    it('应该显示自定义标题', () => {
      render(
        <DeleteConfirmDialog {...defaultProps} title="删除用户" />
      );

      expect(screen.getByText('删除用户')).toBeInTheDocument();
    });

    it('应该显示自定义按钮文本', () => {
      render(
        <DeleteConfirmDialog
          {...defaultProps}
          confirmText="确认"
          cancelText="返回"
        />
      );

      expect(screen.getByText('确认')).toBeInTheDocument();
      expect(screen.getByText('返回')).toBeInTheDocument();
    });

    it('应该显示警告信息', () => {
      const warning = '此操作无法撤销';
      render(<DeleteConfirmDialog {...defaultProps} warning={warning} />);

      expect(screen.getByText(warning)).toBeInTheDocument();
    });

    it('不应该显示警告信息当未提供时', () => {
      render(<DeleteConfirmDialog {...defaultProps} />);

      // 警告框不应该存在
      const warningBox = screen.queryByText(/此操作无法撤销/);
      expect(warningBox).not.toBeInTheDocument();
    });
  });

  describe('交互测试', () => {
    it('点击取消按钮应该调用 onClose', () => {
      render(<DeleteConfirmDialog {...defaultProps} />);

      const cancelButton = screen.getByText('取消');
      fireEvent.click(cancelButton);

      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });

    it('点击关闭图标应该调用 onClose', () => {
      render(<DeleteConfirmDialog {...defaultProps} />);

      const closeButton = screen.getByLabelText('关闭对话框');
      fireEvent.click(closeButton);

      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });

    it('点击确认按钮应该调用 onConfirm', async () => {
      render(<DeleteConfirmDialog {...defaultProps} />);

      const confirmButton = screen.getByText('删除');
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1);
      });
    });

    it('确认操作完成后应该自动关闭对话框', async () => {
      const onConfirm = vi.fn().mockResolvedValue(undefined);
      render(
        <DeleteConfirmDialog {...defaultProps} onConfirm={onConfirm} />
      );

      const confirmButton = screen.getByText('删除');
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(onConfirm).toHaveBeenCalledTimes(1);
        expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('加载状态测试', () => {
    it('加载时应该禁用所有按钮', () => {
      render(<DeleteConfirmDialog {...defaultProps} loading={true} />);

      const cancelButton = screen.getByText('取消');
      const confirmButton = screen.getByText('删除中...');
      const closeButton = screen.getByLabelText('关闭对话框');

      expect(cancelButton).toBeDisabled();
      expect(confirmButton).toBeDisabled();
      expect(closeButton).toBeDisabled();
    });

    it('加载时确认按钮应该显示加载文本', () => {
      render(<DeleteConfirmDialog {...defaultProps} loading={true} />);

      expect(screen.getByText('删除中...')).toBeInTheDocument();
      expect(screen.queryByText('删除')).not.toBeInTheDocument();
    });

    it('加载时不应该响应按钮点击', () => {
      render(<DeleteConfirmDialog {...defaultProps} loading={true} />);

      const cancelButton = screen.getByText('取消');
      const confirmButton = screen.getByText('删除中...');

      fireEvent.click(cancelButton);
      fireEvent.click(confirmButton);

      expect(defaultProps.onClose).not.toHaveBeenCalled();
      expect(defaultProps.onConfirm).not.toHaveBeenCalled();
    });
  });

  describe('可访问性测试', () => {
    it('应该有正确的 ARIA 属性', () => {
      const { container } = render(<DeleteConfirmDialog {...defaultProps} />);

      const dialog = container.querySelector('[role="dialog"]');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAttribute('aria-labelledby', 'delete-confirm-dialog-title');
      expect(dialog).toHaveAttribute('aria-describedby', 'delete-confirm-dialog-description');
    });

    it('关闭按钮应该有 aria-label', () => {
      render(<DeleteConfirmDialog {...defaultProps} />);

      const closeButton = screen.getByLabelText('关闭对话框');
      expect(closeButton).toBeInTheDocument();
    });

    it('标题应该有正确的 id', () => {
      render(<DeleteConfirmDialog {...defaultProps} />);

      const title = screen.getByText('确认删除');
      expect(title.closest('[id="delete-confirm-dialog-title"]')).toBeInTheDocument();
    });

    it('内容应该有正确的 id', () => {
      render(<DeleteConfirmDialog {...defaultProps} />);

      const content = screen.getByText('确定要删除此项目吗？');
      expect(content.closest('[id="delete-confirm-dialog-description"]')).toBeInTheDocument();
    });
  });

  describe('错误处理测试', () => {
    it('确认操作失败时应该捕获错误', async () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation();
      const onConfirm = vi.fn().mockRejectedValue(new Error('删除失败'));

      render(
        <DeleteConfirmDialog {...defaultProps} onConfirm={onConfirm} />
      );

      const confirmButton = screen.getByText('删除');
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(onConfirm).toHaveBeenCalledTimes(1);
        expect(consoleError).toHaveBeenCalled();
      });

      consoleError.mockRestore();
    });
  });

  describe('对话框状态测试', () => {
    it('open 为 false 时不应该显示对话框', () => {
      render(<DeleteConfirmDialog {...defaultProps} open={false} />);

      // 对话框内容不应该可见
      expect(screen.queryByText('确认删除')).not.toBeInTheDocument();
    });

    it('open 为 true 时应该显示对话框', () => {
      render(<DeleteConfirmDialog {...defaultProps} open={true} />);

      expect(screen.getByText('确认删除')).toBeInTheDocument();
    });
  });

  describe('视觉样式测试', () => {
    it('标题应该使用错误颜色', () => {
      const { container } = render(<DeleteConfirmDialog {...defaultProps} />);

      const title = container.querySelector('#delete-confirm-dialog-title');
      expect(title).toHaveStyle({ color: 'var(--color-error)' });
    });

    it('确认按钮应该使用错误颜色背景', () => {
      render(<DeleteConfirmDialog {...defaultProps} />);

      const confirmButton = screen.getByText('删除');
      const buttonElement = confirmButton.closest('button');

      expect(buttonElement).toHaveStyle({
        backgroundColor: 'var(--color-error)',
      });
    });
  });
});
