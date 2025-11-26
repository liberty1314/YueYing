import * as fc from 'fast-check';

/**
 * Property-Based Testing 生成器
 * 用于生成测试数据
 */

// 基础类型生成器
export const arbitraries = {
    // 非空字符串
    nonEmptyString: fc.string({ minLength: 1, maxLength: 100 }),

    // 邮箱地址
    email: fc.emailAddress(),

    // URL
    url: fc.webUrl(),

    // 正整数
    positiveInteger: fc.integer({ min: 1, max: 1000000 }),

    // 非负整数
    nonNegativeInteger: fc.integer({ min: 0, max: 1000000 }),

    // 评分 (0-10)
    rating: fc.integer({ min: 0, max: 10 }),

    // 日期字符串 (ISO 8601)
    isoDateString: fc
        .integer({ min: 946684800000, max: 1924905599999 }) // 2000-01-01 to 2030-12-31
        .map((timestamp) => new Date(timestamp).toISOString()),

    // 用户名 (字母数字，3-20字符)
    username: fc.stringMatching(/^[a-zA-Z0-9_]{3,20}$/),

    // 密码 (至少8字符)
    password: fc.string({ minLength: 8, maxLength: 50 }),

    // 标签数组
    tags: fc.array(fc.string({ minLength: 1, maxLength: 20 }), {
        minLength: 0,
        maxLength: 10,
    }),

    // 内容类型
    itemType: fc.constantFrom('movie', 'tv', 'anime', 'book'),

    // 状态
    status: fc.constantFrom('want', 'in_progress', 'completed'),

    // 用户角色
    userRole: fc.constantFrom('user', 'admin'),
};

// 复杂对象生成器
export const generators = {
    // 生成用户对象
    user: () =>
        fc.record({
            id: fc.uuid(),
            username: arbitraries.username,
            email: arbitraries.email,
            role: arbitraries.userRole,
            createdAt: arbitraries.isoDateString,
            updatedAt: arbitraries.isoDateString,
        }),

    // 生成用户项目对象
    userItem: () =>
        fc.record({
            id: fc.uuid(),
            userId: fc.uuid(),
            itemType: arbitraries.itemType,
            externalId: arbitraries.nonEmptyString,
            title: arbitraries.nonEmptyString,
            status: arbitraries.status,
            rating: fc.option(arbitraries.rating, { nil: undefined }),
            tags: arbitraries.tags,
            notes: fc.option(arbitraries.nonEmptyString, { nil: undefined }),
            createdAt: arbitraries.isoDateString,
            updatedAt: arbitraries.isoDateString,
        }),

    // 生成 API 错误对象
    apiError: () =>
        fc.record({
            message: arbitraries.nonEmptyString,
            code: fc.constantFrom(
                'NETWORK_ERROR',
                'UNAUTHORIZED',
                'FORBIDDEN',
                'NOT_FOUND',
                'VALIDATION_ERROR',
                'SERVER_ERROR'
            ),
            status: fc.constantFrom(400, 401, 403, 404, 500),
        }),

    // 生成环境变量配置
    envConfig: () =>
        fc.record({
            NEXT_PUBLIC_API_URL: arbitraries.url,
            API_URL: arbitraries.url,
        }),
};

// 约束生成器 - 用于生成符合特定约束的数据
export const constrained = {
    // 生成有效的触摸目标尺寸 (至少 44x44 像素)
    touchTargetSize: fc.record({
        width: fc.integer({ min: 44, max: 200 }),
        height: fc.integer({ min: 44, max: 200 }),
    }),

    // 生成响应式断点
    breakpoint: fc.constantFrom('mobile', 'tablet', 'desktop'),

    // 生成视口宽度
    viewportWidth: fc.oneof(
        fc.integer({ min: 320, max: 767 }), // mobile
        fc.integer({ min: 768, max: 1023 }), // tablet
        fc.integer({ min: 1024, max: 1920 }) // desktop
    ),

    // 生成主题模式
    themeMode: fc.constantFrom('light', 'dark'),

    // 生成缓存键
    cacheKey: fc.tuple(arbitraries.nonEmptyString, fc.jsonValue()).map(
        ([endpoint, params]) => `${endpoint}:${JSON.stringify(params)}`
    ),
};
