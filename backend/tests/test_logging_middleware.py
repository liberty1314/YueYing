"""
日志中间件测试

测试日志中间件的请求记录、异常捕获等功能
"""
import pytest
from fastapi import FastAPI, HTTPException
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
from loguru import logger

from app.middleware.logging_middleware import (
    LoggingMiddleware,
    RequestLoggingMiddleware,
    log_request_info,
    log_response_info,
)


# ====================================
# 测试应用设置
# ====================================


@pytest.fixture
def app():
    """创建测试应用"""
    app = FastAPI()

    # 添加日志中间件
    app.add_middleware(LoggingMiddleware)

    # 测试端点
    @app.get("/test")
    async def test_endpoint():
        return {"message": "test"}

    @app.get("/error")
    async def error_endpoint():
        raise ValueError("Test error")

    @app.get("/http-error")
    async def http_error_endpoint():
        raise HTTPException(status_code=404, detail="Not found")

    @app.post("/echo")
    async def echo_endpoint(data: dict):
        return data

    return app


@pytest.fixture
def client(app):
    """创建测试客户端"""
    return TestClient(app)


# ====================================
# LoggingMiddleware 测试
# ====================================


class TestLoggingMiddleware:
    """日志中间件测试"""

    def test_successful_request_logging(self, client):
        """测试成功请求的日志记录"""
        with patch("app.middleware.logging_middleware.logger") as mock_logger:
            response = client.get("/test")

            assert response.status_code == 200
            assert response.json() == {"message": "test"}

            # 验证日志被调用
            assert mock_logger.info.call_count >= 2  # 至少有请求开始和完成两条日志

            # 验证响应头包含请求ID和处理时间
            assert "X-Request-ID" in response.headers
            assert "X-Process-Time" in response.headers

    def test_request_id_generation(self, client):
        """测试请求ID生成"""
        response = client.get("/test")

        assert "X-Request-ID" in response.headers
        request_id = response.headers["X-Request-ID"]

        # 验证 UUID 格式
        assert len(request_id) == 36  # UUID 长度
        assert request_id.count("-") == 4  # UUID 有4个连字符

    def test_process_time_header(self, client):
        """测试处理时间头"""
        response = client.get("/test")

        assert "X-Process-Time" in response.headers
        process_time = float(response.headers["X-Process-Time"])

        # 验证处理时间是合理的（应该很短）
        assert 0 <= process_time < 1.0  # 应该在1秒以内

    def test_error_handling(self, client):
        """测试异常捕获和日志记录"""
        with patch("app.middleware.logging_middleware.logger") as mock_logger:
            response = client.get("/error")

            # 应该返回500错误
            assert response.status_code == 500

            # 验证错误日志被记录
            assert mock_logger.error.called

            # 验证错误响应包含请求ID
            assert "request_id" in response.json()

            # 验证响应头
            assert "X-Request-ID" in response.headers
            assert "X-Process-Time" in response.headers

    def test_error_response_format(self, client):
        """测试错误响应格式"""
        response = client.get("/error")

        assert response.status_code == 500
        data = response.json()

        # 验证错误响应包含必要字段
        assert "error" in data
        assert "message" in data
        assert "request_id" in data

        assert data["error"] == "Internal Server Error"
        assert "Test error" in data["message"]

    def test_different_http_methods(self, client):
        """测试不同HTTP方法"""
        with patch("app.middleware.logging_middleware.logger") as mock_logger:
            # GET 请求
            response = client.get("/test")
            assert response.status_code == 200

            # POST 请求
            response = client.post("/echo", json={"test": "data"})
            assert response.status_code == 200

            # 验证日志记录了不同的方法
            info_calls = mock_logger.info.call_args_list
            methods_logged = [
                call[1].get("extra", {}).get("method")
                for call in info_calls
                if call[1].get("extra")
            ]

            assert "GET" in methods_logged
            assert "POST" in methods_logged

    def test_log_contains_request_info(self, client):
        """测试日志包含请求信息"""
        with patch("app.middleware.logging_middleware.logger") as mock_logger:
            response = client.get("/test?param=value")

            assert response.status_code == 200

            # 获取第一个 info 调用（请求开始）
            first_info_call = mock_logger.info.call_args_list[0]

            # 验证日志包含请求信息
            log_message = first_info_call[0][0]
            assert "GET" in log_message
            assert "/test" in log_message

            # 验证 extra 字段
            extra = first_info_call[1].get("extra", {})
            assert "request_id" in extra
            assert extra["method"] == "GET"
            assert "client_host" in extra

    def test_log_contains_response_info(self, client):
        """测试日志包含响应信息"""
        with patch("app.middleware.logging_middleware.logger") as mock_logger:
            response = client.get("/test")

            assert response.status_code == 200

            # 获取第二个 info 调用（请求完成）
            second_info_call = mock_logger.info.call_args_list[1]

            # 验证日志包含响应信息
            log_message = second_info_call[0][0]
            assert "Status: 200" in log_message
            assert "Time:" in log_message

            # 验证 extra 字段
            extra = second_info_call[1].get("extra", {})
            assert "status_code" in extra
            assert extra["status_code"] == 200
            assert "process_time" in extra


# ====================================
# RequestLoggingMiddleware 测试
# ====================================


class TestRequestLoggingMiddleware:
    """详细请求日志中间件测试"""

    @pytest.fixture
    def detailed_app(self):
        """创建带详细日志的测试应用"""
        app = FastAPI()

        # 添加详细日志中间件
        app.add_middleware(
            RequestLoggingMiddleware,
            log_request_body=True,
            log_response_body=True,
        )

        @app.post("/echo")
        async def echo_endpoint(data: dict):
            return data

        return app

    @pytest.fixture
    def detailed_client(self, detailed_app):
        """创建详细日志测试客户端"""
        return TestClient(detailed_app)

    def test_request_body_logging(self, detailed_client):
        """测试请求体日志记录"""
        with patch("app.middleware.logging_middleware.logger") as mock_logger:
            response = detailed_client.post("/echo", json={"test": "data"})

            assert response.status_code == 200

            # 验证 debug 日志被调用（用于记录请求体）
            assert mock_logger.debug.called


# ====================================
# 辅助函数测试
# ====================================


class TestHelperFunctions:
    """辅助函数测试"""

    def test_log_request_info(self):
        """测试提取请求信息"""
        # 创建模拟请求
        from fastapi import Request
        from starlette.datastructures import Headers

        mock_request = MagicMock(spec=Request)
        mock_request.method = "GET"
        mock_request.url = MagicMock()
        mock_request.url.__str__ = lambda self: "http://test.com/api/test"
        mock_request.url.path = "/api/test"
        mock_request.query_params = {"param": "value"}
        mock_request.headers = {"user-agent": "test-agent"}
        mock_request.client = MagicMock()
        mock_request.client.host = "127.0.0.1"
        mock_request.client.port = 12345

        info = log_request_info(mock_request)

        assert info["method"] == "GET"
        assert info["path"] == "/api/test"
        assert info["client_host"] == "127.0.0.1"
        assert info["client_port"] == 12345

    def test_log_response_info(self):
        """测试提取响应信息"""
        from fastapi import Response

        response = Response(content="test", status_code=200)
        response.headers["X-Custom-Header"] = "test-value"

        info = log_response_info(response)

        assert info["status_code"] == 200
        # 响应头的键被转换为小写
        assert "x-custom-header" in info["headers"]


# ====================================
# 集成测试
# ====================================


class TestLoggingMiddlewareIntegration:
    """日志中间件集成测试"""

    def test_multiple_concurrent_requests(self, client):
        """测试并发请求的日志记录"""
        import concurrent.futures

        def make_request():
            return client.get("/test")

        # 发送10个并发请求
        with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
            futures = [executor.submit(make_request) for _ in range(10)]
            responses = [f.result() for f in futures]

        # 验证所有请求都成功
        assert all(r.status_code == 200 for r in responses)

        # 验证每个请求都有唯一的请求ID
        request_ids = [r.headers["X-Request-ID"] for r in responses]
        assert len(set(request_ids)) == 10  # 所有请求ID都是唯一的

    def test_request_lifecycle(self, client):
        """测试完整的请求生命周期日志"""
        with patch("app.middleware.logging_middleware.logger") as mock_logger:
            response = client.get("/test")

            assert response.status_code == 200

            # 验证日志调用顺序
            # 1. 请求开始
            # 2. 请求完成
            info_calls = mock_logger.info.call_args_list
            assert len(info_calls) >= 2

            # 第一个调用应该是请求开始
            first_log = info_calls[0][0][0]
            assert "Request started" in first_log

            # 最后一个调用应该是请求完成
            last_log = info_calls[-1][0][0]
            assert "Request completed" in last_log

    def test_error_lifecycle(self, client):
        """测试错误请求的生命周期日志"""
        with patch("app.middleware.logging_middleware.logger") as mock_logger:
            response = client.get("/error")

            assert response.status_code == 500

            # 验证日志调用
            # 1. 请求开始 (info)
            # 2. 请求失败 (error)
            assert mock_logger.info.called
            assert mock_logger.error.called

            # 验证错误日志包含堆栈信息
            error_call = mock_logger.error.call_args
            error_extra = error_call[1].get("extra", {})
            assert "traceback" in error_extra
            assert "error_type" in error_extra
            assert error_extra["error_type"] == "ValueError"

