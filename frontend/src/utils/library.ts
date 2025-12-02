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
  external_id: string;
  source: string;
  content_type: string;
  title: string;
  original_title?: string;
  poster_url?: string;
  backdrop_url?: string;
  description?: string;
  rating?: number;
  release_date?: string;
  status?: LibraryStatus;
}

/**
 * 将图片路径转换为完整URL
 */
function getImageUrl(path?: string): string | undefined {
  if (!path) return undefined;
  // 如果已经是完整URL，直接返回
  if (path.startsWith('http')) return path;
  // 否则假设是TMDB路径
  return `https://image.tmdb.org/t/p/w500${path}`;
}

/**
 * 推断数据源
 */
function inferSource(item: any): string {
  // 如果item中已经有source字段，直接使用
  if (item.source) {
    return item.source;
  }

  // 根据数据特征推断
  if (item.media_type === 'movie' || item.media_type === 'tv') {
    return 'tmdb';
  }

  if (item.type === 'book' || item.volumeInfo) {
    return 'google_books';
  }

  if (item.type === 'anime' || item.type === 'game' || item.name_cn) {
    return 'bangumi';
  }

  // 默认返回tmdb
  return 'tmdb';
}

/**
 * 添加内容到库
 */
export async function addToLibrary(
  item: any,
  status: LibraryStatus = 'want_to_watch'
): Promise<{ success: boolean; message: string; data?: any }> {
  try {
    // 提取海报URL（支持TMDB和Bangumi格式）
    let posterUrl: string | undefined = undefined;
    if (item.poster_path) {
      posterUrl = getImageUrl(item.poster_path);
    } else if (item.poster_url) {
      posterUrl = item.poster_url;
    } else if (item.images?.large) {
      posterUrl = item.images.large;
    } else if (item.images?.common) {
      posterUrl = item.images.common;
    }

    // 提取背景图URL
    let backdropUrl: string | undefined = undefined;
    if (item.backdrop_path) {
      backdropUrl = getImageUrl(item.backdrop_path);
    }

    // 提取标题
    const title = item.title || item.name || item.name_cn || '未知标题';
    const originalTitle = item.original_title || item.original_name || item.name;

    // 提取简介（支持多种字段名）
    const description = item.description || item.overview || item.summary;

    // 提取评分
    const rating = item.vote_average || item.rating?.score;

    // 提取发布日期
    const releaseDate = item.release_date || item.first_air_date || item.air_date;

    // 推断数据源
    const source = inferSource(item);

    const contentType = item.media_type || item.content_type || 'movie';

    // 构建请求参数
    const params: AddToLibraryParams = {
      external_id: String(item.external_id || item.id), // 转换为字符串
      source,
      content_type: contentType,
      title,
      original_title: originalTitle,
      poster_url: posterUrl,
      backdrop_url: backdropUrl,
      description,  // 使用 description 字段名，与后端保持一致
      rating: rating ? Math.round(rating) : undefined, // 四舍五入为整数
      release_date: releaseDate,
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
      // API错误 - 确保返回字符串而不是对象
      const errorMessage = typeof error.detail === 'string'
        ? error.detail
        : JSON.stringify(error.detail);
      return {
        success: false,
        message: errorMessage || '添加失败',
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
