/**
 * 媒体数据映射工具
 * 
 * 将不同来源的数据统一映射为标准格式
 */

interface RawMediaData {
    id?: number | string;
    external_id?: string;
    title?: string;
    name?: string;
    name_cn?: string;
    original_title?: string;
    original_name?: string;
    poster_path?: string;
    poster_url?: string;
    backdrop_path?: string;
    images?: {
        large?: string;
        common?: string;
        medium?: string;
    };
    overview?: string;
    summary?: string;
    vote_average?: number;
    rating?: number | { score?: number };
    release_date?: string;
    first_air_date?: string;
    air_date?: string;
    media_type?: string;
    content_type?: string;
    genres?: Array<{ id: number; name: string }>;
    eps?: number;
    eps_count?: number;
    runtime?: number;
    source?: string;
    year?: number;
}

export interface NormalizedMediaData {
    id: number | string;
    external_id?: string;
    title: string;
    original_title?: string;
    poster_url?: string;
    backdrop_url?: string;
    overview?: string;
    rating?: number;
    year?: number;
    media_type?: string;
    content_type?: string;
    genres?: Array<{ id: number; name: string }>;
    eps_count?: number;
    runtime?: number;
    source?: string;
}

/**
 * 标准化媒体数据
 */
export function normalizeMediaData(data: RawMediaData): NormalizedMediaData {
    // 标题
    const title = data.title || data.name || data.name_cn || '未知标题';
    const original_title = data.original_title || data.original_name;

    // 海报图片
    let poster_url = '';
    if (data.poster_path) {
        poster_url = data.poster_path.startsWith('http')
            ? data.poster_path
            : `https://image.tmdb.org/t/p/w500${data.poster_path}`;
    } else if (data.poster_url) {
        poster_url = data.poster_url;
    } else if (data.images?.large) {
        poster_url = data.images.large;
    } else if (data.images?.common) {
        poster_url = data.images.common;
    }

    // 背景图片
    let backdrop_url = '';
    if (data.backdrop_path) {
        backdrop_url = data.backdrop_path.startsWith('http')
            ? data.backdrop_path
            : `https://image.tmdb.org/t/p/original${data.backdrop_path}`;
    }

    // 简介
    const overview = data.overview || data.summary;

    // 评分
    let rating: number | undefined;
    if (typeof data.vote_average === 'number') {
        rating = data.vote_average;
    } else if (typeof data.rating === 'number') {
        rating = data.rating;
    } else if (typeof data.rating === 'object' && data.rating?.score) {
        rating = data.rating.score;
    }

    // 年份
    let year: number | undefined;
    if (data.year) {
        year = typeof data.year === 'number' ? data.year : parseInt(data.year);
    } else {
        const releaseDate = data.release_date || data.first_air_date || data.air_date;
        if (releaseDate) {
            year = new Date(releaseDate).getFullYear();
        }
    }

    // 内容类型
    const content_type = data.media_type || data.content_type;

    // 集数
    const eps_count = data.eps || data.eps_count;

    return {
        id: data.id || '',
        external_id: data.external_id,
        title,
        original_title,
        poster_url,
        backdrop_url,
        overview,
        rating,
        year,
        media_type: content_type,
        content_type,
        genres: data.genres,
        eps_count,
        runtime: data.runtime,
        source: data.source,
    };
}
