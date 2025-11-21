import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { render, screen } from '@/test/utils';
import { arbitraries, generators } from './generators';

/**
 * 测试框架使用示例
 * 
 * 这个文件展示了如何使用 Vitest、@testing-library/react 和 fast-check
 * 实际项目中，请将测试文件放在对应的组件或模块旁边
 */

describe('测试框架示例', () => {
    describe('单元测试示例', () => {
        it('基础断言', () => {
            expect(1 + 1).toBe(2);
            expect('hello').toBe('hello');
            expect([1, 2, 3]).toHaveLength(3);
        });

        it('对象匹配', () => {
            const user = {
                id: '1',
                name: 'Test User',
                email: 'test@example.com',
            };

            expect(user).toMatchObject({
                name: 'Test User',
                email: 'test@example.com',
            });
        });

        it('异步测试', async () => {
            const fetchData = async () => {
                return new Promise((resolve) => {
                    setTimeout(() => resolve('data'), 100);
                });
            };

            const result = await fetchData();
            expect(result).toBe('data');
        });
    });

    describe('React 组件测试示例', () => {
        // 简单的测试组件
        function TestButton({ onClick }: { onClick?: () => void }) {
            return <button onClick={onClick}>Click me</button>;
        }

        it('应该渲染组件', () => {
            render(<TestButton />);
            expect(screen.getByText('Click me')).toBeInTheDocument();
        });

        it('应该响应用户交互', async () => {
            const handleClick = vi.fn();
            render(<TestButton onClick={handleClick} />);

            const button = screen.getByText('Click me');
            await button.click();

            expect(handleClick).toHaveBeenCalledTimes(1);
        });
    });

    describe('属性测试示例', () => {
        it('示例 1: 基础属性测试', () => {
            // 属性：任何数字加 0 等于自身
            fc.assert(
                fc.property(fc.integer(), (n) => {
                    return n + 0 === n;
                }),
                { numRuns: 100 }
            );
        });

        it('示例 2: 字符串属性测试', () => {
            // 属性：非空字符串的长度总是大于 0
            fc.assert(
                fc.property(arbitraries.nonEmptyString, (str) => {
                    return str.length > 0;
                }),
                { numRuns: 100 }
            );
        });

        it('示例 3: 数组属性测试', () => {
            // 属性：数组反转两次等于原数组
            fc.assert(
                fc.property(fc.array(fc.integer()), (arr) => {
                    const reversed = arr.slice().reverse().reverse();
                    return JSON.stringify(reversed) === JSON.stringify(arr);
                }),
                { numRuns: 100 }
            );
        });

        it('示例 4: 使用自定义生成器', () => {
            // 属性：生成的用户对象应该有有效的字段
            fc.assert(
                fc.property(generators.user(), (user) => {
                    return (
                        typeof user.id === 'string' &&
                        user.id.length > 0 &&
                        typeof user.username === 'string' &&
                        user.username.length >= 3 &&
                        user.username.length <= 20 &&
                        typeof user.email === 'string' &&
                        user.email.includes('@') &&
                        ['user', 'admin'].includes(user.role)
                    );
                }),
                { numRuns: 100 }
            );
        });

        it('示例 5: 复杂属性测试', () => {
            // 属性：用户项目的评分应该在 0-10 之间（如果存在）
            fc.assert(
                fc.property(generators.userItem(), (item) => {
                    if (item.rating === undefined) {
                        return true;
                    }
                    return item.rating >= 0 && item.rating <= 10;
                }),
                { numRuns: 100 }
            );
        });
    });

    describe('Mock 示例', () => {
        it('应该能够 Mock 函数', () => {
            const mockFn = vi.fn();
            mockFn('test');
            mockFn('test2');

            expect(mockFn).toHaveBeenCalledTimes(2);
            expect(mockFn).toHaveBeenCalledWith('test');
            expect(mockFn).toHaveBeenCalledWith('test2');
        });

        it('应该能够 Mock 返回值', () => {
            const mockFn = vi.fn();
            mockFn.mockReturnValue('mocked value');

            expect(mockFn()).toBe('mocked value');
        });

        it('应该能够 Mock 异步函数', async () => {
            const mockFn = vi.fn();
            mockFn.mockResolvedValue('async value');

            const result = await mockFn();
            expect(result).toBe('async value');
        });
    });
});
