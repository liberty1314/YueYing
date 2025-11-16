/**
 * 日志 WebSocket Hook
 * 管理 WebSocket 连接和实时日志推送
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import type { LogEntry, LogWebSocketMessage, ConnectionStatus } from '@/types/log';
import { useAuthStore } from '@/store/authStore';

/**
 * 获取 WebSocket 基础 URL
 * 与 frontend/lib/websocket.ts 保持一致的逻辑
 */
function getWebSocketBaseUrl(): string {
  // 检查是否在浏览器环境中
  if (typeof window === 'undefined') {
    return 'ws://localhost:8000';
  }

  // 根据当前环境自动确定
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:8000';

  // 从 API URL 中提取 host 和 port（移除 protocol 和 path）
  const urlParts = apiUrl.replace(/^https?:\/\//, '').split('/');
  const host = urlParts[0]; // 只取第一部分（host:port）

  return `${protocol}//${host}`;
}

export function useLogWebSocket(enabled: boolean = false) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [error, setError] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const { token } = useAuthStore();

  // 清理函数
  const cleanup = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);

  // 连接 WebSocket
  const connect = useCallback(() => {
    if (!token || !enabled) {
      return;
    }

    // 如果已经有连接，先清理
    cleanup();

    setStatus('connecting');
    setError(null);

    try {
      const wsBaseUrl = getWebSocketBaseUrl();
      const wsUrl = `${wsBaseUrl}/api/admin/ws/logs?token=${encodeURIComponent(token)}`;
      console.log('[LogWebSocket] Connecting to:', wsUrl.replace(/token=[^&]+/, 'token=***'));

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('[LogWebSocket] Connected successfully');
        setStatus('connected');
        setError(null);
        reconnectAttempts.current = 0;
      };

      ws.onmessage = (event) => {
        try {
          const message: LogWebSocketMessage = JSON.parse(event.data);
          console.log('[LogWebSocket] Received message:', message.type);

          if (message.type === 'new_log' && message.data) {
            setLogs((prev) => [...prev, message.data!]);
          } else if (message.type === 'connected') {
            console.log('[LogWebSocket] Handshake complete:', message.message);
          } else if (message.type === 'pong') {
            console.log('[LogWebSocket] Pong received');
          }
        } catch (err) {
          console.error('[LogWebSocket] Failed to parse message:', err);
        }
      };

      ws.onerror = (event) => {
        console.error('[LogWebSocket] Error occurred:', event);
        setError('WebSocket 连接错误');
        setStatus('error');
      };

      ws.onclose = (event) => {
        console.log('[LogWebSocket] Connection closed. Code:', event.code, 'Reason:', event.reason || 'No reason provided');
        setStatus('disconnected');
        wsRef.current = null;

        // 自动重连（如果仍然启用且未超过最大重连次数）
        if (enabled && reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current += 1;
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 10000);
          console.log(`Will reconnect in ${delay}ms (attempt ${reconnectAttempts.current})`);

          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, delay);
        } else if (reconnectAttempts.current >= maxReconnectAttempts) {
          setError('WebSocket 重连失败，已达到最大重连次数');
        }
      };
    } catch (err) {
      console.error('Failed to create WebSocket:', err);
      setError('创建 WebSocket 连接失败');
      setStatus('error');
    }
  }, [token, enabled, cleanup]);

  // 断开连接
  const disconnect = useCallback(() => {
    cleanup();
    setStatus('disconnected');
    setError(null);
    reconnectAttempts.current = 0;
  }, [cleanup]);

  // 清空日志
  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  // 发送心跳
  const sendPing = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'ping' }));
    }
  }, []);

  // 当 enabled 或 token 变化时，连接或断开
  useEffect(() => {
    if (enabled && token) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      cleanup();
    };
  }, [enabled, token, connect, disconnect, cleanup]);

  // 定期发送心跳
  useEffect(() => {
    if (status === 'connected') {
      const interval = setInterval(() => {
        sendPing();
      }, 30000); // 每 30 秒发送一次心跳

      return () => clearInterval(interval);
    }
  }, [status, sendPing]);

  return {
    logs,
    status,
    error,
    clearLogs,
    reconnect: connect,
  };
}

