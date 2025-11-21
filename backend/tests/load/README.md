# 负载测试指南

## 安装依赖

### k6 (推荐)
```bash
# MacOS
brew install k6

# Windows
choco install k6

# Linux
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6
```

### Locust
```bash
pip install locust
```

## 运行测试

### 使用k6

#### 1. 基础负载测试
```bash
k6 run load-test.js
```

#### 2. 自定义参数
```bash
# 指定虚拟用户数和持续时间
k6 run --vus 50 --duration 60s load-test.js

# 指定目标主机
k6 run --env BASE_URL=http://your-host:8000 load-test.js
```

#### 3. 生成HTML报告
```bash
k6 run --out html=report.html load-test.js
```

### 使用Locust

#### 1. Web界面模式（推荐）
```bash
locust -f locustfile.py --host http://localhost:8000
```
然后访问 http://localhost:8089

#### 2. 无头模式
```bash
# 10个用户，每秒增加2个，运行60秒
locust -f locustfile.py --headless \
  --users 10 \
  --spawn-rate 2 \
  --run-time 60s \
  --host http://localhost:8000
```

#### 3. 分布式测试
```bash
# 主节点
locust -f locustfile.py --master --host http://localhost:8000

# 工作节点（可以在多台机器上运行）
locust -f locustfile.py --worker --master-host=<master-ip>
```

## 测试场景

### 1. 烟雾测试（快速验证）
```bash
k6 run --vus 1 --duration 10s load-test.js
```

### 2. 负载测试（常规负载）
```bash
k6 run --vus 20 --duration 120s load-test.js
```

### 3. 压力测试（极限测试）
```bash
k6 run --vus 100 --duration 300s load-test.js
```

### 4. 峰值测试（模拟流量峰值）
```bash
locust -f locustfile.py --headless \
  --users 100 \
  --spawn-rate 10 \
  --run-time 300s \
  --host http://localhost:8000
```

## 性能指标解读

### 关键指标

1. **响应时间（Response Time）**
   - p50 (中位数): < 200ms (优秀)
   - p95: < 500ms (良好)
   - p99: < 1000ms (可接受)

2. **请求速率（RPS）**
   - 目标: > 100 RPS (根据业务需求调整)

3. **错误率（Error Rate）**
   - 目标: < 1% (生产环境)
   - 目标: < 5% (测试环境)

4. **并发用户数**
   - 根据业务需求确定
   - 建议从小到大逐步增加

### 性能基准

| 场景 | 虚拟用户数 | 持续时间 | 预期RPS | p95响应时间 |
|------|-----------|---------|---------|------------|
| 轻负载 | 10 | 60s | 50+ | < 300ms |
| 中负载 | 50 | 120s | 200+ | < 500ms |
| 重负载 | 100 | 300s | 400+ | < 1000ms |

## 测试报告

测试完成后会生成：
- `load-test-results.json` (k6)
- Locust Web界面提供实时统计和导出功能

## 故障排查

### 高错误率
1. 检查数据库连接池配置
2. 检查Redis连接
3. 查看应用日志
4. 检查系统资源使用情况

### 高响应时间
1. 检查数据库查询性能
2. 检查是否启用缓存
3. 检查网络延迟
4. 考虑增加应用实例

### 连接错误
1. 检查防火墙设置
2. 检查应用是否正常运行
3. 检查端口是否正确
4. 检查主机地址配置

## 优化建议

根据测试结果，可以考虑以下优化：

1. **数据库优化**
   - 添加索引
   - 优化查询
   - 使用连接池

2. **缓存优化**
   - 增加缓存命中率
   - 调整缓存过期时间
   - 使用Redis缓存

3. **代码优化**
   - 减少数据库查询次数
   - 使用异步处理
   - 优化算法复杂度

4. **基础设施优化**
   - 增加服务器资源
   - 使用负载均衡
   - CDN加速静态资源
