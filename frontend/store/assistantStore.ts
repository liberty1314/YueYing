/**
 * AI 助手全局状态管理
 * 使用 Zustand 实现，确保在页面切换时不丢失对话状态
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface Message {
  id?: number;
  role: 'user' | 'assistant';
  content: string;
  created_at?: string;
}

export interface Conversation {
  id: number;
  title: string;
  created_at: string;
  updated_at?: string;
  message_count: number;
}

interface AssistantState {
  // 对话列表
  conversations: Conversation[];
  currentConversationId: number | null;
  
  // 当前对话的消息
  messages: Message[];
  
  // 状态
  isLoading: boolean;
  hasUnreadMessages: boolean;
  
  // 操作方法
  setConversations: (conversations: Conversation[]) => void;
  setCurrentConversationId: (id: number | null) => void;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  setLoading: (isLoading: boolean) => void;
  setHasUnreadMessages: (hasUnread: boolean) => void;
  clearCurrentConversation: () => void;
  reset: () => void;
}

export const useAssistantStore = create<AssistantState>()(
  persist(
    (set) => ({
      conversations: [],
      currentConversationId: null,
      messages: [],
      isLoading: false,
      hasUnreadMessages: false,

      setConversations: (conversations) => set({ conversations }),
      
      setCurrentConversationId: (id) => set({ currentConversationId: id }),
      
      setMessages: (messages) => set({ messages }),
      
      addMessage: (message) => set((state) => ({
        messages: [...state.messages, message],
      })),
      
      setLoading: (isLoading) => set({ isLoading }),
      
      setHasUnreadMessages: (hasUnread) => set({ hasUnreadMessages: hasUnread }),
      
      clearCurrentConversation: () => set({
        currentConversationId: null,
        messages: [],
      }),
      
      reset: () => set({
        conversations: [],
        currentConversationId: null,
        messages: [],
        isLoading: false,
        hasUnreadMessages: false,
      }),
    }),
    {
      name: 'assistant-storage',
      storage: createJSONStorage(() => sessionStorage), // 使用 sessionStorage，关闭浏览器后清除
      partialize: (state) => ({
        // 只持久化部分状态
        currentConversationId: state.currentConversationId,
        messages: state.messages,
      }),
    }
  )
);

