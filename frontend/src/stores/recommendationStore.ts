/**
 * Recommendation Store - 推荐状态管理
 * 
 * 管理推荐策略、推荐结果和相关状态
 */

import { create } from 'zustand';

export type RecommendationStrategy = 'weighted' | 'cascade' | 'switch';

export interface RecommendationItem {
  id: number;
  title: string;
  original_title?: string;
  content_type: 'movie' | 'tv' | 'anime' | 'book';
  poster_url?: string;
  backdrop_url?: string;
  overview?: string;
  rating?: number;
  year?: number;
  reason: string;
  match_score: number;
  tags?: string[];
  source?: string;
  external_id?: string;
}

interface RecommendationState {
  strategy: RecommendationStrategy;
  recommendations: RecommendationItem[];
  exploreItems: RecommendationItem[];
  loading: boolean;
  error: string | null;
}

interface RecommendationActions {
  setStrategy: (strategy: RecommendationStrategy) => void;
  setRecommendations: (items: RecommendationItem[]) => void;
  setExploreItems: (items: RecommendationItem[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  refreshRecommendations: () => Promise<void>;
  fetchExploreItems: () => Promise<void>;
  clearError: () => void;
}

type RecommendationStore = RecommendationState & RecommendationActions;

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export const useRecommendationStore = create<RecommendationStore>()((set, get) => ({
  // State
  strategy: 'weighted',
  recommendations: [],
  exploreItems: [],
  loading: false,
  error: null,

  // Actions
  setStrategy: (strategy) => {
    set({ strategy });
    get().refreshRecommendations();
  },

  setRecommendations: (items) => set({ recommendations: items }),

  setExploreItems: (items) => set({ exploreItems: items }),

  setLoading: (loading) => set({ loading }),

  setError: (error) => set({ error }),

  clearError: () => set({ error: null }),

  refreshRecommendations: async () => {
    const { strategy } = get();

    try {
      set({ loading: true, error: null });

      // 从authStore获取token
      const authStorage = typeof window !== 'undefined' ? localStorage.getItem('auth-storage') : null;
      let token = null;
      if (authStorage) {
        try {
          const parsed = JSON.parse(authStorage);
          token = parsed.state?.token;
        } catch (e) {
          console.error('解析auth-storage失败:', e);
        }
      }

      if (!token) {
        throw new Error('未登录，请先登录');
      }

      const response = await fetch(
        `${API_BASE_URL}/recommendations/for-you?strategy=${strategy}&limit=20`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || '获取推荐失败');
      }

      const data = await response.json();

      // 适配后端返回的数据格式
      const items = (data.recommendations || []).map((item: any) => ({
        id: item.item_id,
        title: item.title,
        original_title: item.original_title,
        content_type: item.content_type,
        poster_url: item.poster_url,
        backdrop_url: item.backdrop_url,
        year: item.year,
        rating: item.score ? item.score * 10 : undefined,
        reason: `推荐分数: ${(item.score * 100).toFixed(0)}%`,
        match_score: item.score * 100,
        tags: item.genres,
        source: 'recommendation',
      }));

      set({
        recommendations: items,
        loading: false
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '获取推荐失败',
        loading: false
      });
    }
  },

  fetchExploreItems: async () => {
    try {
      set({ loading: true, error: null });

      // 从authStore获取token
      const authStorage = typeof window !== 'undefined' ? localStorage.getItem('auth-storage') : null;
      let token = null;
      if (authStorage) {
        try {
          const parsed = JSON.parse(authStorage);
          token = parsed.state?.token;
        } catch (e) {
          console.error('解析auth-storage失败:', e);
        }
      }

      if (!token) {
        throw new Error('未登录，请先登录');
      }

      const response = await fetch(
        `${API_BASE_URL}/recommendations/discover?limit=24`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || '获取探索内容失败');
      }

      const data = await response.json();

      // 适配后端返回的数据格式
      const items = (data.recommendations || []).map((item: any) => ({
        id: item.item_id,
        title: item.title,
        original_title: item.original_title,
        content_type: item.content_type,
        poster_url: item.poster_url,
        backdrop_url: item.backdrop_url,
        year: item.year,
        rating: item.score ? item.score * 10 : undefined,
        reason: '探索发现',
        match_score: item.score * 100,
        tags: item.genres,
        source: 'discover',
      }));

      set({
        exploreItems: items,
        loading: false
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '获取探索内容失败',
        loading: false
      });
    }
  },
}));
