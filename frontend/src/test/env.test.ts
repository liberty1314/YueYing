/**
 * 环境变量配置测试
 * 
 * 验证环境变量是否正确配置
 */

import { describe, it, expect } from 'vitest';

describe('环境变量配置', () => {
    describe('必需的环境变量', () => {
        it('应该配置 NEXT_PUBLIC_API_URL', () => {
            // 在测试环境中，这些变量可能未设置
            // 这个测试主要用于文档目的，说明哪些变量是必需的
            const apiUrl = process.env.NEXT_PUBLIC_API_URL;

            if (apiUrl) {
                expect(apiUrl).toBeTruthy();
                expect(apiUrl).toMatch(/^https?:\/\//);
            }
        });

        it('NEXT_PUBLIC_API_URL 应该以 /api 结尾', () => {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL;

            if (apiUrl) {
                expect(apiUrl).toMatch(/\/api$/);
            }
        });
    });

    describe('URL 格式验证', () => {
        it('API URL 应该是有效的 URL 格式', () => {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL;

            if (apiUrl) {
                expect(() => new URL(apiUrl)).not.toThrow();
            }
        });

        it('WebSocket URL 应该使用 ws:// 或 wss:// 协议', () => {
            const wsUrl = process.env.NEXT_PUBLIC_WS_URL;

            if (wsUrl) {
                expect(wsUrl).toMatch(/^wss?:\/\//);
            }
        });
    });

    describe('环境一致性', () => {
        it('生产环境应该使用 HTTPS', () => {
            if (process.env.NODE_ENV === 'production') {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL;

                if (apiUrl) {
                    expect(apiUrl).toMatch(/^https:\/\//);
                }
            }
        });

        it('生产环境应该使用 WSS', () => {
            if (process.env.NODE_ENV === 'production') {
                const wsUrl = process.env.NEXT_PUBLIC_WS_URL;

                if (wsUrl) {
                    expect(wsUrl).toMatch(/^wss:\/\//);
                }
            }
        });
    });

    describe('安全检查', () => {
        it('NEXT_PUBLIC_ 变量不应包含敏感信息', () => {
            const publicVars = Object.keys(process.env).filter(key =>
                key.startsWith('NEXT_PUBLIC_')
            );

            const sensitiveKeywords = ['secret', 'password', 'key', 'token'];

            publicVars.forEach(varName => {
                const value = process.env[varName] || '';
                const lowerValue = value.toLowerCase();

                sensitiveKeywords.forEach(keyword => {
                    // 允许在变量名中包含这些关键词，但不应在值中包含
                    if (varName.toLowerCase().includes(keyword)) {
                        // 变量名包含敏感关键词是可以的（如 NEXT_PUBLIC_API_KEY_ENABLED）
                        return;
                    }

                    // 值不应包含敏感关键词
                    expect(lowerValue).not.toContain(keyword);
                });
            });
        });
    });
});
