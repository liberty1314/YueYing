/**
 * WebSocket 通知 Hook
 * 用于在组件中订阅和处理 WebSocket 消息
 */

import { useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { getWebSocketClient } from '@/lib/websocket';
import { useToast } from './use-toast';

export function useWebSocketNotifications() {
  const { data: session, status } = useSession();
  const { toast } = useToast();
  const wsClient = getWebSocketClient();

  // 连接 WebSocket
  useEffect(() => {
    if (status === 'authenticated' && session?.accessToken) {
      // 连接 WebSocket
      wsClient.connect(session.accessToken);

      return () => {
        // 组件卸载时断开连接
        wsClient.disconnect();
      };
    }
  }, [status, session?.accessToken, wsClient]);

  // 订阅任务更新通知
  const onTaskUpdate = useCallback((handler: (task: any) => void) => {
    wsClient.on('task_update', handler);

    return () => {
      wsClient.off('task_update', handler);
    };
  }, [wsClient]);

  // 订阅 AI 助手消息
  const onAssistantMessage = useCallback((handler: (message: any) => void) => {
    wsClient.on('assistant_message', handler);

    return () => {
      wsClient.off('assistant_message', handler);
    };
  }, [wsClient]);

  // 订阅所有消息
  const onMessage = useCallback((handler: (message: any) => void) => {
    wsClient.on('*', handler);

    return () => {
      wsClient.off('*', handler);
    };
  }, [wsClient]);

  return {
    wsClient,
    isConnected: wsClient.isConnected(),
    onTaskUpdate,
    onAssistantMessage,
    onMessage,
  };
}

