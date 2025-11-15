"""
缓存预热服务

在应用启动或定期执行时预加载热点数据到缓存中
"""
from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
from datetime import datetime
from dataclasses import dataclass, field
from enum import Enum

from sqlalchemy.orm import Session

from app.core.logging import logger
from app.core.cache import multi_level_cache_manager
from app.core.cache_config import CacheDataType, cache_config_manager
from app.core.database import get_db


class WarmingStatus(str, Enum):
    """预热状态"""
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"


@dataclass
class WarmingResult:
    """预热结果"""
    strategy_name: str
    status: WarmingStatus
    items_warmed: int = 0
    duration_seconds: float = 0.0
    error_message: Optional[str] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    
    def to_dict(self) -> Dict[str, Any]:
        """转换为字典"""
        return {
            "strategy_name": self.strategy_name,
            "status": self.status.value,
            "items_warmed": self.items_warmed,
            "duration_seconds": round(self.duration_seconds, 2),
            "error_message": self.error_message,
            "started_at": self.started_at.isoformat() if self.started_at else None,
            "completed_at": self.completed_at.isoformat() if self.completed_at else None,
        }


class CacheWarmingStrategy(ABC):
    """
    缓存预热策略抽象基类
    
    所有具体的预热策略都应该继承此类并实现 warm() 方法
    """
    
    def __init__(self, name: str, description: str = ""):
        """
        初始化预热策略
        
        Args:
            name: 策略名称
            description: 策略描述
        """
        self.name = name
        self.description = description
    
    @abstractmethod
    def warm(self, db: Session, batch_size: int = 100) -> WarmingResult:
        """
        执行预热
        
        Args:
            db: 数据库会话
            batch_size: 批次大小

        Returns:
            预热结果
        """
        pass
    
    def _create_result(
        self,
        status: WarmingStatus,
        items_warmed: int = 0,
        duration: float = 0.0,
        error: Optional[str] = None
    ) -> WarmingResult:
        """
        创建预热结果
        
        Args:
            status: 状态
            items_warmed: 预热的项目数
            duration: 持续时间（秒）
            error: 错误消息

        Returns:
            预热结果
        """
        return WarmingResult(
            strategy_name=self.name,
            status=status,
            items_warmed=items_warmed,
            duration_seconds=duration,
            error_message=error,
            started_at=datetime.now() if status == WarmingStatus.RUNNING else None,
            completed_at=datetime.now() if status in [WarmingStatus.COMPLETED, WarmingStatus.FAILED] else None,
        )


class UserItemsWarmingStrategy(CacheWarmingStrategy):
    """
    用户内容记录预热策略
    
    预热活跃用户最近的内容记录
    """
    
    def __init__(self):
        super().__init__(
            name="user_items",
            description="预热活跃用户的内容记录"
        )
    
    def warm(self, db: Session, batch_size: int = 100) -> WarmingResult:
        """
        执行预热
        
        Args:
            db: 数据库会话
            batch_size: 批次大小

        Returns:
            预热结果
        """
        import time
        from app.models.user_item import UserItem
        from app.models.user import User
        
        start_time = time.time()
        items_warmed = 0
        
        try:
            logger.info(f"开始预热用户内容记录，批次大小: {batch_size}")
            
            # 获取活跃用户（最近有活动的用户）
            active_users = (
                db.query(User)
                .filter(User.is_active == True)
                .order_by(User.updated_at.desc())
                .limit(batch_size)
                .all()
            )
            
            logger.info(f"找到 {len(active_users)} 个活跃用户")
            
            # 为每个用户预热最近的内容记录
            for user in active_users:
                # 获取用户最近的内容记录（包含关联的 Item 信息）
                recent_items = (
                    db.query(UserItem)
                    .filter(UserItem.user_id == user.id)
                    .order_by(UserItem.updated_at.desc())
                    .limit(20)  # 每个用户最多预热20条记录
                    .all()
                )
                
                # 缓存用户的内容记录列表
                if recent_items:
                    cache_key = f"user:{user.id}:items:recent"
                    items_data = []
                    
                    for user_item in recent_items:
                        # 通过关联获取 Item 信息
                        if user_item.item:
                            items_data.append({
                                "id": user_item.id,
                                "title": user_item.item.title,
                                "content_type": user_item.item.content_type,
                                "status": user_item.status,
                                "rating": user_item.rating,
                            })
                    
                    # 使用配置的 TTL
                    if items_data:
                        multi_level_cache_manager.set_with_data_type(
                            cache_key,
                            items_data,
                            CacheDataType.USER_ITEMS
                        )
                        
                        items_warmed += len(items_data)
                    
                    # 同时缓存每个内容记录的详情
                    for user_item in recent_items:
                        if user_item.item:
                            item_cache_key = f"user:{user.id}:item:{user_item.id}"
                            item_data = {
                                "id": user_item.id,
                                "user_id": user_item.user_id,
                                "item_id": user_item.item_id,
                                "title": user_item.item.title,
                                "content_type": user_item.item.content_type,
                                "status": user_item.status,
                                "rating": user_item.rating,
                                "notes": user_item.notes,
                                "tags": [tag.tag.name for tag in user_item.tags] if user_item.tags else [],
                                "created_at": user_item.created_at.isoformat() if user_item.created_at else None,
                                "updated_at": user_item.updated_at.isoformat() if user_item.updated_at else None,
                            }
                            
                            multi_level_cache_manager.set_with_data_type(
                                item_cache_key,
                                item_data,
                                CacheDataType.USER_ITEMS
                            )
            
            duration = time.time() - start_time
            logger.info(
                f"用户内容记录预热完成: {items_warmed} 条记录, "
                f"耗时 {duration:.2f}s"
            )
            
            return self._create_result(
                status=WarmingStatus.COMPLETED,
                items_warmed=items_warmed,
                duration=duration
            )
        
        except Exception as e:
            duration = time.time() - start_time
            error_msg = f"预热失败: {str(e)}"
            logger.error(error_msg, exc_info=True)
            
            return self._create_result(
                status=WarmingStatus.FAILED,
                items_warmed=items_warmed,
                duration=duration,
                error=error_msg
            )


class PopularContentWarmingStrategy(CacheWarmingStrategy):
    """
    热门内容预热策略
    
    预热访问频率最高的内容
    """
    
    def __init__(self):
        super().__init__(
            name="popular_content",
            description="预热热门内容"
        )
    
    def warm(self, db: Session, batch_size: int = 100) -> WarmingResult:
        """
        执行预热
        
        Args:
            db: 数据库会话
            batch_size: 批次大小

        Returns:
            预热结果
        """
        import time
        from sqlalchemy import func
        from app.models.user_item import UserItem
        from app.models.item import Item
        
        start_time = time.time()
        items_warmed = 0
        
        try:
            logger.info(f"开始预热热门内容，批次大小: {batch_size}")
            
            # 获取最受欢迎的内容（按用户数量排序）
            # 通过 JOIN 关联 UserItem 和 Item 表
            popular_items = (
                db.query(
                    Item.external_id,
                    Item.content_type,
                    Item.title,
                    func.count(UserItem.id).label('user_count')
                )
                .join(UserItem, UserItem.item_id == Item.id)
                .filter(Item.external_id.isnot(None))
                .group_by(Item.external_id, Item.content_type, Item.title)
                .order_by(func.count(UserItem.id).desc())
                .limit(batch_size)
                .all()
            )
            
            logger.info(f"找到 {len(popular_items)} 个热门内容")
            
            # 缓存热门内容列表
            for item in popular_items:
                cache_key = f"popular:{item.content_type}:{item.external_id}"
                item_data = {
                    "external_id": item.external_id,
                    "content_type": item.content_type,
                    "title": item.title,
                    "user_count": item.user_count,
                }
                
                # 使用较长的 TTL 缓存热门内容
                multi_level_cache_manager.set_with_data_type(
                    cache_key,
                    item_data,
                    CacheDataType.SEARCH_RESULTS
                )
                
                items_warmed += 1
            
            duration = time.time() - start_time
            logger.info(
                f"热门内容预热完成: {items_warmed} 个内容, "
                f"耗时 {duration:.2f}s"
            )
            
            return self._create_result(
                status=WarmingStatus.COMPLETED,
                items_warmed=items_warmed,
                duration=duration
            )
        
        except Exception as e:
            duration = time.time() - start_time
            error_msg = f"预热失败: {str(e)}"
            logger.error(error_msg, exc_info=True)
            
            return self._create_result(
                status=WarmingStatus.FAILED,
                items_warmed=items_warmed,
                duration=duration,
                error=error_msg
            )


class CacheWarmingService:
    """
    缓存预热服务
    
    管理和执行缓存预热策略
    """
    
    def __init__(self):
        """初始化预热服务"""
        self.strategies: List[CacheWarmingStrategy] = []
        self.warming_history: List[WarmingResult] = []
        self.is_warming = False
        
        # 注册默认策略
        self._register_default_strategies()
        
        logger.info("缓存预热服务已初始化")
    
    def _register_default_strategies(self):
        """注册默认预热策略"""
        self.register_strategy(UserItemsWarmingStrategy())
        self.register_strategy(PopularContentWarmingStrategy())
    
    def register_strategy(self, strategy: CacheWarmingStrategy):
        """
        注册预热策略
        
        Args:
            strategy: 预热策略
        """
        self.strategies.append(strategy)
        logger.info(f"注册预热策略: {strategy.name}")
    
    def get_strategies(self) -> List[Dict[str, str]]:
        """
        获取所有策略
        
        Returns:
            策略列表
        """
        return [
            {
                "name": strategy.name,
                "description": strategy.description,
            }
            for strategy in self.strategies
        ]
    
    def warm_all(self, batch_size: Optional[int] = None) -> List[WarmingResult]:
        """
        执行所有预热策略
        
        Args:
            batch_size: 批次大小，None 使用配置的默认值

        Returns:
            预热结果列表
        """
        if self.is_warming:
            logger.warning("预热正在进行中，跳过本次执行")
            return []
        
        self.is_warming = True
        results = []
        
        try:
            # 获取批次大小
            if batch_size is None:
                config = cache_config_manager.get_config()
                batch_size = config.warming_batch_size
            
            logger.info(f"开始执行所有预热策略，批次大小: {batch_size}")
            
            # 获取数据库会话
            db = next(get_db())
            
            try:
                # 执行每个策略
                for strategy in self.strategies:
                    logger.info(f"执行预热策略: {strategy.name}")
                    result = strategy.warm(db, batch_size)
                    results.append(result)
                    
                    # 记录到历史
                    self.warming_history.append(result)
                    
                    # 限制历史记录数量
                    if len(self.warming_history) > 100:
                        self.warming_history = self.warming_history[-100:]
                
                logger.info(f"所有预热策略执行完成，共 {len(results)} 个策略")
            
            finally:
                db.close()
        
        except Exception as e:
            logger.error(f"预热执行失败: {e}", exc_info=True)
        
        finally:
            self.is_warming = False
        
        return results
    
    def warm_strategy(
        self,
        strategy_name: str,
        batch_size: Optional[int] = None
    ) -> Optional[WarmingResult]:
        """
        执行指定的预热策略
        
        Args:
            strategy_name: 策略名称
            batch_size: 批次大小

        Returns:
            预热结果，如果策略不存在则返回 None
        """
        # 查找策略
        strategy = next(
            (s for s in self.strategies if s.name == strategy_name),
            None
        )
        
        if not strategy:
            logger.warning(f"预热策略不存在: {strategy_name}")
            return None
        
        # 获取批次大小
        if batch_size is None:
            config = cache_config_manager.get_config()
            batch_size = config.warming_batch_size
        
        logger.info(f"执行预热策略: {strategy_name}")
        
        # 获取数据库会话
        db = next(get_db())
        
        try:
            result = strategy.warm(db, batch_size)
            
            # 记录到历史
            self.warming_history.append(result)
            
            # 限制历史记录数量
            if len(self.warming_history) > 100:
                self.warming_history = self.warming_history[-100:]
            
            return result
        
        finally:
            db.close()
    
    def get_warming_status(self) -> Dict[str, Any]:
        """
        获取预热状态
        
        Returns:
            预热状态信息
        """
        return {
            "is_warming": self.is_warming,
            "strategies_count": len(self.strategies),
            "history_count": len(self.warming_history),
            "last_warming": (
                self.warming_history[-1].to_dict()
                if self.warming_history
                else None
            ),
        }
    
    def get_warming_history(self, limit: int = 10) -> List[Dict[str, Any]]:
        """
        获取预热历史
        
        Args:
            limit: 返回的记录数量

        Returns:
            预热历史列表
        """
        history = self.warming_history[-limit:] if limit > 0 else self.warming_history
        return [result.to_dict() for result in reversed(history)]


# 创建全局预热服务实例
cache_warming_service = CacheWarmingService()
