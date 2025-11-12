#!/usr/bin/env python3
"""
清理 Redis 缓存脚本

用于清理所有缓存或特定前缀的缓存
"""
import sys
import asyncio
from pathlib import Path

# 添加项目根目录到 Python 路径
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

from app.core.redis import redis_client
from loguru import logger


async def clear_all_cache():
    """清理所有缓存"""
    try:
        client = redis_client.async_client
        
        # 获取所有键
        all_keys = await client.keys("*")
        
        if not all_keys:
            logger.info("Redis 中没有缓存数据")
            return
        
        logger.info(f"找到 {len(all_keys)} 个缓存键")
        
        # 删除所有键
        deleted = await client.delete(*all_keys)
        logger.success(f"成功清理 {deleted} 个缓存键")
        
    except Exception as e:
        logger.error(f"清理缓存失败: {e}")
        raise


async def clear_cache_by_pattern(pattern: str):
    """根据模式清理缓存"""
    try:
        client = redis_client.async_client
        
        # 获取匹配的键
        keys = await client.keys(pattern)
        
        if not keys:
            logger.info(f"没有找到匹配模式 '{pattern}' 的缓存")
            return
        
        logger.info(f"找到 {len(keys)} 个匹配的缓存键")
        
        # 删除键
        deleted = await client.delete(*keys)
        logger.success(f"成功清理 {deleted} 个缓存键")
        
    except Exception as e:
        logger.error(f"清理缓存失败: {e}")
        raise


async def list_cache_keys(pattern: str = "*"):
    """列出缓存键"""
    try:
        client = redis_client.async_client
        
        keys = await client.keys(pattern)
        
        if not keys:
            logger.info(f"没有找到匹配模式 '{pattern}' 的缓存")
            return
        
        logger.info(f"找到 {len(keys)} 个缓存键:")
        for key in keys:
            # 获取 TTL
            ttl = await client.ttl(key)
            ttl_str = f"{ttl}s" if ttl > 0 else "永久" if ttl == -1 else "已过期"
            logger.info(f"  - {key.decode() if isinstance(key, bytes) else key} (TTL: {ttl_str})")
        
    except Exception as e:
        logger.error(f"列出缓存键失败: {e}")
        raise


async def main():
    """主函数"""
    import argparse
    
    parser = argparse.ArgumentParser(description="Redis 缓存管理工具")
    parser.add_argument(
        "action",
        choices=["list", "clear", "clear-all"],
        help="操作类型: list=列出缓存, clear=清理指定模式, clear-all=清理所有"
    )
    parser.add_argument(
        "-p", "--pattern",
        default="*",
        help="缓存键匹配模式 (例如: bangumi:*, tmdb:*)"
    )
    
    args = parser.parse_args()
    
    try:
        if args.action == "list":
            await list_cache_keys(args.pattern)
        elif args.action == "clear":
            await clear_cache_by_pattern(args.pattern)
        elif args.action == "clear-all":
            confirm = input("确定要清理所有缓存吗？(yes/no): ")
            if confirm.lower() == "yes":
                await clear_all_cache()
            else:
                logger.info("操作已取消")
    except Exception as e:
        logger.error(f"执行失败: {e}")
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
