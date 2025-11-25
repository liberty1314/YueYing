/**
 * API 测试工具
 * 
 * 用于测试前端与后端API的对接情况
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export interface TestResult {
  endpoint: string;
  method: string;
  status: 'success' | 'failed' | 'warning';
  responseTime: number;
  statusCode?: number;
  error?: string;
  data?: any;
}

export interface TestReport {
  totalTests: number;
  passed: number;
  failed: number;
  warnings: number;
  results: TestResult[];
  startTime: Date;
  endTime?: Date;
  duration?: number;
}

/**
 * 测试单个API端点
 */
export async function testEndpoint(
  endpoint: string,
  method: string = 'GET',
  body?: any,
  requiresAuth: boolean = true
): Promise<TestResult> {
  const startTime = Date.now();

  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // 如果需要认证，添加 token
    if (requiresAuth) {
      // 从authStore获取token
      const authStorage = localStorage.getItem('auth-storage');
      let token = null;
      if (authStorage) {
        try {
          const parsed = JSON.parse(authStorage);
          token = parsed.state?.token;
        } catch (e) {
          console.error('解析auth-storage失败:', e);
        }
      }

      if (!token) {
        return {
          endpoint,
          method,
          status: 'failed',
          responseTime: Date.now() - startTime,
          error: '未登录：缺少认证 token',
        };
      }
      headers['Authorization'] = `Bearer ${token}`;
    }

    const options: RequestInit = {
      method,
      headers,
    };

    if (body && method !== 'GET') {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    const responseTime = Date.now() - startTime;

    let data;
    try {
      data = await response.json();
    } catch {
      data = null;
    }

    if (response.ok) {
      return {
        endpoint,
        method,
        status: 'success',
        responseTime,
        statusCode: response.status,
        data,
      };
    } else {
      return {
        endpoint,
        method,
        status: 'failed',
        responseTime,
        statusCode: response.status,
        error: data?.detail || response.statusText,
        data,
      };
    }
  } catch (error) {
    return {
      endpoint,
      method,
      status: 'failed',
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : '未知错误',
    };
  }
}

/**
 * 运行完整的API测试套件
 */
export async function runAPITests(): Promise<TestReport> {
  const report: TestReport = {
    totalTests: 0,
    passed: 0,
    failed: 0,
    warnings: 0,
    results: [],
    startTime: new Date(),
  };

  // 定义测试用例
  const tests = [
    // 1. 推荐系统测试
    {
      name: '个性化推荐 - weighted策略',
      endpoint: '/recommendations/for-you?strategy=weighted&limit=10',
      method: 'GET',
      requiresAuth: true,
    },
    {
      name: '个性化推荐 - cascade策略',
      endpoint: '/recommendations/for-you?strategy=cascade&limit=10',
      method: 'GET',
      requiresAuth: true,
    },
    {
      name: '个性化推荐 - switch策略',
      endpoint: '/recommendations/for-you?strategy=switch&limit=10',
      method: 'GET',
      requiresAuth: true,
    },
    {
      name: '探索发现推荐',
      endpoint: '/recommendations/discover?limit=20',
      method: 'GET',
      requiresAuth: true,
    },

    // 2. 统一搜索测试
    {
      name: '统一搜索 - 全类型',
      endpoint: '/search?q=星际穿越&type=all&page=1&page_size=20',
      method: 'GET',
      requiresAuth: false,
    },
    {
      name: '统一搜索 - 电影类型',
      endpoint: '/search?q=盗梦空间&type=movie&page=1&page_size=10',
      method: 'GET',
      requiresAuth: false,
    },

    // 3. 统计数据测试
    {
      name: '统计概览',
      endpoint: '/stats/overview',
      method: 'GET',
      requiresAuth: true,
    },
    {
      name: '类型分布',
      endpoint: '/stats/type-distribution',
      method: 'GET',
      requiresAuth: true,
    },
    {
      name: '评分分布',
      endpoint: '/stats/rating-distribution',
      method: 'GET',
      requiresAuth: true,
    },
    {
      name: '时间趋势',
      endpoint: '/stats/time-trend?period=month&months=6',
      method: 'GET',
      requiresAuth: true,
    },

    // 4. 用户收藏库测试
    {
      name: '获取用户收藏列表',
      endpoint: '/user-items?page=1&page_size=20',
      method: 'GET',
      requiresAuth: true,
    },

    // 5. AI功能测试
    {
      name: 'AI标签生成',
      endpoint: '/ai-tags/generate',
      method: 'POST',
      body: { text: '这是一部精彩的科幻电影，讲述了时间旅行的故事' },
      requiresAuth: true,
    },
  ];

  // 执行测试
  for (const test of tests) {
    console.log(`测试: ${test.name}`);
    const result = await testEndpoint(
      test.endpoint,
      test.method,
      test.body,
      test.requiresAuth
    );

    report.results.push(result);
    report.totalTests++;

    if (result.status === 'success') {
      report.passed++;
    } else if (result.status === 'failed') {
      report.failed++;
    } else {
      report.warnings++;
    }

    // 避免请求过快
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  report.endTime = new Date();
  report.duration = report.endTime.getTime() - report.startTime.getTime();

  return report;
}

/**
 * 生成测试报告摘要
 */
export function generateReportSummary(report: TestReport): string {
  const passRate = ((report.passed / report.totalTests) * 100).toFixed(1);

  return `
API 测试报告
============
总测试数: ${report.totalTests}
通过: ${report.passed} (${passRate}%)
失败: ${report.failed}
警告: ${report.warnings}
总耗时: ${report.duration}ms

详细结果:
${report.results.map((r, i) => `
${i + 1}. ${r.endpoint}
   状态: ${r.status.toUpperCase()}
   响应时间: ${r.responseTime}ms
   ${r.statusCode ? `状态码: ${r.statusCode}` : ''}
   ${r.error ? `错误: ${r.error}` : ''}
`).join('\n')}
  `;
}
