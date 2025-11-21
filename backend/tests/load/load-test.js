/**
 * 负载测试脚本 - 使用k6进行压力测试
 * 
 * 安装k6: brew install k6 (MacOS) 或 https://k6.io/docs/getting-started/installation/
 * 运行测试: k6 run load-test.js
 * 
 * 测试场景：
 * - 10个虚拟用户并发测试30秒
 * - 测试核心API端点的性能
 * - 模拟真实用户行为
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// 自定义指标
const errorRate = new Rate('errors');
const loginDuration = new Trend('login_duration');
const itemCreationDuration = new Trend('item_creation_duration');
const recommendationDuration = new Trend('recommendation_duration');

// 测试配置
export const options = {
  stages: [
    { duration: '10s', target: 10 },   // 10秒内逐渐增加到10个用户
    { duration: '30s', target: 10 },   // 维持10个用户30秒
    { duration: '10s', target: 20 },   // 增加到20个用户
    { duration: '30s', target: 20 },   // 维持20个用户30秒
    { duration: '10s', target: 0 },    // 逐渐减少到0
  ],
  thresholds: {
    'http_req_duration': ['p(95)<500'],  // 95%的请求应该在500ms内完成
    'errors': ['rate<0.1'],               // 错误率应该低于10%
    'http_req_failed': ['rate<0.05'],     // 失败率应该低于5%
  },
};

// 基础URL配置
const BASE_URL = __ENV.BASE_URL || 'http://localhost:8000';

// 生成随机用户数据
function generateUserData() {
  const randomId = Math.floor(Math.random() * 100000);
  return {
    username: `loadtest_user_${randomId}`,
    email: `loadtest_${randomId}@example.com`,
    password: 'LoadTest123!',
  };
}

// 生成随机物品数据
function generateItemData() {
  const categories = ['books', 'electronics', 'sports', 'clothing', 'toys'];
  const randomId = Math.floor(Math.random() * 10000);
  
  return {
    name: `Test Item ${randomId}`,
    description: `Description for test item ${randomId}`,
    category: categories[Math.floor(Math.random() * categories.length)],
    acquisition_date: '2024-01-01',
    price: Math.floor(Math.random() * 1000) + 10,
    location: `Location ${randomId}`,
  };
}

// 用户注册
function register(userData) {
  const response = http.post(
    `${BASE_URL}/api/auth/register`,
    JSON.stringify(userData),
    {
      headers: { 'Content-Type': 'application/json' },
    }
  );

  const success = check(response, {
    'registration successful': (r) => r.status === 200 || r.status === 400,
    'registration has token': (r) => r.status === 200 ? r.json('access_token') !== undefined : true,
  });

  errorRate.add(!success);

  if (response.status === 200) {
    return response.json('access_token');
  }
  return null;
}

// 用户登录
function login(username, password) {
  const startTime = Date.now();
  
  const response = http.post(
    `${BASE_URL}/api/auth/login`,
    {
      username: username,
      password: password,
    },
    {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    }
  );

  loginDuration.add(Date.now() - startTime);

  const success = check(response, {
    'login successful': (r) => r.status === 200,
    'login has token': (r) => r.json('access_token') !== undefined,
  });

  errorRate.add(!success);

  if (response.status === 200) {
    return response.json('access_token');
  }
  return null;
}

// 创建物品
function createItem(token, itemData) {
  const startTime = Date.now();
  
  const response = http.post(
    `${BASE_URL}/api/items/`,
    JSON.stringify(itemData),
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    }
  );

  itemCreationDuration.add(Date.now() - startTime);

  const success = check(response, {
    'item created': (r) => r.status === 200,
    'item has id': (r) => r.status === 200 ? r.json('id') !== undefined : true,
  });

  errorRate.add(!success);

  if (response.status === 200) {
    return response.json('id');
  }
  return null;
}

// 获取物品列表
function getItems(token) {
  const response = http.get(
    `${BASE_URL}/api/items/`,
    {
      headers: { 'Authorization': `Bearer ${token}` },
    }
  );

  const success = check(response, {
    'get items successful': (r) => r.status === 200,
    'items is array': (r) => Array.isArray(r.json()),
  });

  errorRate.add(!success);
  return response.status === 200;
}

// 获取物品详情
function getItemDetail(token, itemId) {
  const response = http.get(
    `${BASE_URL}/api/items/${itemId}`,
    {
      headers: { 'Authorization': `Bearer ${token}` },
    }
  );

  const success = check(response, {
    'get item detail successful': (r) => r.status === 200 || r.status === 404,
  });

  errorRate.add(!success);
  return response.status === 200;
}

// 获取推荐
function getRecommendations(token) {
  const startTime = Date.now();
  
  const response = http.get(
    `${BASE_URL}/api/recommendations/`,
    {
      headers: { 'Authorization': `Bearer ${token}` },
    }
  );

  recommendationDuration.add(Date.now() - startTime);

  const success = check(response, {
    'get recommendations successful': (r) => r.status === 200,
  });

  errorRate.add(!success);
  return response.status === 200;
}

// 健康检查
function healthCheck() {
  const response = http.get(`${BASE_URL}/api/health`);

  const success = check(response, {
    'health check successful': (r) => r.status === 200,
    'status is healthy': (r) => r.json('status') === 'healthy',
  });

  errorRate.add(!success);
  return response.status === 200;
}

// 获取统计数据
function getStats(token) {
  const response = http.get(
    `${BASE_URL}/api/stats/comprehensive?time_period=week`,
    {
      headers: { 'Authorization': `Bearer ${token}` },
    }
  );

  const success = check(response, {
    'get stats successful': (r) => r.status === 200,
  });

  errorRate.add(!success);
  return response.status === 200;
}

// 主测试场景
export default function () {
  // 1. 健康检查（预热）
  healthCheck();
  sleep(1);

  // 2. 注册新用户
  const userData = generateUserData();
  let token = register(userData);
  
  // 如果注册失败（可能已存在），尝试登录
  if (!token) {
    token = login(userData.username, userData.password);
  }

  if (!token) {
    console.error('Failed to get authentication token');
    return;
  }

  sleep(1);

  // 3. 创建物品
  const itemData = generateItemData();
  const itemId = createItem(token, itemData);
  sleep(1);

  // 4. 获取物品列表
  getItems(token);
  sleep(1);

  // 5. 获取物品详情
  if (itemId) {
    getItemDetail(token, itemId);
    sleep(1);
  }

  // 6. 获取推荐
  getRecommendations(token);
  sleep(1);

  // 7. 获取统计数据
  getStats(token);
  sleep(1);

  // 8. 再次获取物品列表（测试缓存）
  getItems(token);
  sleep(1);
}

// 测试结束后的总结
export function handleSummary(data) {
  return {
    'stdout': textSummary(data, { indent: ' ', enableColors: true }),
    'load-test-results.json': JSON.stringify(data, null, 2),
  };
}

// 文本总结辅助函数
function textSummary(data, options) {
  const indent = options.indent || '';
  const enableColors = options.enableColors || false;

  let summary = '\n' + indent + '=== Load Test Summary ===\n\n';
  
  // 基础统计
  summary += indent + `Total Requests: ${data.metrics.http_reqs.values.count}\n`;
  summary += indent + `Request Rate: ${data.metrics.http_reqs.values.rate.toFixed(2)}/s\n`;
  summary += indent + `Failed Requests: ${data.metrics.http_req_failed.values.passes || 0}\n`;
  summary += indent + `Error Rate: ${((data.metrics.errors?.values.rate || 0) * 100).toFixed(2)}%\n\n`;
  
  // 响应时间
  summary += indent + 'Response Times:\n';
  summary += indent + `  Average: ${data.metrics.http_req_duration.values.avg.toFixed(2)}ms\n`;
  summary += indent + `  Median: ${data.metrics.http_req_duration.values.med.toFixed(2)}ms\n`;
  summary += indent + `  95th percentile: ${data.metrics.http_req_duration.values['p(95)'].toFixed(2)}ms\n`;
  summary += indent + `  Max: ${data.metrics.http_req_duration.values.max.toFixed(2)}ms\n\n`;
  
  // 自定义指标
  if (data.metrics.login_duration) {
    summary += indent + `Login Duration (avg): ${data.metrics.login_duration.values.avg.toFixed(2)}ms\n`;
  }
  if (data.metrics.item_creation_duration) {
    summary += indent + `Item Creation Duration (avg): ${data.metrics.item_creation_duration.values.avg.toFixed(2)}ms\n`;
  }
  if (data.metrics.recommendation_duration) {
    summary += indent + `Recommendation Duration (avg): ${data.metrics.recommendation_duration.values.avg.toFixed(2)}ms\n`;
  }
  
  summary += '\n' + indent + '=========================\n';
  
  return summary;
}
