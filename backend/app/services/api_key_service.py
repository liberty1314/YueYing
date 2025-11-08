"""
API 密钥配置服务（统一配置管理）
"""
import logging
from typing import List, Optional, Tuple, Dict, Any
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
import time
from loguru import logger

from app.core.config import settings
from app.core.encryption import encryption_service
from app.models.api_key_config import ApiKeyConfig, ApiKeyService, TestStatus


class ApiKeyConfigCache:
    """API 密钥配置内存缓存"""
    _cache: Dict[str, Dict[str, Any]] = {}
    _last_update: Dict[str, float] = {}
    _cache_ttl: int = 300  # 缓存 5 分钟
    
    @classmethod
    def get(cls, service: str) -> Optional[Dict[str, Any]]:
        """获取缓存的配置"""
        if service in cls._cache:
            if time.time() - cls._last_update.get(service, 0) < cls._cache_ttl:
                return cls._cache[service].copy()
        return None
    
    @classmethod
    def set(cls, service: str, config: Dict[str, Any]):
        """设置缓存"""
        cls._cache[service] = config.copy()
        cls._last_update[service] = time.time()
    
    @classmethod
    def clear(cls, service: Optional[str] = None):
        """清除缓存"""
        if service:
            cls._cache.pop(service, None)
            cls._last_update.pop(service, None)
        else:
            cls._cache.clear()
            cls._last_update.clear()


class ApiKeyServiceClass:
    """API 密钥配置服务类（统一配置管理）"""
    
    def get_provider_presets(self) -> Dict[str, Dict[str, Any]]:
        """
        获取所有服务的预设配置（从环境变量）
        与 LLMConfigService.get_provider_presets() 逻辑一致
        """
        return {
            "tmdb": {
                "api_key": settings.TMDB_API_KEY or "",
                "base_url": "https://api.themoviedb.org/3",
                "description": "电影和电视剧数据库",
                "enabled": bool(settings.TMDB_API_KEY),
            },
            "google_books": {
                "api_key": settings.GOOGLE_BOOKS_API_KEY or "",
                "base_url": "https://www.googleapis.com/books/v1",
                "description": "Google 图书数据库",
                "enabled": bool(settings.GOOGLE_BOOKS_API_KEY),
            },
            "bangumi": {
                "api_key": settings.BANGUMI_API_KEY or "",
                "base_url": "https://api.bgm.tv",
                "description": "动漫、游戏数据库",
                "enabled": bool(settings.BANGUMI_API_KEY),
            },
        }
    
    def _load_config_with_priority(
        self,
        db: Session,
        service: ApiKeyService
    ) -> Dict[str, Any]:
        """
        统一配置加载逻辑：
        1. 检查是否强制使用环境变量
        2. 从数据库加载（如果存在且未强制使用环境变量）
        3. 从环境变量加载（作为默认值或强制覆盖）
        4. 解密密钥
        
        Returns:
            配置字典（包含解密后的密钥）
        """
        service_str = service.value
        
        # 检查缓存
        cached_config = ApiKeyConfigCache.get(service_str)
        if cached_config:
            logger.debug(f"从缓存加载 API 密钥配置: {service_str}")
            return cached_config
        
        config_dict = None
        
        # 步骤 1: 检查是否强制使用环境变量
        force_env = settings.FORCE_ENV_SETTINGS
        
        # 步骤 2: 如果不强制使用环境变量，尝试从数据库加载
        if not force_env:
            db_config = self.get_config(db, service)
            if db_config:
                logger.info(f"从数据库加载 API 密钥配置: {service_str}")
                config_dict = {
                    "service": db_config.service.value,
                    "api_key": encryption_service.decrypt(db_config.api_key),  # 解密
                    "base_url": db_config.base_url,
                    "enabled": db_config.enabled,
                    "description": db_config.description,
                }
        
        # 步骤 3: 如果数据库没有配置或强制使用环境变量，从 .env 加载
        if config_dict is None or force_env:
            presets = self.get_provider_presets()
            
            if service_str in presets:
                preset = presets[service_str]
                config_dict = {
                    "service": service_str,
                    "api_key": preset["api_key"],  # 环境变量中的密钥是明文
                    "base_url": preset["base_url"],
                    "enabled": preset["enabled"],
                    "description": preset["description"],
                }
                log_msg = "强制从环境变量加载 API 密钥配置" if force_env else "从环境变量加载 API 密钥配置（数据库无配置）"
                logger.info(f"{log_msg}: service={service_str}")
        
        # 步骤 4: 缓存配置
        if config_dict:
            ApiKeyConfigCache.set(service_str, config_dict)
        
        return config_dict
    
    def initialize_from_env(self, db: Session) -> List[ApiKeyConfig]:
        """
        从环境变量初始化 API 密钥配置
        与 LLMConfigService.initialize_from_env() 逻辑一致
        仅在数据库中没有对应服务配置时执行
        """
        presets = self.get_provider_presets()
        initialized_configs = []
        
        for service_str, preset in presets.items():
            try:
                # 通过枚举成员名称获取（TMDB, GOOGLE_BOOKS等）
                service_enum = ApiKeyService[service_str.upper()]
            except KeyError:
                logger.warning(f"未知的服务类型: {service_str}")
                continue
            
            # 检查是否已有配置
            existing_config = self.get_config(db, service_enum)
            if existing_config:
                logger.info(f"API 密钥配置已存在，跳过初始化: {service_str}")
                initialized_configs.append(existing_config)
                continue
            
            # 检查是否有 API 密钥（Bangumi 可以没有）
            api_key = preset["api_key"]
            if not api_key and service_enum != ApiKeyService.BANGUMI:
                logger.warning(f"未配置 {service_str.upper()} 的 API 密钥，跳过初始化")
                continue
            
            # 创建配置（加密密钥）
            try:
                config = ApiKeyConfig(
                    service=service_enum,
                    api_key=encryption_service.encrypt(api_key) if api_key else None,
                    base_url=preset["base_url"],
                    enabled=preset["enabled"],
                    description=preset["description"],
                )
                
                db.add(config)
                db.commit()
                db.refresh(config)
                
                logger.info(f"✅ 从环境变量初始化 API 密钥配置: service={service_str}")
                initialized_configs.append(config)
                
            except Exception as e:
                logger.error(f"初始化 API 密钥配置失败 ({service_str}): {e}")
                db.rollback()
                continue
        
        return initialized_configs
    
    def get_all_configs(self, db: Session) -> List[ApiKeyConfig]:
        """获取所有配置"""
        configs = db.query(ApiKeyConfig).all()
        return configs
    
    def get_config(self, db: Session, service: ApiKeyService) -> Optional[ApiKeyConfig]:
        """获取指定服务的配置"""
        config = db.query(ApiKeyConfig).filter(
            ApiKeyConfig.service == service
        ).first()
        return config
    
    def update_config(
        self,
        db: Session,
        service: ApiKeyService,
        api_key: Optional[str] = None,
        base_url: Optional[str] = None,
        enabled: Optional[bool] = None,
        description: Optional[str] = None
    ) -> ApiKeyConfig:
        """更新配置（加密存储密钥）"""
        config = self.get_config(db, service)
        
        if not config:
            # 如果配置不存在，创建新配置
            config = ApiKeyConfig(service=service)
            db.add(config)
        
        # 更新字段
        if api_key is not None:
            if api_key:
                config.api_key = encryption_service.encrypt(api_key)  # 使用统一加密服务
            else:
                config.api_key = None
        
        if base_url is not None:
            config.base_url = base_url
        
        if enabled is not None:
            config.enabled = enabled
        
        if description is not None:
            config.description = description
        
        config.updated_at = datetime.utcnow()
        
        try:
            db.commit()
            db.refresh(config)
            
            # 清除缓存
            ApiKeyConfigCache.clear(service.value)
            
            logger.info(f"更新 API 密钥配置: {service.value}")
            return config
        except IntegrityError as e:
            db.rollback()
            logger.error(f"更新配置失败: {e}")
            raise ValueError(f"更新配置失败: {str(e)}")
    
    def mask_key(self, api_key: Optional[str]) -> str:
        """脱敏显示 API 密钥"""
        return encryption_service.mask(api_key)
    
    def decrypt_key(self, encrypted_key: Optional[str]) -> Optional[str]:
        """
        解密 API 密钥
        
        Args:
            encrypted_key: 加密的密钥
            
        Returns:
            解密后的明文密钥
        """
        return encryption_service.decrypt(encrypted_key)
    
    def test_connection(
        self,
        db: Session,
        service: ApiKeyService
    ) -> Tuple[bool, str]:
        """
        测试 API 连接
        
        Returns:
            (成功标志, 消息)
        """
        # 使用统一配置加载逻辑
        config_dict = self._load_config_with_priority(db, service)
        
        if not config_dict:
            return False, "配置不存在"
        
        api_key = config_dict.get("api_key")
        base_url = config_dict.get("base_url")
        enabled = config_dict.get("enabled")
        
        if not enabled:
            return False, "服务未启用"
        
        if not api_key and service != ApiKeyService.BANGUMI:
            return False, "API 密钥未配置"
        
        # 根据服务类型测试连接
        try:
            if service == ApiKeyService.TMDB:
                success, message = self._test_tmdb(api_key, base_url)
            elif service == ApiKeyService.GOOGLE_BOOKS:
                success, message = self._test_google_books(api_key, base_url)
            elif service == ApiKeyService.BANGUMI:
                success, message = self._test_bangumi(base_url)
            else:
                return False, "不支持的服务类型"
            
            # 更新测试状态（仅在数据库有配置时）
            db_config = self.get_config(db, service)
            if db_config:
                db_config.last_tested_at = datetime.utcnow()
                db_config.test_status = TestStatus.SUCCESS if success else TestStatus.FAILED
                db_config.test_message = message
                db.commit()
            
            logger.info(f"API 连接测试 - {service.value}: {success}")
            return success, message
            
        except Exception as e:
            error_msg = f"测试失败: {str(e)}"
            logger.error(f"API 连接测试异常 - {service.value}: {e}")
            
            # 更新测试状态为失败（仅在数据库有配置时）
            db_config = self.get_config(db, service)
            if db_config:
                db_config.last_tested_at = datetime.utcnow()
                db_config.test_status = TestStatus.FAILED
                db_config.test_message = error_msg
                db.commit()
            
            return False, error_msg
    
    def _test_tmdb(self, api_key: str, base_url: Optional[str]) -> Tuple[bool, str]:
        """测试 TMDB API"""
        import requests
        
        url = base_url or "https://api.themoviedb.org/3"
        test_url = f"{url}/configuration"
        
        try:
            response = requests.get(
                test_url,
                params={"api_key": api_key},
                timeout=10
            )
            
            if response.status_code == 200:
                return True, "连接测试成功"
            elif response.status_code == 401:
                return False, "API 密钥无效"
            else:
                return False, f"请求失败: HTTP {response.status_code}"
                
        except requests.exceptions.Timeout:
            return False, "连接超时"
        except requests.exceptions.RequestException as e:
            return False, f"网络错误: {str(e)}"
    
    def _test_google_books(self, api_key: str, base_url: Optional[str]) -> Tuple[bool, str]:
        """测试 Google Books API"""
        import requests
        
        url = base_url or "https://www.googleapis.com/books/v1"
        test_url = f"{url}/volumes"
        
        try:
            response = requests.get(
                test_url,
                params={"q": "python", "key": api_key, "maxResults": 1},
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if "items" in data:
                    return True, "连接测试成功"
                return True, "连接成功但未返回数据"
            elif response.status_code == 400:
                return False, "API 密钥无效或请求参数错误"
            else:
                return False, f"请求失败: HTTP {response.status_code}"
                
        except requests.exceptions.Timeout:
            return False, "连接超时"
        except requests.exceptions.RequestException as e:
            return False, f"网络错误: {str(e)}"
    
    def _test_bangumi(self, base_url: Optional[str]) -> Tuple[bool, str]:
        """测试 Bangumi API（不需要密钥）"""
        import requests
        
        url = base_url or "https://api.bgm.tv"
        test_url = f"{url}/calendar"
        
        try:
            response = requests.get(test_url, timeout=10)
            
            if response.status_code == 200:
                return True, "连接测试成功"
            else:
                return False, f"请求失败: HTTP {response.status_code}"
                
        except requests.exceptions.Timeout:
            return False, "连接超时"
        except requests.exceptions.RequestException as e:
            return False, f"网络错误: {str(e)}"
    
    def get_decrypted_key(self, db: Session, service: ApiKeyService) -> Optional[str]:
        """
        获取解密后的 API 密钥（供外部 API 客户端使用）
        使用统一的配置加载逻辑：数据库优先，然后是环境变量，支持强制 ENV 覆盖
        """
        config_dict = self._load_config_with_priority(db, service)
        
        if config_dict and config_dict.get("enabled"):
            api_key = config_dict.get("api_key")
            if api_key:
                logger.debug(f"获取解密后的 API 密钥: {service.value}")
                return api_key
        
        logger.debug(f"未找到有效的 API 密钥: {service.value}")
        return None


# 创建全局实例
api_key_service = ApiKeyServiceClass()
