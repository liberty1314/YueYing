#!/usr/bin/env python3
"""
测试多级缓存在服务中的集成

验证外部 API 服务、用户项目服务和统计服务是否正确使用多级缓存
"""
import asyncio
import sys
from pathlib import Path

# 添加项目根目录到 Python 路径
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.core.logging import logger
from app.core.database import SessionLocal
from app.services.external_apis.tmdb import tmdb_client
from app.services.external_apis.google_books import google_books_client
from app.services.external_apis.bangumi import bangumi_client
from app.services.user_items_cache import user_items_cache_service
from app.services.home_cache import home_cache_service
from app.services.stats_service import StatsService
from app.core.cache import async_multi_level_cache_manager, multi_level_cache_manager


async def test_tmdb_cache():
    """测试 TMDB 服务的多级缓存"""
    logger.info("=" * 60)
    logger.info("测试 TMDB 多级缓存")
    logger.info("=" * 60)
    
    try:
        # 第一次调用 - 应该从 API 获取
        logger.info("第一次调用 search_movies (应该从 API 获取)")
        result1 = await tmdb_client.search_movies("The Matrix", page=1)
        logger.info(f"结果数量: {len(result1.get('results', []))}")
        
        # 第二次调用 - 应该从 L1 缓存获取
        logger.info("第二次调用 search_movies (应该从 L1 缓存获取)")
        result2 = await tmdb_client.search_movies("The Matrix", page=1)
        logger.info(f"结果数量: {len(result2.get('results', []))}")
        
        # 验证结果一致
        assert result1 == result2, "缓存结果不一致"
        logger.info("✅ TMDB 缓存测试通过")
        
    except Exception as e:
        logger.error(f"❌ TMDB 缓存测试失败: {e}")
        raise


async def test_google_books_cache():
    """测试 Google Books 服务的多级缓存"""
    logger.info("=" * 60)
    logger.info("测试 Google Books 多级缓存")
    logger.info("=" * 60)
    
    try:
        # 第一次调用
        logger.info("第一次调用 search_books (应该从 API 获取)")
        result1 = await google_books_client.search_books("Python", max_results=5)
        logger.info(f"结果数量: {len(result1.get('items', []))}")
        
        # 第二次调用
        logger.info("第二次调用 search_books (应该从 L1 缓存获取)")
        result2 = await google_books_client.search_books("Python", max_results=5)
        logger.info(f"结果数量: {len(result2.get('items', []))}")
        
        # 验证结果一致
        assert result1 == result2, "缓存结果不一致"
        logger.info("✅ Google Books 缓存测试通过")
        
    except Exception as e:
        logger.error(f"❌ Google Books 缓存测试失败: {e}")
        raise


async def test_bangumi_cache():
    """测试 Bangumi 服务的多级缓存"""
    logger.info("=" * 60)
    logger.info("测试 Bangumi 多级缓存")
    logger.info("=" * 60)
    
    try:
        # 第一次调用
        logger.info("第一次调用 get_calendar (应该从 API 获取)")
        result1 = await bangumi_client.get_calendar()
        logger.info(f"结果数量: {len(result1)}")
        
        # 第二次调用
        logger.info("第二次调用 get_calendar (应该从 L1 缓存获取)")
        result2 = await bangumi_client.get_calendar()
        logger.info(f"结果数量: {len(result2)}")
        
        # 验证结果一致
        assert result1 == result2, "缓存结果不一致"
        logger.info("✅ Bangumi 缓存测试通过")
        
    except Exception as e:
        logger.error(f"❌ Bangumi 缓存测试失败: {e}")
        raise


async def test_home_cache():
    """测试首页缓存服务"""
    logger.info("=" * 60)
    logger.info("测试首页数据缓存")
    logger.info("=" * 60)
    
    try:
        # 测试缓存数据
        test_data = {"test": "data", "items": [1, 2, 3]}
        
        logger.info("缓存测试数据")
        await home_cache_service.cache_data("test_type", test_data)
        
        logger.info("从缓存获取数据")
        cached_data = await home_cache_service.get_cached_data("test_type")
        
        assert cached_data == test_data, "缓存数据不一致"
        logger.info("✅ 首页缓存测试通过")
        
    except Exception as e:
        logger.error(f"❌ 首页缓存测试失败: {e}")
        raise


def test_stats_cache():
    """测试统计服务的多级缓存"""
    logger.info("=" * 60)
    logger.info("测试统计服务缓存")
    logger.info("=" * 60)
    
    try:
        db = SessionLocal()
        
        # 假设有用户 ID 1
        user_id = 1
        
        logger.info("第一次调用 get_overview_stats (应该从数据库获取)")
        stats1 = StatsService.get_overview_stats(db, user_id)
        logger.info(f"总记录数: {stats1.total_items}")
        
        logger.info("第二次调用 get_overview_stats (应该从 L1 缓存获取)")
        stats2 = StatsService.get_overview_stats(db, user_id)
        logger.info(f"总记录数: {stats2.total_items}")
        
        # 验证结果一致
        assert stats1.total_items == stats2.total_items, "缓存结果不一致"
        logger.info("✅ 统计服务缓存测试通过")
        
        db.close()
        
    except Exception as e:
        logger.error(f"❌ 统计服务缓存测试失败: {e}")
        raise


async def test_cache_stats():
    """测试缓存统计"""
    logger.info("=" * 60)
    logger.info("缓存统计信息")
    logger.info("=" * 60)
    
    from app.core.cache_stats import cache_stats_collector
    
    # 获取统计信息
    stats = cache_stats_collector.get_stats()
    
    logger.info(f"总命中次数: {stats['total_hits']}")
    logger.info(f"总未命中次数: {stats['total_misses']}")
    logger.info(f"命中率: {stats['hit_rate']:.2%}")
    logger.info(f"平均延迟: {stats['avg_latency_ms']:.2f}ms")
    
    # 获取热门键
    top_keys = cache_stats_collector.get_top_keys(limit=5)
    logger.info(f"\n热门缓存键 (Top 5):")
    for key_info in top_keys:
        logger.info(f"  - {key_info['key']}: {key_info['access_count']} 次访问")


async def main():
    """主测试函数"""
    logger.info("开始测试多级缓存服务集成")
    logger.info("")
    
    try:
        # 测试外部 API 服务
        await test_tmdb_cache()
        await test_google_books_cache()
        await test_bangumi_cache()
        
        # 测试内部服务
        await test_home_cache()
        test_stats_cache()
        
        # 显示缓存统计
        await test_cache_stats()
        
        logger.info("")
        logger.info("=" * 60)
        logger.info("✅ 所有测试通过！")
        logger.info("=" * 60)
        
    except Exception as e:
        logger.error(f"测试失败: {e}", exc_info=True)
        sys.exit(1)
    
    finally:
        # 清理
        await tmdb_client.close()
        await google_books_client.close()
        await bangumi_client.close()


if __name__ == "__main__":
    asyncio.run(main())
