/**
 * 导航工具函数
 * 处理内容详情页跳转逻辑
 */

import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

/**
 * 内容项类型
 */
export interface ContentItem {
  id: number;
  media_type?: string;
  content_type?: string;
  external_id?: number;
  title?: string;
  name?: string;
}

/**
 * 获取内容详情页URL
 */
export function getContentDetailUrl(item: ContentItem): string {
  // 优先使用media_type，其次使用content_type
  const type = item.media_type || item.content_type || 'movie';
  const id = item.external_id || item.id;
  
  // 根据类型返回不同的URL
  switch (type) {
    case 'movie':
      return `/detail/movie/${id}`;
    case 'tv':
      return `/detail/tv/${id}`;
    case 'book':
      return `/detail/book/${id}`;
    case 'anime':
      return `/detail/anime/${id}`;
    default:
      // 默认使用通用详情页
      return `/item/${id}`;
  }
}

/**
 * 导航到内容详情页
 */
export function navigateToDetail(router: AppRouterInstance, item: ContentItem) {
  const url = getContentDetailUrl(item);
  router.push(url);
}

/**
 * 在新标签页打开内容详情页
 */
export function openDetailInNewTab(item: ContentItem) {
  const url = getContentDetailUrl(item);
  window.open(url, '_blank');
}
