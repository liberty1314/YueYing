"""
管理员 API 密钥管理路由
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime

from app.core.database import get_db
from app.api.dependencies.auth import get_current_admin
from app.models.user import User
from app.models.api_key_config import ApiKeyService
from app.services.api_key_service import api_key_service
from app.schemas.api_key import (
    ApiKeyConfigResponse,
    ApiKeyConfigUpdate,
    ApiKeyTestResponse,
    ApiKeyListResponse,
)


router = APIRouter(prefix="/api-keys", tags=["管理员 - API 密钥"])


@router.get("/presets", response_model=dict, summary="获取预设配置")
def get_api_key_presets(
    current_admin: User = Depends(get_current_admin),
):
    """
    获取所有服务的预设配置（从环境变量）
    
    与 LLM 配置的 /presets 端点逻辑一致
    
    - **返回**: 所有服务的预设配置（包含环境变量中的 API 密钥）
    """
    try:
        presets = api_key_service.get_provider_presets()
        return presets
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"获取预设配置失败: {str(e)}"
        )


@router.get("", response_model=ApiKeyListResponse, summary="获取所有API密钥")
def get_all_api_keys(
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    获取所有 API 密钥配置
    
    - **返回**: 所有服务的 API 密钥配置列表（脱敏）
    """
    configs = api_key_service.get_all_configs(db)
    
    response_configs = []
    for config in configs:
        # 解密密钥以生成预览
        decrypted_key = None
        if config.api_key:
            decrypted_key = api_key_service.decrypt_key(config.api_key)
        
        response_configs.append(
            ApiKeyConfigResponse(
                service=config.service.value,
                api_key=None,  # 列表接口不返回完整密钥
                api_key_preview=api_key_service.mask_key(decrypted_key) if decrypted_key else None,
                has_key=bool(config.api_key),
                base_url=config.base_url,
                enabled=config.enabled,
                last_tested_at=config.last_tested_at,
                test_status=config.test_status.value,
                test_message=config.test_message,
                description=config.description,
                created_at=config.created_at,
                updated_at=config.updated_at
            )
        )
    
    return ApiKeyListResponse(configs=response_configs)


@router.get("/{service}", response_model=ApiKeyConfigResponse, summary="获取API密钥配置")
def get_api_key(
    service: str,
    reveal: bool = False,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    获取指定服务的 API 密钥配置
    
    - **service**: 服务类型 (tmdb, google_books, bangumi)
    - **reveal**: 是否返回完整的明文密钥（默认只返回脱敏版本）
    """
    # 验证服务类型
    try:
        service_enum = ApiKeyService[service.upper()]
    except KeyError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"无效的服务类型: {service}"
        )
    
    config = api_key_service.get_config(db, service_enum)
    if not config:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"服务 {service} 的配置不存在"
        )
    
    # 解密密钥
    decrypted_key = None
    if config.api_key:
        decrypted_key = api_key_service.decrypt_key(config.api_key)
    
    # 根据 reveal 参数决定返回完整密钥还是脱敏版本
    api_key_to_return = decrypted_key if (reveal and decrypted_key) else None
    api_key_preview = api_key_service.mask_key(decrypted_key) if decrypted_key else None
    
    return ApiKeyConfigResponse(
        service=config.service.value,
        api_key=api_key_to_return,  # 完整密钥（仅当 reveal=true）
        api_key_preview=api_key_preview,  # 脱敏预览
        has_key=bool(config.api_key),
        base_url=config.base_url,
        enabled=config.enabled,
        last_tested_at=config.last_tested_at,
        test_status=config.test_status.value,
        test_message=config.test_message,
        description=config.description,
        created_at=config.created_at,
        updated_at=config.updated_at
    )


@router.put("/{service}", response_model=ApiKeyConfigResponse, summary="更新API密钥配置")
def update_api_key(
    service: str,
    update_data: ApiKeyConfigUpdate,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    更新 API 密钥配置
    
    - **service**: 服务类型 (tmdb, google_books, bangumi)
    - **update_data**: 更新数据
    """
    # 验证服务类型
    try:
        service_enum = ApiKeyService[service.upper()]
    except KeyError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"无效的服务类型: {service}"
        )
    
    try:
        config = api_key_service.update_config(
            db=db,
            service=service_enum,
            api_key=update_data.api_key,
            base_url=update_data.base_url,
            enabled=update_data.enabled,
            description=update_data.description
        )
        
        # 解密密钥以生成预览
        decrypted_key = None
        if config.api_key:
            decrypted_key = api_key_service.decrypt_key(config.api_key)
        
        return ApiKeyConfigResponse(
            service=config.service.value,
            api_key=None,  # 更新后不返回完整密钥，使用 GET 接口获取
            api_key_preview=api_key_service.mask_key(decrypted_key) if decrypted_key else None,
            has_key=bool(config.api_key),
            base_url=config.base_url,
            enabled=config.enabled,
            last_tested_at=config.last_tested_at,
            test_status=config.test_status.value,
            test_message=config.test_message,
            description=config.description,
            created_at=config.created_at,
            updated_at=config.updated_at
        )
    
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.post("/{service}/test", response_model=ApiKeyTestResponse, summary="测试API连接")
def test_api_connection(
    service: str,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    测试 API 连接
    
    - **service**: 服务类型 (tmdb, google_books, bangumi)
    """
    # 验证服务类型
    try:
        service_enum = ApiKeyService[service.upper()]
    except KeyError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"无效的服务类型: {service}"
        )
    
    success, message = api_key_service.test_connection(db, service_enum)
    
    return ApiKeyTestResponse(
        success=success,
        message=message,
        tested_at=datetime.utcnow()
    )

