#!/usr/bin/env python3
"""
测试多级缓存管理器的 delete_pattern 功能
"""
import sys
import time
from app.core.cache import multi_level_cache_manager

def test_delete_pattern():
    """测试模式删除功能"""
    print("=" * 60)
    print("测试多级缓存管理器的 delete_pattern 功能")
    print("=" * 60)
    
    # 1. 设置测试数据
    print("\n1. 设置测试数据...")
    test_keys = [
        ("user:123:profile", {"name": "张三", "age": 25}),
        ("user:123:items:1", {"title": "电影1"}),
        ("user:123:items:2", {"title": "电影2"}),
        ("user:123:stats", {"count": 10}),
        ("user:456:profile", {"name": "李四", "age": 30}),
        ("api:movie:550", {"title": "Fight Club"}),
    ]
    
    for key, value in test_keys:
        multi_level_cache_manager.set(key, value, l1_ttl=300, l2_ttl=3600)
        print(f"  ✓ 设置: {key}")
    
    # 等待一下确保数据写入
    time.sleep(0.1)
    
    # 2. 验证数据存在
    print("\n2. 验证数据存在...")
    for key, _ in test_keys:
        value = multi_level_cache_manager.get(key)
        if value:
            print(f"  ✓ 存在: {key}")
        else:
            print(f"  ✗ 缺失: {key}")
    
    # 3. 测试模式删除
    print("\n3. 测试模式删除 'user:123:*'...")
    deleted_count = multi_level_cache_manager.delete_pattern("user:123:*")
    print(f"  删除了 {deleted_count} 个键")
    
    # 4. 验证删除结果
    print("\n4. 验证删除结果...")
    expected_deleted = ["user:123:profile", "user:123:items:1", "user:123:items:2", "user:123:stats"]
    expected_remaining = ["user:456:profile", "api:movie:550"]
    
    print("  应该被删除的键:")
    for key in expected_deleted:
        value = multi_level_cache_manager.get(key)
        if value is None:
            print(f"    ✓ 已删除: {key}")
        else:
            print(f"    ✗ 仍存在: {key}")
    
    print("  应该保留的键:")
    for key in expected_remaining:
        value = multi_level_cache_manager.get(key)
        if value is not None:
            print(f"    ✓ 已保留: {key}")
        else:
            print(f"    ✗ 被误删: {key}")
    
    # 5. 清理
    print("\n5. 清理测试数据...")
    multi_level_cache_manager.delete_pattern("user:*")
    multi_level_cache_manager.delete_pattern("api:*")
    print("  ✓ 清理完成")
    
    print("\n" + "=" * 60)
    print("测试完成！")
    print("=" * 60)

if __name__ == "__main__":
    try:
        test_delete_pattern()
    except Exception as e:
        print(f"\n错误: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
