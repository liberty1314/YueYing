"""
统一的配置加密服务
用于 LLM 配置和 API 密钥的加密/解密
"""
from cryptography.fernet import Fernet
import base64
import hashlib
from typing import Optional
from loguru import logger

from app.core.config import settings


class EncryptionService:
    """配置加密服务（单例模式）"""
    
    _instance = None
    _fernet = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialize()
        return cls._instance
    
    def _initialize(self):
        """初始化加密服务"""
        # 使用 SECRET_KEY 或 ENCRYPTION_KEY 派生 Fernet 密钥
        encryption_key = getattr(settings, 'ENCRYPTION_KEY', None) or settings.SECRET_KEY
        key = hashlib.sha256(encryption_key.encode()).digest()
        self._fernet = Fernet(base64.urlsafe_b64encode(key))
        logger.info("加密服务初始化成功")
    
    def encrypt(self, plaintext: Optional[str]) -> Optional[str]:
        """
        加密明文字符串
        
        Args:
            plaintext: 明文字符串
            
        Returns:
            加密后的字符串（Base64 编码），如果输入为空则返回 None
        """
        if not plaintext:
            return None
        
        try:
            encrypted_bytes = self._fernet.encrypt(plaintext.encode())
            return encrypted_bytes.decode()
        except Exception as e:
            logger.error(f"加密失败: {e}")
            raise ValueError(f"加密失败: {str(e)}")
    
    def decrypt(self, encrypted_text: Optional[str]) -> Optional[str]:
        """
        解密加密的字符串
        
        Args:
            encrypted_text: 加密的字符串
            
        Returns:
            解密后的明文，如果输入为空或解密失败则返回 None
        """
        if not encrypted_text:
            return None
        
        try:
            decrypted_bytes = self._fernet.decrypt(encrypted_text.encode())
            return decrypted_bytes.decode()
        except Exception as e:
            logger.error(f"解密失败: {e}")
            return None
    
    def mask(self, text: Optional[str], show_chars: int = 4) -> str:
        """
        脱敏显示文本（用于 API 密钥等敏感信息）
        
        Args:
            text: 要脱敏的文本
            show_chars: 前后各显示的字符数
            
        Returns:
            脱敏后的文本，如 "abc...xyz"
        """
        if not text or len(text) < show_chars * 2:
            return "****"
        return f"{text[:show_chars]}...{text[-show_chars:]}"


# 创建全局单例
encryption_service = EncryptionService()

