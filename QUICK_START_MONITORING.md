# 🚀 监控和测试功能快速启动指南

## 📋 前置要求

确保以下服务正在运行：
- ✅ PostgreSQL 数据库
- ✅ Redis 服务器
- ✅ 后端服务 (FastAPI)
- ✅ 前端服务 (Next.js)

---

## ⚡ 快速验证

### 1. 验证监控功能

```bash
# 进入后端目录
cd backend

# 安装验证工具依赖
pip install httpx rich

# 运行验证脚本
python tests/verify_monitoring.py
```

**预期输出**:
```
✓ 后端服务正在运行
📊 发送测试请求...
📈 获取性能指标...
┏━━━━━━━━━━━━━━┳━━━━━━━━━━┳━━━━━━━━┓
┃ 指标         ┃ 值       ┃ 状态   ┃
┣━━━━━━━━━━━━━━╋━━━━━━━━━━╋━━━━━━━━┫
┃ API响应时间  ┃ 120.5ms  ┃ ✓ 优秀 ┃
┃ 缓存命中率   ┃ 75.2%    ┃ ✓ 良好 ┃
...
```

### 2. 查看监控面板

在浏览器中访问：
```
http://localhost:3000/admin/performance
```

你将看到：
- 📊 实时性能指标卡片
- 📈 数据库和Redis状态
- 🎯 高频API端点统计表格
- 💡 智能优化建议

---

## 🧪 运行测试

### 方式一：使用测试脚本（推荐）

```bash
cd backend

# 交互式菜单
./tests/run_tests.sh

# 或直接运行特定测试
./tests/run_tests.sh unit      # 单元测试
./tests/run_tests.sh e2e       # E2E测试
./tests/run_tests.sh quality   # 代码质量检查
```

### 方式二：手动运行

#### E2E测试
```bash
cd backend
pytest tests/e2e/test_user_workflow.py -v
```

#### 负载测试 - k6
```bash
# 安装k6（仅首次）
brew install k6  # MacOS

# 运行测试
cd backend/tests/load
k6 run --vus 10 --duration 30s load-test.js
```

#### 负载测试 - Locust
```bash
# 安装Locust（仅首次）
pip install locust

# Web界面模式
cd backend/tests/load
locust -f locustfile.py --host http://localhost:8000
# 然后访问 http://localhost:8089

# 或无头模式
locust -f locustfile.py --headless \
  --users 10 --spawn-rate 2 --run-time 60s \
  --host http://localhost:8000
```

---

## 📊 监控API使用

### 获取性能指标

```bash
# 综合性能指标
curl http://localhost:8000/api/health/performance | jq

# 端点统计
curl http://localhost:8000/api/health/metrics/endpoints | jq

# 请求速率（最近30分钟）
curl "http://localhost:8000/api/health/metrics/rpm?minutes=30" | jq
```

### 响应示例

```json
{
  "api_response_time_avg": 120.5,
  "cache_hit_rate": 75.2,
  "memory_usage_percent": 45.3,
  "request_count_minute": 35.8,
  "top_endpoints": [
    {
      "endpoint": "/api/items/",
      "method": "GET",
      "total_requests": 1234,
      "avg_response_time": 85.4
    }
  ]
}
```

---

## 🎯 测试覆盖范围

### E2E测试覆盖
- ✅ 用户注册和登录
- ✅ 物品CRUD操作
- ✅ 推荐系统
- ✅ 健康检查和指标
- ✅ 错误处理

### 负载测试场景
- ✅ 并发用户模拟
- ✅ 真实用户行为（查看/创建/更新/删除）
- ✅ 性能阈值验证
- ✅ 错误率统计

---

## 📈 性能基准

### 目标指标

| 指标 | 优秀 | 良好 | 需优化 |
|------|------|------|--------|
| API响应时间(p95) | <200ms | <500ms | ≥500ms |
| 缓存命中率 | ≥80% | 60-79% | <60% |
| 内存使用 | <60% | 60-79% | ≥80% |
| 错误率 | <1% | 1-5% | ≥5% |

### 负载能力

| 场景 | 并发用户 | 目标RPS | 响应时间 |
|------|----------|---------|----------|
| 轻负载 | 10 | 50+ | <300ms |
| 中负载 | 50 | 200+ | <500ms |
| 重负载 | 100 | 400+ | <1000ms |

---

## 🔍 故障排查

### 问题：验证脚本无法连接

**解决方案**:
```bash
# 1. 检查后端服务
ps aux | grep uvicorn

# 2. 如果未运行，启动后端
cd backend
uvicorn app.main:app --reload

# 3. 检查端口
lsof -i :8000
```

### 问题：Redis连接失败

**解决方案**:
```bash
# 1. 检查Redis状态
redis-cli ping
# 应返回 PONG

# 2. 如果未运行，启动Redis
brew services start redis  # MacOS
# 或
redis-server

# 3. 检查环境变量
echo $REDIS_HOST
echo $REDIS_PORT
```

### 问题：性能指标为0

**原因**: 尚未有足够的请求数据

**解决方案**:
```bash
# 运行验证脚本生成测试数据
python tests/verify_monitoring.py

# 或使用curl发送一些请求
for i in {1..20}; do
  curl http://localhost:8000/api/health
  sleep 0.1
done
```

---

## 📚 相关文档

- 📖 [完整实现文档](MONITORING_AND_TESTING_IMPLEMENTATION.md)
- 📖 [负载测试指南](backend/tests/load/README.md)
- 📖 [API文档](http://localhost:8000/docs)

---

## 💡 最佳实践

### 1. 定期监控
- 每天查看性能监控面板
- 关注响应时间趋势
- 监控缓存命中率变化

### 2. 压力测试
- 每次重大更新后运行负载测试
- 记录性能基准数据
- 对比优化前后的差异

### 3. E2E测试
- 集成到CI/CD流程
- 每次部署前运行
- 确保核心功能正常

### 4. 性能优化
- 根据监控数据找出瓶颈
- 优先优化高频端点
- 定期清理无用数据

---

## 🎉 下一步

1. ✅ 验证监控功能正常工作
2. ✅ 运行E2E测试确保功能完整
3. ✅ 执行负载测试评估性能
4. 📊 根据监控数据进行性能优化
5. 🚀 准备生产环境部署

---

*如有问题，请查看完整实现文档或提交Issue*
