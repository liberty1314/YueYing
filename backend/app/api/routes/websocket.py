"""
WebSocket API 路由
提供实时通知功能
"""
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, Query
from sqlalchemy.orm import Session
import logging

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
    """
    user = None
    
    try:
        # 验证用户身份
        from app.core.security import decode_token
        payload = decode_token(token)
        
        if not payload:
            logger.error("Failed to decode token")
            await websocket.close(code=1008, reason="Invalid token")
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
        
        # 建立连接
        await ws_manager.connect(websocket, user.id)
        
        # 发送欢迎消息
        await websocket.send_json({
            "type": "connected",
            "message": "WebSocket 连接成功",
            "user_id": user.id
        })
        
        # 保持连接，监听客户端消息（心跳等）
        while True:
            try:
                data = await websocket.receive_json()
                
                # 处理心跳
                if data.get("type") == "ping":
                    await websocket.send_json({
                        "type": "pong",
                        "timestamp": data.get("timestamp")
                    })
                
            except Exception as e:
                logger.error(f"Error receiving message: {e}")
                break
    
    except WebSocketDisconnect:
        logger.info(f"WebSocket client disconnected: user_id={user.id if user else 'unknown'}")
    
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
    
    finally:
        # 断开连接
        if user:
            ws_manager.disconnect(websocket, user.id)


