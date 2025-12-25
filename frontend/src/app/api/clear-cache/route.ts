/**
 * 清除 Middleware 缓存的 API 路由
 * 
 * 用于在系统设置更新后立即清除缓存，确保 middleware 使用最新的设置
 */

import { NextResponse } from 'next/server';
import { clearSettingsCache } from '@/middleware';

export async function POST() {
    try {
        // 清除 middleware 的设置缓存
        clearSettingsCache();

        return NextResponse.json({
            success: true,
            message: 'Cache cleared successfully',
        });
    } catch (error) {
        console.error('[API] Error clearing cache:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Failed to clear cache',
            },
            { status: 500 }
        );
    }
}
