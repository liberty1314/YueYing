"""
WebSocket 连接管理器
用于实时推送通知（任务完成、AI 助手消息等）
"""
from typing import Dict, Set
from fastapi import WebSocket
import json
import logging

logger = logging.getLogger(__name__)


class ConnectionManager:
    """WebSocket 连接管理器"""
    
    def __init__(self):
        # 用户ID -> WebSocket 连接集合
        self.active_connections: Dict[int, Set[WebSocket]] = {}
    
    async def connect(self, websocket: WebSocket, user_id: int):
        """
        建立 WebSocket 连接
        
        Args:
            websocket: WebSocket 连接实例
            user_id: 用户 ID
        """
        await websocket.accept()
        
        if user_id not in self.active_connections:
            self.active_connections[user_id] = set()
        
        self.active_connections[user_id].add(websocket)
        logger.info(f"WebSocket connected: user_id={user_id}, total_connections={len(self.active_connections[user_id])}")
    
    def disconnect(self, websocket: WebSocket, user_id: int):
        """
        断开 WebSocket 连接
        
        Args:
            websocket: WebSocket 连接实例
            user_id: 用户 ID
        """
        if user_id in self.active_connections:
            self.active_connections[user_id].discard(websocket)
            
            # 如果该用户没有连接了，清理字典
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]
            
            logger.info(f"WebSocket disconnected: user_id={user_id}")
    
    async def send_personal_message(self, message: dict, user_id: int):
        """
        向指定用户的所有连接发送消息
        
        Args:
            message: 要发送的消息（字典格式）
            user_id: 用户 ID
        """
        if user_id not in self.active_connections:
            logger.debug(f"No active connections for user_id={user_id}")
            return
        
        # 获取该用户的所有连接副本，避免在迭代时修改
        connections = list(self.active_connections[user_id])
        
        for websocket in connections:
            try:
                await websocket.send_json(message)
                logger.debug(f"Message sent to user_id={user_id}: {message.get('type')}")
            except Exception as e:
                logger.error(f"Error sending message to user_id={user_id}: {e}")
                # 发送失败，断开连接
                self.disconnect(websocket, user_id)
    
    async def broadcast(self, message: dict):
        """
        向所有连接广播消息
        
        Args:
            message: 要广播的消息（字典格式）
        """
        for user_id, connections in list(self.active_connections.items()):
            await self.send_personal_message(message, user_id)
    
    def get_connection_count(self, user_id: int = None) -> int:
        """
        获取连接数量
        
        Args:
            user_id: 如果提供，返回该用户的连接数；否则返回总连接数
        
        Returns:
            连接数量
        """
        if user_id is not None:
            return len(self.active_connections.get(user_id, set()))
        
        return sum(len(conns) for conns in self.active_connections.values())


# 全局连接管理器实例
ws_manager = ConnectionManager()


