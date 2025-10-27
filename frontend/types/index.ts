// 用户类型
export interface User {
  id: string
  email: string
  name?: string
  avatar?: string
  createdAt: string
  updatedAt: string
}

// 内容类型枚举
export enum ItemType {
  MOVIE = 'movie',
  TV_SERIES = 'tv_series',
  ANIME = 'anime',
  BOOK = 'book',
}

// 状态枚举
export enum ItemStatus {
  WANT = 'want', // 想看/想读
  DOING = 'doing', // 在看/在读
  DONE = 'done', // 看过/读过
}

// 内容条目
export interface Item {
  id: string
  type: ItemType
  title: string
  coverUrl?: string
  releaseYear?: number
  director?: string
  author?: string
  description?: string
  externalIds?: {
    tmdb?: number
    imdb?: string
    douban?: string
    googleBooks?: string
    anilist?: number
  }
  createdAt: string
  updatedAt: string
}

// 用户记录
export interface UserItem {
  id: string
  userId: string
  itemId: string
  item?: Item
  status: ItemStatus
  rating?: number // 1-5
  watchedDate?: string
  progress?: number
  notes?: string
  tags?: Tag[]
  createdAt: string
  updatedAt: string
}

// 标签
export interface Tag {
  id: string
  name: string
  type: 'emotion' | 'theme' | 'style' | 'custom'
  isAuto: boolean
}

// 收藏集
export interface Collection {
  id: string
  userId: string
  name: string
  description?: string
  items?: UserItem[]
  createdAt: string
  updatedAt: string
}

// API 响应类型
export interface ApiResponse<T = any> {
  data: T
  message?: string
  success: boolean
}

export interface PaginatedResponse<T = any> {
  items: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

// 错误类型
export interface ApiError {
  message: string
  code?: string
  details?: any
}

