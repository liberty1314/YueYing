"""
管理员日志 WebSocket API
实时推送日志更新
"""
import asyncio
import json
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query, HTTPException, status
from typing import Set
from pathlib import Path
from loguru import logger
from datetime import datetime

from app.core.security import decode_token
from app.services.log_service import log_service


router = APIRouter(tags=["Admin - WebSocket"])


class ConnectionManager:
    """WebSocket 连接管理器"""
    
    def __init__(self):
        # 活动连接集合（admin_id -> websocket）
        self.active_connections: dict[int, Set[WebSocket]] = {}
        # 文件监控任务
        self.monitor_task = None
        # 最后读取的文件位置
        self.last_position = 0
        # 日志文件路径
        self.log_file_path = Path("logs/app.log")
        
    async def connect(self, websocket: WebSocket, admin_id: int):
        """接受连接"""
        await websocket.accept()
        
        if admin_id not in self.active_connections:
            self.active_connections[admin_id] = set()
        
        self.active_connections[admin_id].add(websocket)
        logger.info(f"Admin {admin_id} connected to log stream. Total connections: {self.get_connection_count()}")
        
        # 如果这是第一个连接，启动文件监控
        if self.get_connection_count() == 1:
            await self.start_monitoring()
    
    def disconnect(self, websocket: WebSocket, admin_id: int):
        """断开连接"""
        if admin_id in self.active_connections:
            self.active_connections[admin_id].discard(websocket)
            
            # 如果该管理员没有活动连接了，移除条目
            if not self.active_connections[admin_id]:
                del self.active_connections[admin_id]
        
        logger.info(f"Admin {admin_id} disconnected from log stream. Total connections: {self.get_connection_count()}")
        
        # 如果没有连接了，停止文件监控
        if self.get_connection_count() == 0:
            self.stop_monitoring()
    
    def get_connection_count(self) -> int:
        """获取活动连接总数"""
        return sum(len(connections) for connections in self.active_connections.values())
    
    async def broadcast(self, message: dict):
        """广播消息给所有连接"""
        disconnected = []
        
        for admin_id, connections in self.active_connections.items():
            for connection in list(connections):
                try:
                    await connection.send_json(message)
                except Exception as e:
                    logger.error(f"Error sending to connection: {e}")
                    disconnected.append((connection, admin_id))
        
        # 清理断开的连接
        for connection, admin_id in disconnected:
            self.disconnect(connection, admin_id)
    
    async def start_monitoring(self):
        """启动文件监控"""
        if self.monitor_task is None or self.monitor_task.done():
            # 初始化文件位置
            if self.log_file_path.exists():
                self.last_position = self.log_file_path.stat().st_size
            else:
                self.last_position = 0
            
            self.monitor_task = asyncio.create_task(self._monitor_log_file())
            logger.info("Started log file monitoring")
    
    def stop_monitoring(self):
        """停止文件监控"""
        if self.monitor_task and not self.monitor_task.done():
            self.monitor_task.cancel()
            logger.info("Stopped log file monitoring")
    
    async def _monitor_log_file(self):
        """监控日志文件变化"""
        try:
            while True:
                await asyncio.sleep(0.5)  # 每 0.5 秒检查一次
                
                if not self.log_file_path.exists():
                    continue
                
                # 检查文件大小
                current_size = self.log_file_path.stat().st_size
                
                # 如果文件被截断或重新创建
                if current_size < self.last_position:
                    self.last_position = 0
                
                # 如果有新内容
                if current_size > self.last_position:
                    try:
                        with open(self.log_file_path, 'r', encoding='utf-8', errors='ignore') as f:
                            f.seek(self.last_position)
                            new_lines = f.readlines()
                            self.last_position = f.tell()
                        
                        # 解析并广播新日志
                        for line in new_lines:
                            if line.strip():
                                entry = log_service._parse_log_line(line)
                                if entry:
                                    await self.broadcast({
                                        "type": "new_log",
                                        "data": {
                                            "timestamp": entry.timestamp.isoformat(),
                                            "level": entry.level,
                                            "location": entry.location,
                                            "message": entry.message,
                                            "raw_line": entry.raw_line,
                                            "is_multiline": entry.is_multiline
                                        }
                                    })
                    except Exception as e:
                        logger.error(f"Error reading log file: {e}")
                        
        except asyncio.CancelledError:
            logger.info("Log monitoring task cancelled")
        except Exception as e:
            logger.error(f"Error in log monitoring: {e}")


# 创建全局连接管理器
manager = ConnectionManager()


@router.websocket("/ws/logs")
async def websocket_logs(
    websocket: WebSocket,
    token: str = Query(..., description="认证 token")
):
    """
    WebSocket 日志实时推送
    
    **认证**: 需要在查询参数中提供管理员 token
    
    **消息格式**:
    ```json
    {
        "type": "new_log",
        "data": {
            "timestamp": "2025-11-08T12:30:45.123",
            "level": "INFO",
            "location": "app.main:startup:45",
            "message": "Application started",
            "raw_line": "...",
            "is_multiline": false
        }
    }
    ```
    """
    # 验证 token
    try:
        payload = decode_token(token)
        if not payload:
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            return
        
        user_id = payload.get("sub")
        role = payload.get("role")
        
        if not user_id or role != "admin":
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            return
        
        admin_id = int(user_id)
        
    except Exception as e:
        logger.error(f"WebSocket authentication failed: {e}")
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return
    
    # 接受连接
    await manager.connect(websocket, admin_id)
    
    try:
        # 发送欢迎消息
        await websocket.send_json({
            "type": "connected",
            "message": "Successfully connected to log stream"
        })
        
        # 保持连接，接收客户端消息（心跳等）
        while True:
            try:
                data = await websocket.receive_text()
                
                # 处理客户端消息（如心跳）
                try:
                    message = json.loads(data)
                    if message.get("type") == "ping":
                        await websocket.send_json({"type": "pong"})
                except json.JSONDecodeError:
                    pass
                    
            except WebSocketDisconnect:
                break
            except Exception as e:
                logger.error(f"Error receiving WebSocket message: {e}")
                break
                
    finally:
        manager.disconnect(websocket, admin_id)

