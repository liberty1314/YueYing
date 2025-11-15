"""
缓存预热服务测试
"""
import pytest
from unittest.mock import Mock, MagicMock, patch
from datetime import datetime

from app.services.cache_warming import (
    WarmingStatus,
    WarmingResult,
    CacheWarmingStrategy,
    UserItemsWarmingStrategy,
    PopularContentWarmingStrategy,
    CacheWarmingService,
)


class TestWarmingResult:
    """测试 WarmingResult"""
    
    def test_create_result(self):
        """测试创建结果"""
        result = WarmingResult(
            strategy_name="test",
            status=WarmingStatus.COMPLETED,
            items_warmed=100,
            duration_seconds=1.5
        )
        
        assert result.strategy_name == "test"
        assert result.status == WarmingStatus.COMPLETED
        assert result.items_warmed == 100
        assert result.duration_seconds == 1.5
    
    def test_to_dict(self):
        """测试转换为字典"""
        result = WarmingResult(
            strategy_name="test",
            status=WarmingStatus.COMPLETED,
            items_warmed=100,
            duration_seconds=1.5,
            started_at=datetime(2025, 1, 1, 12, 0, 0),
            completed_at=datetime(2025, 1, 1, 12, 0, 2)
        )
        
        result_dict = result.to_dict()
        
        assert isinstance(result_dict, dict)
        assert result_dict["strategy_name"] == "test"
        assert result_dict["status"] == "completed"
        assert result_dict["items_warmed"] == 100


class MockStrategy(CacheWarmingStrategy):
    """模拟预热策略"""
    
    def __init__(self, name="mock", should_fail=False):
        super().__init__(name=name, description="Mock strategy")
        self.should_fail = should_fail
        self.warm_called = False
    
    def warm(self, db, batch_size=100):
        self.warm_called = True
        
        if self.should_fail:
            return self._create_result(
                status=WarmingStatus.FAILED,
                error="Mock error"
            )
        
        return self._create_result(
            status=WarmingStatus.COMPLETED,
            items_warmed=10,
            duration=0.5
        )


class TestCacheWarmingStrategy:
    """测试 CacheWarmingStrategy"""
    
    def test_create_strategy(self):
        """测试创建策略"""
        strategy = MockStrategy(name="test")
        
        assert strategy.name == "test"
        assert strategy.description == "Mock strategy"
    
    def test_warm_success(self):
        """测试预热成功"""
        strategy = MockStrategy()
        db = Mock()
        
        result = strategy.warm(db, batch_size=50)
        
        assert strategy.warm_called is True
        assert result.status == WarmingStatus.COMPLETED
        assert result.items_warmed == 10
    
    def test_warm_failure(self):
        """测试预热失败"""
        strategy = MockStrategy(should_fail=True)
        db = Mock()
        
        result = strategy.warm(db)
        
        assert result.status == WarmingStatus.FAILED
        assert result.error_message == "Mock error"


class TestCacheWarmingService:
    """测试 CacheWarmingService"""
    
    def test_init(self):
        """测试初始化"""
        service = CacheWarmingService()
        
        assert len(service.strategies) >= 2
        assert service.is_warming is False
        assert len(service.warming_history) == 0
    
    def test_register_strategy(self):
        """测试注册策略"""
        service = CacheWarmingService()
        initial_count = len(service.strategies)
        
        strategy = MockStrategy(name="custom")
        service.register_strategy(strategy)
        
        assert len(service.strategies) == initial_count + 1
    
    def test_get_strategies(self):
        """测试获取策略列表"""
        service = CacheWarmingService()
        strategies = service.get_strategies()
        
        assert isinstance(strategies, list)
        assert len(strategies) > 0
    
    @patch("app.services.cache_warming.get_db")
    def test_warm_all(self, mock_get_db):
        """测试执行所有策略"""
        mock_db = MagicMock()
        mock_get_db.return_value = iter([mock_db])
        
        service = CacheWarmingService()
        service.strategies = [
            MockStrategy(name="strategy1"),
            MockStrategy(name="strategy2"),
        ]
        
        results = service.warm_all(batch_size=50)
        
        assert len(results) == 2
        assert all(r.status == WarmingStatus.COMPLETED for r in results)
    
    @patch("app.services.cache_warming.get_db")
    def test_warm_strategy(self, mock_get_db):
        """测试执行指定策略"""
        mock_db = MagicMock()
        mock_get_db.return_value = iter([mock_db])
        
        service = CacheWarmingService()
        service.strategies = [MockStrategy(name="test_strategy")]
        
        result = service.warm_strategy("test_strategy", batch_size=50)
        
        assert result is not None
        assert result.status == WarmingStatus.COMPLETED
    
    def test_get_warming_status(self):
        """测试获取预热状态"""
        service = CacheWarmingService()
        status = service.get_warming_status()
        
        assert isinstance(status, dict)
        assert "is_warming" in status
        assert status["is_warming"] is False


class TestUserItemsWarmingStrategy:
    """测试 UserItemsWarmingStrategy"""
    
    def test_init(self):
        """测试初始化"""
        strategy = UserItemsWarmingStrategy()
        
        assert strategy.name == "user_items"
        assert strategy.description != ""


class TestPopularContentWarmingStrategy:
    """测试 PopularContentWarmingStrategy"""
    
    def test_init(self):
        """测试初始化"""
        strategy = PopularContentWarmingStrategy()
        
        assert strategy.name == "popular_content"
        assert strategy.description != ""
