"use client";

import { useState, useEffect } from "react";

const MAX_HISTORY_ITEMS = 10;
const STORAGE_KEY = "yueying_search_history";

export function useSearchHistory() {
  const [history, setHistory] = useState<string[]>([]);

  // 从 localStorage 加载历史记录
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setHistory(Array.isArray(parsed) ? parsed : []);
      }
    } catch (error) {
      console.error("Failed to load search history:", error);
    }
  }, []);

  // 保存历史记录到 localStorage
  const saveToStorage = (items: string[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error("Failed to save search history:", error);
    }
  };

  // 添加搜索记录
  const addToHistory = (query: string) => {
    if (!query.trim()) return;

    const trimmedQuery = query.trim();
    
    setHistory((prev) => {
      // 移除已存在的相同项
      const filtered = prev.filter((item) => item !== trimmedQuery);
      // 添加到开头
      const newHistory = [trimmedQuery, ...filtered].slice(0, MAX_HISTORY_ITEMS);
      saveToStorage(newHistory);
      return newHistory;
    });
  };

  // 删除单个历史记录
  const removeFromHistory = (query: string) => {
    setHistory((prev) => {
      const newHistory = prev.filter((item) => item !== query);
      saveToStorage(newHistory);
      return newHistory;
    });
  };

  // 清空所有历史记录
  const clearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error("Failed to clear search history:", error);
    }
  };

  return {
    history,
    addToHistory,
    removeFromHistory,
    clearHistory,
  };
}

