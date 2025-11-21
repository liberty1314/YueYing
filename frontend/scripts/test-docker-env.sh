#!/bin/bash

# Docker 环境变量测试脚本
# 用途：验证环境变量在 Docker 容器中是否正确传递

set -e

echo "🐳 测试 Docker 环境变量传递..."
echo ""

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查 docker-compose 是否可用
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ docker-compose 未安装${NC}"
    exit 1
fi

echo "1️⃣ 检查 docker-compose.yml 配置..."

# 检查 docker-compose.yml 中的前端服务配置
if grep -q "frontend:" ../../docker-compose.yml; then
    echo -e "${GREEN}✅ 找到前端服务配置${NC}"
else
    echo -e "${RED}❌ 未找到前端服务配置${NC}"
    exit 1
fi

echo ""
echo "2️⃣ 检查环境变量配置..."

# 检查必需的环境变量是否在 docker-compose.yml 中定义
required_vars=("API_URL" "NEXT_PUBLIC_API_URL" "NEXTAUTH_SECRET" "NODE_ENV")

for var in "${required_vars[@]}"; do
    if grep -q "$var" ../../docker-compose.yml; then
        echo -e "${GREEN}✅ $var 已配置${NC}"
    else
        echo -e "${YELLOW}⚠️  $var 未在 docker-compose.yml 中配置${NC}"
    fi
done

echo ""
echo "3️⃣ 测试容器内环境变量（需要容器运行）..."

# 检查容器是否运行
if docker-compose ps | grep -q "frontend.*Up"; then
    echo -e "${GREEN}✅ 前端容器正在运行${NC}"
    echo ""
    echo "容器内环境变量："
    docker-compose exec -T frontend sh -c 'env | grep -E "API_URL|NEXT_PUBLIC|NEXTAUTH|NODE_ENV" | sort'
    echo ""
    echo "运行验证脚本："
    docker-compose exec -T frontend pnpm verify-env
else
    echo -e "${YELLOW}⚠️  前端容器未运行，跳过容器内测试${NC}"
    echo "提示：运行 'docker-compose up frontend' 启动容器后再测试"
fi

echo ""
echo "4️⃣ 检查 Dockerfile 构建参数..."

if grep -q "ARG NEXT_PUBLIC_API_URL" ../Dockerfile; then
    echo -e "${GREEN}✅ Dockerfile 包含构建参数配置${NC}"
else
    echo -e "${YELLOW}⚠️  Dockerfile 未配置构建参数${NC}"
fi

echo ""
echo "5️⃣ 测试总结"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ 配置文件检查完成"
echo "📝 建议："
echo "   1. 确保 .env 文件存在于项目根目录"
echo "   2. 在 docker-compose.yml 中使用 \${VAR:-default} 语法"
echo "   3. 生产环境构建时使用 --build-arg 传递 NEXT_PUBLIC_* 变量"
echo ""
echo "示例构建命令："
echo "docker build \\"
echo "  --target production \\"
echo "  --build-arg NEXT_PUBLIC_API_URL=https://api.example.com/api \\"
echo "  --build-arg NEXT_PUBLIC_WS_URL=wss://api.example.com \\"
echo "  -t yueying-frontend:prod ."
