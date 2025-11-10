/**
 * 日志 WebSocket Hook
 * 管理 WebSocket 连接和实时日志推送
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import type { LogEntry, LogWebSocketMessage, ConnectionStatus } from '@/types/log';
import { useAuthStore } from '@/store/authStore';

const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000';

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
      const ws = new WebSocket(`${WS_BASE_URL}/api/admin/ws/logs?token=${token}`);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connected');
        setStatus('connected');
        setError(null);
        reconnectAttempts.current = 0;
      };

      ws.onmessage = (event) => {
        try {
          const message: LogWebSocketMessage = JSON.parse(event.data);
          
          if (message.type === 'new_log' && message.data) {
            setLogs((prev) => [...prev, message.data!]);
          } else if (message.type === 'connected') {
            console.log('WebSocket handshake complete:', message.message);
          }
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err);
        }
      };

      ws.onerror = (event) => {
        console.error('WebSocket error:', event);
        setError('WebSocket 连接错误');
        setStatus('error');
      };

      ws.onclose = (event) => {
        console.log('WebSocket closed:', event.code, event.reason);
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

