"""
WebSocket API 路由
提供实时通知功能
"""
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, Query
from sqlalchemy.orm import Session
from datetime import datetime
import logging
import asyncio

from app.core.database import get_db
from app.core.websocket import ws_manager
from app.models.user import User

logger = logging.getLogger(__name__)

router = APIRouter()


@router.websocket("/ws")
async def websocket_endpoint(
    websocket: WebSocket,
    token: str = Query(..., description="认证 token"),
    db: Session = Depends(get_db)
):
    """
    WebSocket 连接端点
    
    客户端需要通过 query 参数传递 token 进行认证
    例如: ws://localhost:8000/ws?token=your_jwt_token
    
    Token 过期处理：
    - 连接时验证 token 有效性
    - 定期检查 token 是否过期
    - Token 过期时发送通知并优雅断开连接
    """
    user = None
    token_exp = None
    
    try:
        # 验证用户身份
        from app.core.security import decode_token
        payload = decode_token(token)
        
        if not payload:
            logger.error("Failed to decode token")
            await websocket.close(code=1008, reason="Invalid token")
            return
        
        # 检查 token 类型
        token_type = payload.get("type")
        if token_type != "access":
            logger.error(f"Invalid token type: {token_type}")
            await websocket.close(code=1008, reason="Invalid token type")
            return
        
        # 获取过期时间
        token_exp = payload.get("exp")
        if not token_exp:
            logger.error("No expiration time in token")
            await websocket.close(code=1008, reason="Invalid token")
            return
        
        # 检查 token 是否已过期
        current_time = datetime.utcnow().timestamp()
        if current_time >= token_exp:
            logger.error("Token has expired")
            await websocket.close(code=1008, reason="Token expired")
            return
            
        user_id = payload.get("sub")
        
        if not user_id:
            logger.error("No user_id in token payload")
            await websocket.close(code=1008, reason="Invalid token")
            return
        
        user = db.query(User).filter(User.id == int(user_id)).first()
        
        if not user:
            logger.error(f"User not found: {user_id}")
            await websocket.close(code=1008, reason="User not found")
            return
        
        if not user.is_active:
            logger.error(f"User is not active: {user_id}")
            await websocket.close(code=1008, reason="User is not active")
            return
        
        # 建立连接
        await ws_manager.connect(websocket, user.id)
        
        # 发送欢迎消息
        await websocket.send_json({
            "type": "connected",
            "message": "WebSocket 连接成功",
            "user_id": user.id,
            "token_expires_at": token_exp
        })
        
        logger.info(f"WebSocket connected: user_id={user.id}")
        
        # 创建一个任务来定期检查 token 过期
        async def check_token_expiration():
            """定期检查 token 是否过期"""
            nonlocal token_exp  # 声明使用外层变量
            while True:
                try:
                    await asyncio.sleep(60)  # 每分钟检查一次
                    current_time = datetime.utcnow().timestamp()
                    
                    # 如果 token 即将过期（5分钟内）
                    if token_exp - current_time <= 300:
                        await websocket.send_json({
                            "type": "token_expiring",
                            "message": "Token 即将过期，请刷新",
                            "expires_in": int(token_exp - current_time)
                        })
                        logger.warning(f"Token expiring soon for user {user.id}")
                    
                    # 如果 token 已过期
                    if current_time >= token_exp:
                        await websocket.send_json({
                            "type": "token_expired",
                            "message": "Token 已过期，连接将断开",
                            "reason": "token_expired"
                        })
                        logger.info(f"Token expired for user {user.id}, closing connection")
                        await asyncio.sleep(1)  # 给客户端时间接收消息
                        await websocket.close(code=1008, reason="Token expired")
                        break
                        
                except asyncio.CancelledError:
                    break
                except Exception as e:
                    logger.error(f"Error in token expiration check: {e}")
                    break
        
        # 启动 token 过期检查任务
        expiration_task = asyncio.create_task(check_token_expiration())
        
        try:
            # 保持连接，监听客户端消息（心跳等）
            while True:
                try:
                    data = await websocket.receive_json()
                    
                    # 处理心跳
                    if data.get("type") == "ping":
                        await websocket.send_json({
                            "type": "pong",
                            "timestamp": data.get("timestamp"),
                            "server_time": datetime.utcnow().isoformat()
                        })
                    
                    # 处理 token 刷新请求
                    elif data.get("type") == "refresh_token":
                        new_token = data.get("token")
                        if new_token:
                            # 验证新 token
                            new_payload = decode_token(new_token)
                            if new_payload and new_payload.get("sub") == str(user.id):
                                # 更新 token 过期时间
                                token_exp = new_payload.get("exp")
                                await websocket.send_json({
                                    "type": "token_refreshed",
                                    "message": "Token 已更新",
                                    "token_expires_at": token_exp
                                })
                                logger.info(f"Token refreshed for user {user.id}")
                            else:
                                await websocket.send_json({
                                    "type": "error",
                                    "message": "无效的新 token"
                                })
                        else:
                            await websocket.send_json({
                                "type": "error",
                                "message": "缺少新 token"
                            })
                    
                    # 处理断开连接请求
                    elif data.get("type") == "disconnect":
                        logger.info(f"Client requested disconnect: user_id={user.id}")
                        await websocket.send_json({
                            "type": "disconnecting",
                            "message": "正在断开连接"
                        })
                        break
                    
                except WebSocketDisconnect:
                    logger.info(f"WebSocket client disconnected: user_id={user.id}")
                    break
                except Exception as e:
                    logger.error(f"Error receiving message: {e}")
                    break
        finally:
            # 取消 token 过期检查任务
            expiration_task.cancel()
            try:
                await expiration_task
            except asyncio.CancelledError:
                pass
    
    except WebSocketDisconnect:
        logger.info(f"WebSocket client disconnected: user_id={user.id if user else 'unknown'}")
    
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        try:
            await websocket.close(code=1011, reason="Internal server error")
        except:
            pass
    
    finally:
        # 断开连接
        if user:
            ws_manager.disconnect(websocket, user.id)
            logger.info(f"WebSocket connection closed: user_id={user.id}")
