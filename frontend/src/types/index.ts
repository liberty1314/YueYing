// Common types
export type ItemType = 'movie' | 'tv' | 'anime' | 'book';
export type ItemStatus = 'want_to_watch' | 'watching' | 'watched';
export type UserRole = 'user' | 'admin';

// Legacy status types for backward compatibility
export type LegacyItemStatus = 'want' | 'in_progress' | 'completed';

// Status mapping utilities
export const statusToBackend: Record<LegacyItemStatus, ItemStatus> = {
    want: 'want_to_watch',
    in_progress: 'watching',
    completed: 'watched',
};

export const statusToFrontend: Record<ItemStatus, LegacyItemStatus> = {
    want_to_watch: 'want',
    watching: 'in_progress',
    watched: 'completed',
};

// User types
export interface User {
    id: string;
    username: string;
    email: string;
    avatar?: string;
    role: UserRole;
    is_admin: boolean;
    createdAt: string;
    updatedAt: string;
}

// User Item types
export interface UserItem {
    id: number;
    user_id: number;
    external_id: string;
    source: string;
    content_type: ItemType;
    title: string;
    original_title?: string;
    description?: string;
    poster_url?: string;
    backdrop_url?: string;
    release_date?: string;
    year?: string;
    language?: string;
    metadata?: Record<string, any>;
    status: ItemStatus;
    rating?: number; // 0-10, integer
    notes?: string;
    started_at?: string;
    completed_at?: string;
    created_at: string;
    updated_at: string;
}

// Frontend-friendly UserItem interface (for display)
export interface UserItemDisplay {
    id: number;
    itemType: ItemType;
    title: string;
    coverImage?: string;
    status: ItemStatus;
    rating?: number;
    tags?: string[];
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

// Create UserItem request
export interface CreateUserItemRequest {
    external_id: string;
    source: string;
    content_type: ItemType;
    title: string;
    original_title?: string;
    description?: string;
    poster_url?: string;
    backdrop_url?: string;
    release_date?: string;
    year?: string;
    language?: string;
    metadata?: Record<string, any>;
    status: ItemStatus;
    rating?: number;
    notes?: string;
    started_at?: string;
    completed_at?: string;
}

// Update UserItem request
export interface UpdateUserItemRequest {
    title?: string;
    status?: ItemStatus;
    rating?: number;
    notes?: string;
    started_at?: string;
    completed_at?: string;
}

// API Response types
export interface ApiResponse<T> {
    data: T;
    message?: string;
    success: boolean;
}

export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

export interface ApiError {
    message: string;
    code: string;
    details?: Record<string, any>;
}
