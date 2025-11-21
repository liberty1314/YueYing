/**
 * 用户库操作工具函数
 * 处理添加/移除内容到个人库的逻辑
 */

import { api, APIError } from '@/lib/apiClient';

/**
 * 内容项接口
 */
export interface MediaItem {
  id: number;
  external_id?: number;
  title?: string;
  name?: string;
  original_title?: string;
  content_type?: string;
  media_type?: string;
  poster_path?: string;
  backdrop_path?: string;
  overview?: string;
  vote_average?: number;
  release_date?: string;
  first_air_date?: string;
}

/**
 * 添加到库的状态
 */
export type LibraryStatus = 
  | 'want_to_watch'  // 想看
  | 'watching'       // 在看
  | 'watched'        // 看过
  | 'on_hold'        // 搁置
  | 'dropped';       // 弃坑

/**
 * 添加内容到库的请求参数
 */
interface AddToLibraryParams {
  external_id: number;
  content_type: string;
  title: string;
  original_title?: string;
  poster_url?: string;
  backdrop_url?: string;
  overview?: string;
  rating?: number;
  release_date?: string;
  status?: LibraryStatus;
}

/**
 * 将TMDB图片路径转换为完整URL
 */
function getImageUrl(path?: string): string | undefined {
  if (!path) return undefined;
  if (path.startsWith('http')) return path;
  return `https://image.tmdb.org/t/p/w500${path}`;
}

/**
 * 添加内容到库
 */
export async function addToLibrary(
  item: MediaItem,
  status: LibraryStatus = 'want_to_watch'
): Promise<{ success: boolean; message: string; data?: any }> {
  try {
    // 构建请求参数
    const params: AddToLibraryParams = {
      external_id: item.external_id || item.id,
      content_type: item.media_type || item.content_type || 'movie',
      title: item.title || item.name || '未知标题',
      original_title: item.original_title,
      poster_url: getImageUrl(item.poster_path),
      backdrop_url: getImageUrl(item.backdrop_path),
      overview: item.overview,
      rating: item.vote_average,
      release_date: item.release_date || item.first_air_date,
      status,
    };

    // 调用API
    const result = await api.post('/user-items', params, true);

    return {
      success: true,
      message: '添加成功',
      data: result,
    };
  } catch (error) {
    if (error instanceof APIError) {
      // API错误
      return {
        success: false,
        message: error.detail || '添加失败',
      };
    }
    // 其他错误
    return {
      success: false,
      message: error instanceof Error ? error.message : '添加失败',
    };
  }
}

/**
 * 从库中移除内容
 */
export async function removeFromLibrary(
  itemId: number
): Promise<{ success: boolean; message: string }> {
  try {
    await api.delete(`/user-items/${itemId}`, true);
    return {
      success: true,
      message: '移除成功',
    };
  } catch (error) {
    if (error instanceof APIError) {
      return {
        success: false,
        message: error.detail || '移除失败',
      };
    }
    return {
      success: false,
      message: error instanceof Error ? error.message : '移除失败',
    };
  }
}

/**
 * 检查内容是否在库中
 */
export async function checkInLibrary(
  externalId: number,
  contentType: string
): Promise<{ inLibrary: boolean; itemId?: number }> {
  try {
    const result = await api.get<any>(
      `/user-items/check?external_id=${externalId}&content_type=${contentType}`,
      true
    );
    return {
      inLibrary: result.in_library || false,
      itemId: result.item_id,
    };
  } catch (error) {
    return { inLibrary: false };
  }
}
