#!/usr/bin/env python3
"""
数据库性能测试脚本

用于测试数据库优化前后的性能对比，包括：
- 查询响应时间测试
- 并发查询性能测试
- 索引效果验证
- 缓存机制测试
"""

import asyncio
import time
import statistics
from typing import List, Dict, Any
import sys
import os

# 添加项目路径
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from sqlalchemy import text
from loguru import logger

from app.core.database import SessionLocal, engine
from app.services.stats_service import StatsService
from app.services.user_item_service import UserItemService
from app.core.cache import cache_manager


class PerformanceTester:
    """性能测试器"""

    def __init__(self):
        self.results = {}

    def measure_execution_time(self, func, *args, **kwargs) -> Dict[str, Any]:
        """测量函数执行时间"""
        start_time = time.time()
        try:
            result = func(*args, **kwargs)
            end_time = time.time()
            return {
                'success': True,
                'execution_time': end_time - start_time,
                'result': result
            }
        except Exception as e:
            end_time = time.time()
            return {
                'success': False,
                'execution_time': end_time - start_time,
                'error': str(e)
            }

    def run_multiple_times(self, func, times: int = 5, *args, **kwargs) -> Dict[str, Any]:
        """多次运行函数并统计结果"""
        results = []
        for i in range(times):
            result = self.measure_execution_time(func, *args, **kwargs)
            results.append(result['execution_time'])
            time.sleep(0.1)  # 短暂延迟避免缓存干扰

        return {
            'min_time': min(results),
            'max_time': max(results),
            'avg_time': statistics.mean(results),
            'median_time': statistics.median(results),
            'std_dev': statistics.stdev(results) if len(results) > 1 else 0,
            'runs': len(results)
        }

    def test_database_indexes(self) -> Dict[str, Any]:
        """测试数据库索引效果"""
        logger.info("测试数据库索引...")

        with SessionLocal() as db:
            # 获取一个存在的用户ID进行测试
            user_result = db.execute(text("SELECT id FROM users LIMIT 1")).fetchone()
            if not user_result:
                return {'error': '没有找到测试用户'}

            user_id = user_result[0]

            # 测试1: 基础查询性能
            def basic_query():
                return db.query(text("SELECT COUNT(*) FROM user_items WHERE user_id = :user_id")).params(user_id=user_id).scalar()

            basic_stats = self.run_multiple_times(basic_query, 10)

            # 测试2: JOIN查询性能
            def join_query():
                result = db.execute(text("""
                    SELECT COUNT(*) FROM user_items ui
                    JOIN items i ON ui.item_id = i.id
                    WHERE ui.user_id = :user_id AND i.content_type = 'movie'
                """).params(user_id=user_id)).scalar()
                return result

            join_stats = self.run_multiple_times(join_query, 10)

            # 测试3: 复杂统计查询性能
            def stats_query():
                result = db.execute(text("""
                    SELECT
                        COUNT(*) as total,
                        AVG(rating) as avg_rating,
                        COUNT(CASE WHEN rating IS NOT NULL THEN 1 END) as rated_count
                    FROM user_items
                    WHERE user_id = :user_id
                """).params(user_id=user_id)).fetchone()
                return dict(result)

            stats_query_stats = self.run_multiple_times(stats_query, 10)

            return {
                'basic_query': basic_stats,
                'join_query': join_stats,
                'stats_query': stats_query_stats
            }

    def test_service_performance(self) -> Dict[str, Any]:
        """测试服务层性能"""
        logger.info("测试服务层性能...")

        with SessionLocal() as db:
            # 获取测试用户
            user_result = db.execute(text("SELECT id FROM users LIMIT 1")).fetchone()
            if not user_result:
                return {'error': '没有找到测试用户'}

            user_id = user_result[0]

            # 测试统计服务
            overview_stats = self.run_multiple_times(
                StatsService.get_overview_stats, 5, db, user_id
            )

            type_dist_stats = self.run_multiple_times(
                StatsService.get_type_distribution, 5, db, user_id
            )

            # 测试用户物品服务
            from app.schemas.user_item import UserItemFilters
            user_items_stats = self.run_multiple_times(
                UserItemService.get_user_items, 5, db, user_id, UserItemFilters()
            )

            return {
                'overview_stats': overview_stats,
                'type_distribution': type_dist_stats,
                'user_items_list': user_items_stats
            }

    def test_cache_performance(self) -> Dict[str, Any]:
        """测试缓存性能"""
        logger.info("测试缓存性能...")

        # 测试缓存设置和获取
        test_key = "perf_test_key"
        test_data = {"test": "data", "numbers": list(range(100))}

        # 测试设置缓存
        set_stats = self.run_multiple_times(
            cache_manager.set, 10, test_key, test_data, expire=60
        )

        # 测试获取缓存
        get_stats = self.run_multiple_times(
            cache_manager.get, 10, test_key
        )

        # 清理测试数据
        cache_manager.delete(test_key)

        return {
            'cache_set': set_stats,
            'cache_get': get_stats
        }

    def test_connection_pool(self) -> Dict[str, Any]:
        """测试连接池性能"""
        logger.info("测试连接池性能...")

        def simple_query():
            with SessionLocal() as db:
                return db.execute(text("SELECT 1")).scalar()

        # 测试并发查询
        async def concurrent_queries():
            tasks = []
            for i in range(10):
                tasks.append(asyncio.to_thread(simple_query))
            await asyncio.gather(*tasks)

        concurrent_stats = self.run_multiple_times(
            lambda: asyncio.run(concurrent_queries()), 3
        )

        return {
            'concurrent_queries': concurrent_stats
        }

    def generate_report(self) -> str:
        """生成性能测试报告"""
        report = []
        report.append("# 数据库性能优化测试报告")
        report.append(f"测试时间: {time.strftime('%Y-%m-%d %H:%M:%S')}")
        report.append("")

        # 数据库索引测试结果
        if 'db_indexes' in self.results:
            report.append("## 数据库索引性能测试")
            db_results = self.results['db_indexes']

            for test_name, stats in db_results.items():
                report.append(f"### {test_name}")
                report.append(f"- 最小时间: {stats['min_time']:.4f}秒")
                report.append(f"- 最大时间: {stats['max_time']:.4f}秒")
                report.append(f"- 平均时间: {stats['avg_time']:.4f}秒")
                report.append(f"- 中位数时间: {stats['median_time']:.4f}秒")
                report.append("")

        # 服务层性能测试结果
        if 'services' in self.results:
            report.append("## 服务层性能测试")
            service_results = self.results['services']

            for test_name, stats in service_results.items():
                report.append(f"### {test_name}")
                report.append(f"- 最小时间: {stats['min_time']:.4f}秒")
                report.append(f"- 最大时间: {stats['max_time']:.4f}秒")
                report.append(f"- 平均时间: {stats['avg_time']:.4f}秒")
                report.append(f"- 中位数时间: {stats['median_time']:.4f}秒")
                report.append("")

        # 缓存性能测试结果
        if 'cache' in self.results:
            report.append("## 缓存性能测试")
            cache_results = self.results['cache']

            for test_name, stats in cache_results.items():
                report.append(f"### {test_name}")
                report.append(f"- 最小时间: {stats['min_time']:.4f}秒")
                report.append(f"- 最大时间: {stats['max_time']:.4f}秒")
                report.append(f"- 平均时间: {stats['avg_time']:.4f}秒")
                report.append(f"- 中位数时间: {stats['median_time']:.4f}秒")
                report.append("")

        # 连接池测试结果
        if 'connection_pool' in self.results:
            report.append("## 连接池性能测试")
            pool_results = self.results['connection_pool']

            for test_name, stats in pool_results.items():
                report.append(f"### {test_name}")
                report.append(f"- 最小时间: {stats['min_time']:.4f}秒")
                report.append(f"- 最大时间: {stats['max_time']:.4f}秒")
                report.append(f"- 平均时间: {stats['avg_time']:.4f}秒")
                report.append(f"- 中位数时间: {stats['median_time']:.4f}秒")
                report.append("")

        return "\n".join(report)

    def run_all_tests(self) -> Dict[str, Any]:
        """运行所有性能测试"""
        logger.info("开始运行数据库性能测试...")

        try:
            # 数据库索引测试
            self.results['db_indexes'] = self.test_database_indexes()

            # 服务层性能测试
            self.results['services'] = self.test_service_performance()

            # 缓存性能测试
            self.results['cache'] = self.test_cache_performance()

            # 连接池测试
            self.results['connection_pool'] = self.test_connection_pool()

            logger.info("性能测试完成")

            # 生成报告
            report = self.generate_report()
            self.results['report'] = report

            return self.results

        except Exception as e:
            logger.error(f"性能测试失败: {e}")
            return {'error': str(e)}


def main():
    """主函数"""
    tester = PerformanceTester()
    results = tester.run_all_tests()

    if 'error' in results:
        print(f"测试失败: {results['error']}")
        return 1

    # 输出报告
    print(results['report'])

    # 保存报告到文件
    report_file = f"performance_test_report_{int(time.time())}.md"
    with open(report_file, 'w', encoding='utf-8') as f:
        f.write(results['report'])

    print(f"\n报告已保存到: {report_file}")
    return 0


if __name__ == "__main__":
    exit(main())
