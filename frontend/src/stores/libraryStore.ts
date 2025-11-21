import { create } from 'zustand';
import type { ItemType, ItemStatus } from '@/types';

interface LibraryFilters {
    content_type?: ItemType;
    status?: ItemStatus;
    tags?: string[];
    search?: string;
    rating?: {
        min?: number;
        max?: number;
    };
}

type SortOption =
    | 'createdAt-desc'
    | 'createdAt-asc'
    | 'updatedAt-desc'
    | 'updatedAt-asc'
    | 'title-asc'
    | 'title-desc'
    | 'rating-desc'
    | 'rating-asc';

type ViewMode = 'grid' | 'list';

interface LibraryState {
    filters: LibraryFilters;
    sortBy: SortOption;
    viewMode: ViewMode;
    page: number;
    pageSize: number;
}

interface LibraryActions {
    setFilters: (filters: LibraryFilters) => void;
    updateFilter: (key: keyof LibraryFilters, value: unknown) => void;
    clearFilters: () => void;
    setSortBy: (sortBy: SortOption) => void;
    setViewMode: (mode: ViewMode) => void;
    setPage: (page: number) => void;
    setPageSize: (pageSize: number) => void;
    resetPagination: () => void;
}

type LibraryStore = LibraryState & LibraryActions;

const initialState: LibraryState = {
    filters: {},
    sortBy: 'updatedAt-desc',
    viewMode: 'grid',
    page: 1,
    pageSize: 20,
};

export const useLibraryStore = create<LibraryStore>()((set) => ({
    // State
    ...initialState,

    // Actions
    setFilters: (filters) =>
        set({
            filters,
            page: 1, // Reset to first page when filters change
        }),

    updateFilter: (key, value) =>
        set((state) => ({
            filters: {
                ...state.filters,
                [key]: value,
            },
            page: 1, // Reset to first page when filter changes
        })),

    clearFilters: () =>
        set({
            filters: {},
            page: 1,
        }),

    setSortBy: (sortBy) =>
        set({
            sortBy,
            page: 1, // Reset to first page when sort changes
        }),

    setViewMode: (mode) =>
        set({
            viewMode: mode,
        }),

    setPage: (page) =>
        set({
            page,
        }),

    setPageSize: (pageSize) =>
        set({
            pageSize,
            page: 1, // Reset to first page when page size changes
        }),

    resetPagination: () =>
        set({
            page: 1,
        }),
}));
