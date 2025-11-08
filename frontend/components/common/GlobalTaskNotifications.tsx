"use client";

import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useWebSocketNotifications } from '@/hooks/use-websocket-notifications';
import { eventBus, Events } from '@/lib/events';

/**
 * 全局任务通知组件
 * 
 * 监听所有后台任务的完成状态，并在应用的任何页面显示通知
 * 无论用户在哪个页面，都能收到任务完成的提示
 */
export function GlobalTaskNotifications() {
  const { toast } = useToast();
  const { onTaskUpdate } = useWebSocketNotifications();

  useEffect(() => {
    // 监听所有任务更新
    const unsubscribe = onTaskUpdate((task) => {
      // 总结生成任务
      if (task.task_type === 'summary_generation') {
        if (task.status === 'completed') {
          toast({
            title: "✨ 总结已生成完毕",
            description: "您的个性化总结已生成，可以在统计页面的历史记录中查看",
            duration: 5000,
          });
          // 触发全局事件，通知统计页面刷新历史列表
          eventBus.emit(Events.SUMMARY_GENERATED, task);
        } else if (task.status === 'failed') {
          toast({
            title: "❌ 总结生成失败",
            description: task.error_message || "生成总结时发生错误，请稍后重试",
            variant: "destructive",
            duration: 5000,
          });
          // 触发失败事件
          eventBus.emit(Events.SUMMARY_FAILED, task);
        }
      }
      
      // AI 聊天任务
      if (task.task_type === 'ai_chat') {
        if (task.status === 'completed') {
          toast({
            title: "💬 AI 回复已生成",
            description: "AI 助手已完成回复",
            duration: 3000,
          });
        } else if (task.status === 'failed') {
          toast({
            title: "❌ AI 回复失败",
            description: task.error_message || "AI 回复时发生错误",
            variant: "destructive",
            duration: 5000,
          });
        }
      }
      
      // 数据导入任务
      if (task.task_type === 'data_import') {
        if (task.status === 'completed') {
          toast({
            title: "📥 数据导入完成",
            description: "您的数据已成功导入",
            duration: 5000,
          });
        } else if (task.status === 'failed') {
          toast({
            title: "❌ 数据导入失败",
            description: task.error_message || "导入数据时发生错误",
            variant: "destructive",
            duration: 5000,
          });
        }
      }
      
      // 数据导出任务
      if (task.task_type === 'data_export') {
        if (task.status === 'completed') {
          toast({
            title: "📤 数据导出完成",
            description: "您的数据已准备好下载",
            duration: 5000,
          });
        } else if (task.status === 'failed') {
          toast({
            title: "❌ 数据导出失败",
            description: task.error_message || "导出数据时发生错误",
            variant: "destructive",
            duration: 5000,
          });
        }
      }
    });

    // 清理订阅
    return () => {
      unsubscribe();
    };
  }, [toast, onTaskUpdate]);

  // 这个组件不渲染任何内容，只是监听通知
  return null;
}

