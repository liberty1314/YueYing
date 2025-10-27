"""
种子数据脚本

为开发和测试环境创建初始数据
"""
import sys
from pathlib import Path
from datetime import datetime, date

# 添加项目根目录到 Python 路径
sys.path.append(str(Path(__file__).parent.parent))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.core.security import get_password_hash
from app.models import (
    User,
    Item,
    ItemType,
    UserItem,
    ItemStatus,
    Tag,
    TagType,
    AdminUser,
    AdminRole,
    LLMConfig,
)


def create_seed_data(db: Session):
    """创建种子数据"""
    
    print("🌱 开始创建种子数据...\n")
    
    # 1. 创建测试用户
    print("👤 创建测试用户...")
    test_user = User(
        email="test@yueying.app",
        username="testuser",
        hashed_password=get_password_hash("password123"),
        full_name="测试用户",
        is_active=True,
        is_verified=True,
    )
    db.add(test_user)
    db.flush()
    print(f"  ✓ 创建用户: {test_user.email}")
    
    # 2. 创建管理员
    print("\n🔐 创建管理员...")
    admin = AdminUser(
        email="admin@yueying.app",
        username="admin",
        hashed_password=get_password_hash("admin123"),
        full_name="系统管理员",
        role=AdminRole.SUPER_ADMIN,
        is_active=True,
    )
    db.add(admin)
    print(f"  ✓ 创建管理员: {admin.email}")
    
    # 3. 创建标签
    print("\n🏷️  创建标签...")
    tags_data = [
        ("治愈", TagType.EMOTION, "#E8F5E9"),
        ("烧脑", TagType.EMOTION, "#FFF3E0"),
        ("感动", TagType.EMOTION, "#FCE4EC"),
        ("热血", TagType.EMOTION, "#FFEBEE"),
        ("成长", TagType.THEME, "#E3F2FD"),
        ("爱情", TagType.THEME, "#F3E5F5"),
        ("科幻", TagType.THEME, "#E0F2F1"),
        ("悬疑", TagType.THEME, "#FFF9C4"),
        ("文艺", TagType.STYLE, "#F1F8E9"),
        ("商业", TagType.STYLE, "#E0F7FA"),
    ]
    
    tags = []
    for name, tag_type, color in tags_data:
        tag = Tag(name=name, type=tag_type, color=color, is_auto=False)
        db.add(tag)
        tags.append(tag)
        print(f"  ✓ 创建标签: {name} ({tag_type.value})")
    
    db.flush()
    
    # 4. 创建示例内容
    print("\n📚 创建示例内容...")
    
    # 电影示例
    movie = Item(
        type=ItemType.MOVIE,
        title="盗梦空间",
        original_title="Inception",
        release_year=2010,
        director="克里斯托弗·诺兰",
        description="一位专业的盗贼在梦境中窃取机密...",
        genres='["科幻", "悬疑", "动作"]',
        duration=148,
        language="英语",
        country="美国",
        external_ids='{"tmdb": 27205}',
        external_ratings='{"tmdb": 8.3}',
    )
    db.add(movie)
    print(f"  ✓ 创建电影: {movie.title}")
    
    # 书籍示例
    book = Item(
        type=ItemType.BOOK,
        title="三体",
        original_title="The Three-Body Problem",
        release_year=2008,
        author="刘慈欣",
        description="描述了地球文明和三体文明的信息交流...",
        genres='["科幻", "硬科幻"]',
        duration=302,
        language="中文",
        country="中国",
        external_ids='{"douban": "2567698"}',
        external_ratings='{"douban": 8.8}',
    )
    db.add(book)
    print(f"  ✓ 创建书籍: {book.title}")
    
    # 动漫示例
    anime = Item(
        type=ItemType.ANIME,
        title="你的名字",
        original_title="君の名は",
        release_year=2016,
        director="新海诚",
        description="一个关于时空交错的浪漫故事...",
        genres='["动画", "奇幻", "爱情"]',
        duration=106,
        language="日语",
        country="日本",
        external_ids='{"anilist": 21519}',
        external_ratings='{"anilist": 8.4}',
    )
    db.add(anime)
    print(f"  ✓ 创建动漫: {anime.title}")
    
    db.flush()
    
    # 5. 创建用户记录
    print("\n📝 创建用户记录...")
    
    user_item1 = UserItem(
        user_id=test_user.id,
        item_id=movie.id,
        status=ItemStatus.DONE,
        rating=5.0,
        watched_date=date(2024, 1, 15),
        notes="非常精彩的科幻电影！",
        is_favorite=1,
    )
    db.add(user_item1)
    print(f"  ✓ 用户记录: {movie.title}")
    
    user_item2 = UserItem(
        user_id=test_user.id,
        item_id=book.id,
        status=ItemStatus.DOING,
        rating=4.5,
        progress=150,
        notes="正在阅读中，非常硬核的科幻小说",
    )
    db.add(user_item2)
    print(f"  ✓ 用户记录: {book.title}")
    
    user_item3 = UserItem(
        user_id=test_user.id,
        item_id=anime.id,
        status=ItemStatus.WANT,
    )
    db.add(user_item3)
    print(f"  ✓ 用户记录: {anime.title}")
    
    # 6. 创建 LLM 配置（仅结构，不含真实密钥）
    print("\n🤖 创建 LLM 配置...")
    llm_configs_data = [
        {
            "provider": "deepseek",
            "api_key": "sk-your-deepseek-api-key-here",
            "base_url": "https://api.deepseek.com",
            "model_name": "deepseek-chat",
            "is_active": True,
            "is_default": True,
        },
        {
            "provider": "openai",
            "api_key": "sk-your-openai-api-key-here",
            "base_url": "https://api.openai.com/v1",
            "model_name": "gpt-4",
            "is_active": False,
            "is_default": False,
        },
        {
            "provider": "claude",
            "api_key": "sk-your-claude-api-key-here",
            "base_url": "https://api.anthropic.com",
            "model_name": "claude-3-opus",
            "is_active": False,
            "is_default": False,
        },
    ]
    
    for config_data in llm_configs_data:
        llm_config = LLMConfig(**config_data)
        db.add(llm_config)
        print(f"  ✓ LLM 配置: {config_data['provider']}")
    
    # 提交所有更改
    db.commit()
    
    print("\n✅ 种子数据创建完成！\n")
    print("📊 数据统计:")
    print(f"  - 用户: 1")
    print(f"  - 管理员: 1")
    print(f"  - 标签: {len(tags)}")
    print(f"  - 内容: 3 (1电影, 1书籍, 1动漫)")
    print(f"  - 用户记录: 3")
    print(f"  - LLM配置: 3")
    print("\n🔑 测试账号:")
    print(f"  用户: test@yueying.app / password123")
    print(f"  管理员: admin@yueying.app / admin123")


def clear_all_data(db: Session):
    """清除所有数据（危险操作！）"""
    print("⚠️  警告: 即将删除所有数据...")
    confirm = input("确认删除? (yes/no): ")
    
    if confirm.lower() == "yes":
        # 按照依赖顺序删除
        db.query(LLMConfig).delete()
        db.query(UserItem).delete()
        db.query(Item).delete()
        db.query(Tag).delete()
        db.query(AdminUser).delete()
        db.query(User).delete()
        db.commit()
        print("✅ 所有数据已删除")
    else:
        print("❌ 操作已取消")


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="种子数据脚本")
    parser.add_argument(
        "--clear",
        action="store_true",
        help="清除所有数据（危险操作）",
    )
    
    args = parser.parse_args()
    
    db = SessionLocal()
    
    try:
        if args.clear:
            clear_all_data(db)
        else:
            create_seed_data(db)
    except Exception as e:
        print(f"\n❌ 错误: {e}")
        db.rollback()
        raise
    finally:
        db.close()

