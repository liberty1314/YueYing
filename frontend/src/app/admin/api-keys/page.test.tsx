/**
 * API Keys Page Tests
 * 
 * 测试 API Keys 管理页面的基本功能
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import ApiKeysPage from './page';
import * as useApiKeysModule from '@/hooks/useApiKeys';

// Mock useApiKeys hook
vi.mock('@/hooks/useApiKeys');

// Mock ConfigForm component
vi.mock('@/components/admin/ConfigForm', () => ({
  ConfigForm: ({ title, description }: any) => (
    <div data-testid="config-form">
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
  ),
}));

// Mock AppleCard component
vi.mock('@/components/ui/AppleCard', () => ({
  AppleCard: ({ children }: any) => (
    <div data-testid="apple-card">{children}</div>
  ),
}));

// Mock other UI components
vi.mock('@/components/ui/Skeleton', () => ({
  Skeleton: () => <div data-testid="skeleton">Loading...</div>,
}));

vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children }: any) => <span data-testid="badge">{children}</span>,
}));

describe('ApiKeysPage', () => {
  const mockConfigs = [
    {
      service: 'tmdb',
      api_key: 'test_key_1',
      api_key_preview: 'test_***',
      has_key: true,
      base_url: null,
      enabled: true,
      last_tested_at: '2024-01-01T00:00:00Z',
      test_status: 'success',
      test_message: '连接成功',
      description: 'TMDB API Key',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
    {
      service: 'google_books',
      api_key: 'test_key_2',
      api_key_preview: 'AIza***',
      has_key: true,
      base_url: null,
      enabled: false,
      last_tested_at: null,
      test_status: 'unknown',
      test_message: null,
      description: null,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
  ];

  const mockPresets = {
    tmdb: {
      has_key: true,
      description: 'TMDB preset from env',
      base_url: 'https://api.themoviedb.org/3',
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('应该在加载时显示 Skeleton', () => {
    vi.mocked(useApiKeysModule.useApiKeys).mockReturnValue({
      configs: [],
      presets: null,
      loading: true,
      error: null,
      refetch: vi.fn(),
      updateConfig: vi.fn(),
      testConnection: vi.fn(),
    });

    render(<ApiKeysPage />);
    
    expect(screen.getAllByTestId('skeleton')).toHaveLength(2);
  });

  it('应该在错误时显示错误信息', () => {
    const mockError = new Error('加载失败');
    vi.mocked(useApiKeysModule.useApiKeys).mockReturnValue({
      configs: [],
      presets: null,
      loading: false,
      error: mockError,
      refetch: vi.fn(),
      updateConfig: vi.fn(),
      testConnection: vi.fn(),
    });

    render(<ApiKeysPage />);
    
    expect(screen.getByText('API 密钥管理')).toBeInTheDocument();
    expect(screen.getAllByText('加载失败')).toHaveLength(2);
  });

  it('应该显示配置表单', () => {
    vi.mocked(useApiKeysModule.useApiKeys).mockReturnValue({
      configs: mockConfigs,
      presets: null,
      loading: false,
      error: null,
      refetch: vi.fn(),
      updateConfig: vi.fn(),
      testConnection: vi.fn(),
    });

    render(<ApiKeysPage />);
    
    expect(screen.getByTestId('config-form')).toBeInTheDocument();
    expect(screen.getByText('API 密钥管理')).toBeInTheDocument();
    expect(screen.getByText(/配置外部数据源的 API 密钥/)).toBeInTheDocument();
  });

  it('应该显示密钥状态概览', () => {
    vi.mocked(useApiKeysModule.useApiKeys).mockReturnValue({
      configs: mockConfigs,
      presets: null,
      loading: false,
      error: null,
      refetch: vi.fn(),
      updateConfig: vi.fn(),
      testConnection: vi.fn(),
    });

    render(<ApiKeysPage />);
    
    expect(screen.getByText('密钥状态')).toBeInTheDocument();
    expect(screen.getByText('TMDB')).toBeInTheDocument();
    expect(screen.getByText('Google Books')).toBeInTheDocument();
  });

  it('应该显示环境变量预设信息', () => {
    vi.mocked(useApiKeysModule.useApiKeys).mockReturnValue({
      configs: mockConfigs,
      presets: mockPresets,
      loading: false,
      error: null,
      refetch: vi.fn(),
      updateConfig: vi.fn(),
      testConnection: vi.fn(),
    });

    render(<ApiKeysPage />);
    
    expect(screen.getByText('环境变量预设')).toBeInTheDocument();
    expect(screen.getByText(/以下数据源已在环境变量中配置/)).toBeInTheDocument();
  });

  it('应该在没有配置时显示空状态', () => {
    vi.mocked(useApiKeysModule.useApiKeys).mockReturnValue({
      configs: [],
      presets: null,
      loading: false,
      error: null,
      refetch: vi.fn(),
      updateConfig: vi.fn(),
      testConnection: vi.fn(),
    });

    render(<ApiKeysPage />);
    
    expect(screen.getByText('暂无 API 密钥配置')).toBeInTheDocument();
    expect(screen.getByText(/请在上方表单中配置/)).toBeInTheDocument();
  });

  it('应该显示正确的状态徽章', () => {
    vi.mocked(useApiKeysModule.useApiKeys).mockReturnValue({
      configs: mockConfigs,
      presets: null,
      loading: false,
      error: null,
      refetch: vi.fn(),
      updateConfig: vi.fn(),
      testConnection: vi.fn(),
    });

    render(<ApiKeysPage />);
    
    const badges = screen.getAllByTestId('badge');
    expect(badges.length).toBeGreaterThan(0);
    
    // 检查是否有"连接正常"徽章
    expect(screen.getByText('连接正常')).toBeInTheDocument();
    
    // 检查是否有"已启用"和"已禁用"徽章
    expect(screen.getByText('已启用')).toBeInTheDocument();
    expect(screen.getByText('已禁用')).toBeInTheDocument();
  });

  it('应该显示密钥预览', () => {
    vi.mocked(useApiKeysModule.useApiKeys).mockReturnValue({
      configs: mockConfigs,
      presets: null,
      loading: false,
      error: null,
      refetch: vi.fn(),
      updateConfig: vi.fn(),
      testConnection: vi.fn(),
    });

    render(<ApiKeysPage />);
    
    expect(screen.getByText('test_***')).toBeInTheDocument();
    expect(screen.getByText('AIza***')).toBeInTheDocument();
  });

  it('应该显示测试状态信息', () => {
    vi.mocked(useApiKeysModule.useApiKeys).mockReturnValue({
      configs: mockConfigs,
      presets: null,
      loading: false,
      error: null,
      refetch: vi.fn(),
      updateConfig: vi.fn(),
      testConnection: vi.fn(),
    });

    render(<ApiKeysPage />);
    
    expect(screen.getByText('连接成功')).toBeInTheDocument();
    expect(screen.getByText(/最后测试:/)).toBeInTheDocument();
  });
});
