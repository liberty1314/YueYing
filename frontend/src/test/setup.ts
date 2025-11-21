import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeAll, vi } from 'vitest';

// 每个测试后清理
afterEach(() => {
    cleanup();
});

// 全局测试设置
beforeAll(() => {
    // Mock window.matchMedia (用于响应式测试)
    Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation((query) => ({
            matches: false,
            media: query,
            onchange: null,
            addListener: vi.fn(),
            removeListener: vi.fn(),
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            dispatchEvent: vi.fn(),
        })),
    });

    // Mock IntersectionObserver (用于懒加载测试)
    global.IntersectionObserver = class IntersectionObserver {
        constructor() { }
        disconnect() { }
        observe() { }
        takeRecords() {
            return [];
        }
        unobserve() { }
    } as any;

    // Mock ResizeObserver (用于响应式组件测试)
    global.ResizeObserver = class ResizeObserver {
        constructor() { }
        disconnect() { }
        observe() { }
        unobserve() { }
    } as any;

    // Mock scrollTo (用于滚动测试)
    window.scrollTo = vi.fn();
});

// 环境变量 Mock
process.env.NEXT_PUBLIC_API_URL = 'http://localhost:8000/api';
