/**
 * LogViewer 组件使用示例
 */

'use client';

import { LogViewer } from './LogViewer';
import { LogEntry, LogLevel } from '@/types/log';

// 生成示例日志数据
function generateSampleLogs(count: number): LogEntry[] {
  const levels: LogLevel[] = ['DEBUG', 'INFO', 'WARNING', 'ERROR'];
  const sources = ['api', 'database', 'auth', 'cache', 'scheduler'];
  const messages = [
    'User authentication successful',
    'Database query executed',
    'Cache miss for key: user_123',
    'API request received',
    'Background task completed',
    'Failed to connect to external service',
    'Rate limit exceeded for IP',
    'Session expired',
    'File upload completed',
    'Email sent successfully',
  ];
  
  const logs: LogEntry[] = [];
  const now = Date.now();
  
  for (let i = 0; i < count; i++) {
    const level = levels[Math.floor(Math.random() * levels.length)];
    const source = sources[Math.floor(Math.random() * sources.length)];
    const message = messages[Math.floor(Math.random() * messages.length)];
    const timestamp = new Date(now - i * 60000).toISOString(); // 每条日志间隔 1 分钟
    
    const log: LogEntry = {
      id: `log-${i}`,
      timestamp,
      level,
      message,
      source,
    };
    
    // 随机添加额外信息
    if (Math.random() > 0.7) {
      log.user_id = `user_${Math.floor(Math.random() * 1000)}`;
    }
    
    if (Math.random() > 0.8) {
      log.request_id = `req_${Math.random().toString(36).substring(7)}`;
    }
    
    if (Math.random() > 0.85) {
      log.metadata = {
        duration: Math.floor(Math.random() * 1000),
        status_code: [200, 201, 400, 401, 404, 500][Math.floor(Math.random() * 6)],
        endpoint: `/api/v1/${source}`,
      };
    }
    
    logs.push(log);
  }
  
  return logs;
}

/**
 * 基础示例
 */
export function BasicExample() {
  const logs = generateSampleLogs(20);
  
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">基础日志查看器</h3>
        <p className="text-sm text-[var(--color-text-secondary)] mb-4">
          显示 20 条示例日志，支持展开详情和复制
        </p>
      </div>
      <LogViewer logs={logs} />
    </div>
  );
}

/**
 * 自定义高度示例
 */
export function CustomHeightExample() {
  const logs = generateSampleLogs(50);
  
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">自定义高度</h3>
        <p className="text-sm text-[var(--color-text-secondary)] mb-4">
          显示 50 条日志，高度设置为 400px
        </p>
      </div>
      <LogViewer logs={logs} height={400} />
    </div>
  );
}

/**
 * 大量日志示例（测试虚拟滚动性能）
 */
export function LargeDatasetExample() {
  const logs = generateSampleLogs(1000);
  
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">大量日志（虚拟滚动）</h3>
        <p className="text-sm text-[var(--color-text-secondary)] mb-4">
          显示 1000 条日志，使用虚拟滚动优化性能
        </p>
      </div>
      <LogViewer logs={logs} height={600} />
    </div>
  );
}

/**
 * 加载状态示例
 */
export function LoadingExample() {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">加载状态</h3>
        <p className="text-sm text-[var(--color-text-secondary)] mb-4">
          显示加载中的状态
        </p>
      </div>
      <LogViewer logs={[]} loading={true} />
    </div>
  );
}

/**
 * 空状态示例
 */
export function EmptyExample() {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">空状态</h3>
        <p className="text-sm text-[var(--color-text-secondary)] mb-4">
          没有日志时的显示
        </p>
      </div>
      <LogViewer logs={[]} />
    </div>
  );
}

/**
 * 不同日志级别示例
 */
export function LogLevelsExample() {
  const logs: LogEntry[] = [
    {
      id: '1',
      timestamp: new Date(Date.now() - 1000).toISOString(),
      level: 'DEBUG',
      message: 'Debug message for development',
      source: 'api',
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 2000).toISOString(),
      level: 'INFO',
      message: 'Information message about normal operation',
      source: 'database',
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 3000).toISOString(),
      level: 'WARNING',
      message: 'Warning message about potential issue',
      source: 'cache',
    },
    {
      id: '4',
      timestamp: new Date(Date.now() - 4000).toISOString(),
      level: 'ERROR',
      message: 'Error message about failed operation',
      source: 'auth',
    },
  ];
  
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">不同日志级别</h3>
        <p className="text-sm text-[var(--color-text-secondary)] mb-4">
          展示所有日志级别的颜色标识
        </p>
      </div>
      <LogViewer logs={logs} height={300} />
    </div>
  );
}

/**
 * 带详细信息的日志示例
 */
export function DetailedLogsExample() {
  const logs: LogEntry[] = [
    {
      id: '1',
      timestamp: new Date(Date.now() - 1000).toISOString(),
      level: 'INFO',
      message: 'User login successful',
      source: 'auth',
      user_id: 'user_12345',
      request_id: 'req_abc123',
      metadata: {
        ip_address: '192.168.1.100',
        user_agent: 'Mozilla/5.0...',
        login_method: 'password',
      },
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 2000).toISOString(),
      level: 'ERROR',
      message: 'Database connection failed',
      source: 'database',
      request_id: 'req_xyz789',
      metadata: {
        error_code: 'ECONNREFUSED',
        host: 'localhost',
        port: 5432,
        retry_count: 3,
      },
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 3000).toISOString(),
      level: 'WARNING',
      message: 'API rate limit approaching',
      source: 'api',
      user_id: 'user_67890',
      metadata: {
        current_requests: 95,
        limit: 100,
        window: '1 minute',
      },
    },
  ];
  
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">带详细信息的日志</h3>
        <p className="text-sm text-[var(--color-text-secondary)] mb-4">
          点击左侧箭头展开查看详细信息
        </p>
      </div>
      <LogViewer logs={logs} height={400} />
    </div>
  );
}

/**
 * 所有示例的展示页面
 */
export default function LogViewerExamples() {
  return (
    <div className="container mx-auto p-8 space-y-12">
      <div>
        <h1 className="text-3xl font-bold mb-2">LogViewer 组件示例</h1>
        <p className="text-[var(--color-text-secondary)]">
          日志查看器组件的各种使用场景
        </p>
      </div>
      
      <BasicExample />
      <LogLevelsExample />
      <DetailedLogsExample />
      <CustomHeightExample />
      <LargeDatasetExample />
      <LoadingExample />
      <EmptyExample />
    </div>
  );
}
