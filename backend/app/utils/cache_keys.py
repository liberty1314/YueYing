"""
缓存键常量定义

统一管理所有缓存键的前缀，方便维护和管理
"""


class CacheKeys:
    """缓存键常量"""

    # 用户相关
    USER_BY_ID = "user:id"
    USER_BY_EMAIL = "user:email"
    USER_BY_USERNAME = "user:username"
    USER_SETTINGS = "user:settings"

    # 内容相关
    ITEM_BY_ID = "item:id"
    ITEM_BY_EXTERNAL_ID = "item:external"
    ITEM_SEARCH = "item:search"

    # 第三方 API 缓存
    TMDB_MOVIE = "tmdb:movie"
    TMDB_TV = "tmdb:tv"
    TMDB_SEARCH = "tmdb:search"
    DOUBAN_MOVIE = "douban:movie"
    DOUBAN_BOOK = "douban:book"
    GOOGLE_BOOKS = "google:books"
    ANILIST_ANIME = "anilist:anime"

    # 统计数据
    STATS_USER = "stats:user"
    STATS_ITEM = "stats:item"
    STATS_SYSTEM = "stats:system"

    # 推荐系统
    RECOMMEND_USER = "recommend:user"
    RECOMMEND_ITEM = "recommend:item"

    # API 限流
    RATE_LIMIT_API = "ratelimit:api"
    RATE_LIMIT_USER = "ratelimit:user"

    # 会话
    SESSION = "session"

    # 验证码
    VERIFICATION_CODE = "verify:code"
    PASSWORD_RESET = "verify:password_reset"


class CacheTTL:
    """缓存过期时间常量（秒）"""

    # 短期缓存（5分钟）
    SHORT = 5 * 60

    # 中期缓存（30分钟）
    MEDIUM = 30 * 60

    # 长期缓存（1小时）
    LONG = 60 * 60

    # 超长期缓存（1天）
    VERY_LONG = 24 * 60 * 60

    # 第三方 API 缓存（1小时）
    API_CACHE = 60 * 60

    # 用户会话（7天）
    SESSION = 7 * 24 * 60 * 60

    # 验证码（10分钟）
    VERIFICATION_CODE = 10 * 60

    # 密码重置（30分钟）
    PASSWORD_RESET = 30 * 60

    # 永不过期
    NEVER = None

