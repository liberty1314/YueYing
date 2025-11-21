#!/usr/bin/env node

/**
 * 环境变量验证脚本
 * 
 * 用途：验证所有必需的环境变量是否正确配置
 * 使用：node scripts/verify-env.js
 */

const requiredVars = [
    'NEXT_PUBLIC_API_URL',
    'API_URL',
    'NEXTAUTH_SECRET',
];

const recommendedVars = [
    'NEXTAUTH_URL',
    'NODE_ENV',
    'PORT',
];

const optionalVars = [
    'NEXT_PUBLIC_WS_URL',
    'NEXT_PUBLIC_DEBUG',
    'NEXT_PUBLIC_ENABLE_ANALYTICS',
    'NEXT_PUBLIC_ENABLE_DEVTOOLS',
    'NEXT_PUBLIC_VERBOSE_LOGGING',
    'NEXT_TELEMETRY_DISABLED',
    'HOSTNAME',
];

console.log('🔍 验证环境变量配置...\n');

let hasErrors = false;
let hasWarnings = false;

// 检查必需变量
console.log('📋 必需变量 (Required):');
requiredVars.forEach((varName) => {
    const value = process.env[varName];
    if (!value) {
        console.log(`  ❌ ${varName}: 未设置`);
        hasErrors = true;
    } else if (value.includes('change-in-production') || value.includes('your-secret')) {
        console.log(`  ⚠️  ${varName}: 使用默认值，生产环境必须更改`);
        hasWarnings = true;
    } else {
        console.log(`  ✅ ${varName}: ${maskSensitive(varName, value)}`);
    }
});

console.log('\n📋 推荐变量 (Recommended):');
recommendedVars.forEach((varName) => {
    const value = process.env[varName];
    if (!value) {
        console.log(`  ⚠️  ${varName}: 未设置 (将使用默认值)`);
        hasWarnings = true;
    } else {
        console.log(`  ✅ ${varName}: ${maskSensitive(varName, value)}`);
    }
});

console.log('\n📋 可选变量 (Optional):');
optionalVars.forEach((varName) => {
    const value = process.env[varName];
    if (value) {
        console.log(`  ✅ ${varName}: ${maskSensitive(varName, value)}`);
    } else {
        console.log(`  ⚪ ${varName}: 未设置`);
    }
});

// 验证 URL 格式
console.log('\n🔗 URL 格式验证:');
validateUrl('NEXT_PUBLIC_API_URL', process.env.NEXT_PUBLIC_API_URL);
validateUrl('API_URL', process.env.API_URL);
validateUrl('NEXTAUTH_URL', process.env.NEXTAUTH_URL);
validateUrl('NEXT_PUBLIC_WS_URL', process.env.NEXT_PUBLIC_WS_URL, true);

// 验证环境一致性
console.log('\n🔄 环境一致性检查:');
checkConsistency();

// 安全检查
console.log('\n🔒 安全检查:');
securityCheck();

// 总结
console.log('\n' + '='.repeat(50));
if (hasErrors) {
    console.log('❌ 验证失败：存在必需变量未设置');
    process.exit(1);
} else if (hasWarnings) {
    console.log('⚠️  验证通过但有警告：请检查上述警告信息');
    process.exit(0);
} else {
    console.log('✅ 所有环境变量配置正确');
    process.exit(0);
}

/**
 * 屏蔽敏感信息
 */
function maskSensitive(varName, value) {
    const sensitiveVars = ['SECRET', 'PASSWORD', 'KEY', 'TOKEN'];
    const isSensitive = sensitiveVars.some(keyword => varName.includes(keyword));

    if (isSensitive && value.length > 8) {
        return value.substring(0, 4) + '****' + value.substring(value.length - 4);
    }
    return value;
}

/**
 * 验证 URL 格式
 */
function validateUrl(varName, value, optional = false) {
    if (!value) {
        if (!optional) {
            console.log(`  ❌ ${varName}: URL 未设置`);
            hasErrors = true;
        }
        return;
    }

    try {
        const url = new URL(value);

        // 检查协议
        const validProtocols = ['http:', 'https:', 'ws:', 'wss:'];
        if (!validProtocols.includes(url.protocol)) {
            console.log(`  ❌ ${varName}: 无效的协议 ${url.protocol}`);
            hasErrors = true;
            return;
        }

        // 生产环境安全检查
        if (process.env.NODE_ENV === 'production') {
            if (varName.includes('API_URL') && url.protocol === 'http:') {
                console.log(`  ⚠️  ${varName}: 生产环境建议使用 HTTPS`);
                hasWarnings = true;
            }
            if (varName.includes('WS_URL') && url.protocol === 'ws:') {
                console.log(`  ⚠️  ${varName}: 生产环境建议使用 WSS`);
                hasWarnings = true;
            }
        }

        console.log(`  ✅ ${varName}: 格式正确 (${url.protocol}//${url.host})`);
    } catch (error) {
        console.log(`  ❌ ${varName}: 无效的 URL 格式`);
        hasErrors = true;
    }
}

/**
 * 检查环境一致性
 */
function checkConsistency() {
    const nodeEnv = process.env.NODE_ENV;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const nextAuthUrl = process.env.NEXTAUTH_URL;

    // 检查 NODE_ENV
    if (nodeEnv === 'production') {
        console.log('  ℹ️  当前环境: 生产环境');

        // 生产环境检查
        if (apiUrl && apiUrl.includes('localhost')) {
            console.log('  ⚠️  生产环境不应使用 localhost');
            hasWarnings = true;
        }
        if (nextAuthUrl && nextAuthUrl.includes('localhost')) {
            console.log('  ⚠️  生产环境不应使用 localhost');
            hasWarnings = true;
        }
    } else {
        console.log('  ℹ️  当前环境: 开发环境');
    }

    // 检查 API URL 一致性
    const serverApiUrl = process.env.API_URL;
    if (serverApiUrl && apiUrl) {
        const serverHost = serverApiUrl.includes('backend') ? 'backend' : 'localhost';
        const clientHost = apiUrl.includes('localhost') ? 'localhost' : 'other';

        if (serverHost === 'backend' && clientHost === 'localhost') {
            console.log('  ✅ API URL 配置一致 (Docker 环境)');
        } else if (serverHost === 'localhost' && clientHost === 'localhost') {
            console.log('  ✅ API URL 配置一致 (本地环境)');
        } else {
            console.log('  ⚠️  API URL 配置可能不一致');
            hasWarnings = true;
        }
    }
}

/**
 * 安全检查
 */
function securityCheck() {
    const secret = process.env.NEXTAUTH_SECRET;

    // 检查密钥强度
    if (secret) {
        if (secret.length < 32) {
            console.log('  ⚠️  NEXTAUTH_SECRET 长度不足 32 字符');
            hasWarnings = true;
        } else {
            console.log('  ✅ NEXTAUTH_SECRET 长度符合要求');
        }

        // 检查是否使用默认值
        const defaultSecrets = [
            'your-secret-key-change-in-production',
            'dev-nextauth-secret',
            'change-in-production',
        ];

        if (defaultSecrets.some(def => secret.includes(def))) {
            console.log('  ⚠️  NEXTAUTH_SECRET 使用默认值，生产环境必须更改');
            hasWarnings = true;
        }
    }

    // 检查 NEXT_PUBLIC_ 变量中是否包含敏感信息
    const publicVars = Object.keys(process.env).filter(key => key.startsWith('NEXT_PUBLIC_'));
    const sensitiveKeywords = ['SECRET', 'PASSWORD', 'KEY', 'TOKEN'];

    publicVars.forEach(varName => {
        const value = process.env[varName];
        if (value && sensitiveKeywords.some(keyword => value.toLowerCase().includes(keyword))) {
            console.log(`  ⚠️  ${varName} 可能包含敏感信息`);
            hasWarnings = true;
        }
    });

    if (!hasWarnings) {
        console.log('  ✅ 未发现明显的安全问题');
    }
}
