import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
    OverviewCards,
    TypeDistributionChart,
    RatingDistributionChart,
    TimeTrendChart,
    TopTagsCloud,
} from '../index';

describe('Stats Components', () => {
    describe('OverviewCards', () => {
        it('应该渲染所有概览卡片', () => {
            const data = {
                total: 100,
                averageRating: 8.5,
                totalWatched: 50,
                totalWatching: 30,
                totalWantToWatch: 20,
            };

            render(<OverviewCards data={data} />);

            expect(screen.getByText('100')).toBeInTheDocument();
            expect(screen.getByText(/8\.5/)).toBeInTheDocument();
            expect(screen.getByText('50')).toBeInTheDocument();
            expect(screen.getByText('30')).toBeInTheDocument();
            expect(screen.getByText('20')).toBeInTheDocument();
        });

        it('应该正确显示平均评分', () => {
            const data = {
                total: 100,
                averageRating: 8.5,
                totalWatched: 50,
                totalWatching: 30,
                totalWantToWatch: 20,
            };

            render(<OverviewCards data={data} />);

            expect(screen.getByText(/8\.5/)).toBeInTheDocument();
            expect(screen.getByText('平均评分')).toBeInTheDocument();
        });
    });

    describe('TypeDistributionChart', () => {
        it('应该渲染类型分布数据', () => {
            const data = [
                { type: 'movie', count: 50 },
                { type: 'tv', count: 30 },
                { type: 'anime', count: 20 },
            ];

            render(<TypeDistributionChart data={data} />);

            expect(screen.getByText('类型分布')).toBeInTheDocument();
            expect(screen.getByText(/50/)).toBeInTheDocument();
            expect(screen.getByText(/30/)).toBeInTheDocument();
            expect(screen.getByText(/20/)).toBeInTheDocument();
        });

        it('应该在没有数据时显示空状态', () => {
            render(<TypeDistributionChart data={[]} />);

            expect(screen.getByText('类型分布')).toBeInTheDocument();
            expect(screen.getByText('暂无数据')).toBeInTheDocument();
        });
    });

    describe('RatingDistributionChart', () => {
        it('应该渲染评分分布数据', () => {
            const data = [
                { rating: 10, count: 5 },
                { rating: 9, count: 10 },
                { rating: 8, count: 15 },
            ];

            render(<RatingDistributionChart data={data} />);

            expect(screen.getByText('评分分布')).toBeInTheDocument();
            // 验证图表渲染了数据（检查计数值）
            expect(screen.getByText('5')).toBeInTheDocument();
            expect(screen.getByText('15')).toBeInTheDocument();
        });

        it('应该在没有数据时显示空状态', () => {
            render(<RatingDistributionChart data={[]} />);

            expect(screen.getByText('评分分布')).toBeInTheDocument();
            expect(screen.getByText('暂无数据')).toBeInTheDocument();
        });
    });

    describe('TimeTrendChart', () => {
        it('应该渲染时间趋势数据', () => {
            const data = [
                { date: '2024-01', count: 10 },
                { date: '2024-02', count: 15 },
                { date: '2024-03', count: 20 },
            ];

            render(<TimeTrendChart data={data} />);

            expect(screen.getByText('时间趋势')).toBeInTheDocument();
        });

        it('应该在没有数据时显示空状态', () => {
            render(<TimeTrendChart data={[]} />);

            expect(screen.getByText('时间趋势')).toBeInTheDocument();
            expect(screen.getByText('暂无数据')).toBeInTheDocument();
        });
    });

    describe('TopTagsCloud', () => {
        it('应该渲染热门标签', () => {
            const data = [
                { tag: '科幻', count: 20 },
                { tag: '动作', count: 15 },
                { tag: '喜剧', count: 10 },
            ];

            render(<TopTagsCloud data={data} />);

            expect(screen.getByText('热门标签')).toBeInTheDocument();
            expect(screen.getByText(/科幻/)).toBeInTheDocument();
            expect(screen.getByText(/动作/)).toBeInTheDocument();
            expect(screen.getByText(/喜剧/)).toBeInTheDocument();
        });

        it('应该在没有数据时显示空状态', () => {
            render(<TopTagsCloud data={[]} />);

            expect(screen.getByText('热门标签')).toBeInTheDocument();
            expect(screen.getByText('暂无数据')).toBeInTheDocument();
        });
    });
});
