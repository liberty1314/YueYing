"""
FastAPI 主应用入口
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.core.logging import setup_logging
from app.middleware.logging_middleware import LoggingMiddleware
from app.api.routes import auth

# 设置日志
logger = setup_logging()

# 创建 FastAPI 应用
app = FastAPI(
    title=settings.PROJECT_NAME,
    description="AI驱动的个人娱乐记录平台",
    version="0.1.0",
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
    openapi_url="/openapi.json" if settings.DEBUG else None,
)

# CORS 中间件
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 日志中间件（记录所有请求/响应）
app.add_middleware(LoggingMiddleware)

# Gzip 压缩中间件
app.add_middleware(GZipMiddleware, minimum_size=1000)


# ====================================
# 注册路由
# ====================================

# 认证路由
app.include_router(auth.router, prefix="/api")

# TMDB API 路由
from app.api.routes import tmdb
app.include_router(tmdb.router, prefix="/api")

# Google Books API 路由
from app.api.routes import google_books
app.include_router(google_books.router, prefix="/api")

# Bangumi API 路由
from app.api.routes import bangumi
app.include_router(bangumi.router, prefix="/api")

# 统一搜索路由
from app.api.routes import unified_search
app.include_router(unified_search.router, prefix="/api")

# 用户记录路由
from app.api.routes import user_items
app.include_router(user_items.router, prefix="/api")

# 标签管理路由
from app.api.routes import tags
app.include_router(tags.router, prefix="/api")

# 统计数据路由
from app.api.routes import stats
app.include_router(stats.router, prefix="/api")

# LLM 路由
from app.api.routes import llm
app.include_router(llm.router, prefix="/api")

# LLM 配置路由
from app.api.routes import llm_config
app.include_router(llm_config.router, prefix="/api")

# AI 标签路由
from app.api.routes import ai_tags
app.include_router(ai_tags.router, prefix="/api")

# 用户设置路由
from app.api.routes import user_settings
app.include_router(user_settings.router, prefix="/api")


# ====================================
# 健康检查端点
# ====================================
@app.get(
    "/health",
    tags=["health"],
    summary="健康检查",
    description="检查服务运行状态"
)
async def health_check():
    """健康检查端点"""
    return JSONResponse(
        content={
            "status": "ok",
            "service": "yueying-backend",
            "version": "0.1.0",
        }
    )


# 根路径
@app.get(
    "/",
    tags=["root"],
    summary="API 根路径",
    description="欢迎页面，提供 API 基本信息和文档链接"
)
async def root():
    """根路径"""
    return {
        "message": "欢迎使用阅影·log API",
        "docs": "/docs",
        "health": "/health",
    }


# 启动事件
@app.on_event("startup")
async def startup_event():
    """应用启动时执行"""
    logger.info(f"🚀 {settings.PROJECT_NAME} 正在启动...")
    logger.info(f"📝 环境: {settings.APP_ENV}")
    logger.info(f"🔍 调试模式: {settings.DEBUG}")
    if settings.DEBUG:
        logger.info(f"📖 API文档: http://localhost:8000/docs")
    
    # 初始化数据库相关配置
    try:
        from app.core.database import SessionLocal
        from app.services.llm_config_service import LLMConfigService
        from app.services.auth import AuthService
        
        db = SessionLocal()
        try:
            # 初始化 LLM 配置（从环境变量）
            LLMConfigService.initialize_from_env(db)
            
            # 初始化管理员账户（从环境变量）
            AuthService.initialize_admin(db)
        finally:
            db.close()
    except Exception as e:
        logger.error(f"初始化配置失败: {e}")


# 关闭事件
@app.on_event("shutdown")
async def shutdown_event():
    """应用关闭时执行"""
    logger.info(f"👋 {settings.PROJECT_NAME} 正在关闭...")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,
        log_level="info",
    )


