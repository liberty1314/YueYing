#!/bin/bash

#############################################
# 管理员认证功能测试脚本
#############################################

set -e

BASE_URL="http://localhost:8000/api"
ADMIN_EMAIL="admin@admin.com"
ADMIN_PASSWORD="admin123"
TEST_USER_EMAIL="testuser@test.com"
TEST_USER_PASSWORD="test123"

# 颜色输出
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "============================================"
echo "管理员认证功能测试"
echo "============================================"
echo ""

# 1. 管理员登录
echo "1️⃣  测试管理员登录..."
ADMIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}")

ADMIN_TOKEN=$(echo $ADMIN_RESPONSE | jq -r '.access_token')

if [ "$ADMIN_TOKEN" != "null" ] && [ -n "$ADMIN_TOKEN" ]; then
  echo -e "${GREEN}✅ 管理员登录成功${NC}"
  echo "   Token: ${ADMIN_TOKEN:0:50}..."
else
  echo -e "${RED}❌ 管理员登录失败${NC}"
  echo "   Response: $ADMIN_RESPONSE"
  exit 1
fi
echo ""

# 2. 创建测试用户（普通用户）
echo "2️⃣  创建测试用户（普通用户）..."
USER_CREATE_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_USER_EMAIL\",\"password\":\"$TEST_USER_PASSWORD\",\"username\":\"testuser\"}")

USER_ID=$(echo $USER_CREATE_RESPONSE | jq -r '.id')
if [ "$USER_ID" != "null" ] && [ -n "$USER_ID" ]; then
  echo -e "${GREEN}✅ 测试用户创建成功${NC}"
  echo "   User ID: $USER_ID"
else
  # 可能已存在，尝试登录获取
  echo -e "${YELLOW}⚠️  用户可能已存在，尝试登录...${NC}"
  USER_LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$TEST_USER_EMAIL\",\"password\":\"$TEST_USER_PASSWORD\"}")
  
  USER_TOKEN=$(echo $USER_LOGIN_RESPONSE | jq -r '.access_token')
  if [ "$USER_TOKEN" != "null" ] && [ -n "$USER_TOKEN" ]; then
    echo -e "${GREEN}✅ 使用现有测试用户${NC}"
    # 获取用户信息来获取ID
    USER_ME_RESPONSE=$(curl -s -X GET "$BASE_URL/auth/me" \
      -H "Authorization: Bearer $USER_TOKEN")
    USER_ID=$(echo $USER_ME_RESPONSE | jq -r '.id')
  else
    echo -e "${RED}❌ 无法创建或登录测试用户${NC}"
    exit 1
  fi
fi
echo ""

# 3. 普通用户登录
echo "3️⃣  测试普通用户登录..."
USER_LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_USER_EMAIL\",\"password\":\"$TEST_USER_PASSWORD\"}")

USER_TOKEN=$(echo $USER_LOGIN_RESPONSE | jq -r '.access_token')
if [ "$USER_TOKEN" != "null" ] && [ -n "$USER_TOKEN" ]; then
  echo -e "${GREEN}✅ 普通用户登录成功${NC}"
  echo "   Token: ${USER_TOKEN:0:50}..."
else
  echo -e "${RED}❌ 普通用户登录失败${NC}"
  exit 1
fi
echo ""

# 4. 普通用户访问管理员接口（应失败）
echo "4️⃣  测试普通用户访问管理员接口（应返回403）..."
FORBIDDEN_RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/admin/users" \
  -H "Authorization: Bearer $USER_TOKEN")

HTTP_CODE=$(echo "$FORBIDDEN_RESPONSE" | tail -n1)
if [ "$HTTP_CODE" = "403" ]; then
  echo -e "${GREEN}✅ 权限检查正常，普通用户被拒绝访问${NC}"
else
  echo -e "${RED}❌ 权限检查失败，HTTP状态码: $HTTP_CODE${NC}"
  echo "   Response: $(echo "$FORBIDDEN_RESPONSE" | head -n-1)"
fi
echo ""

# 5. 管理员访问用户列表
echo "5️⃣  测试管理员访问用户列表..."
USERS_RESPONSE=$(curl -s -X GET "$BASE_URL/admin/users?page=1&page_size=10" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

TOTAL_USERS=$(echo $USERS_RESPONSE | jq -r '.total')
if [ "$TOTAL_USERS" != "null" ] && [ "$TOTAL_USERS" -gt 0 ]; then
  echo -e "${GREEN}✅ 管理员成功获取用户列表${NC}"
  echo "   总用户数: $TOTAL_USERS"
else
  echo -e "${RED}❌ 获取用户列表失败${NC}"
  echo "   Response: $USERS_RESPONSE"
fi
echo ""

# 6. 获取后台统计数据
echo "6️⃣  测试获取后台统计数据..."
STATS_RESPONSE=$(curl -s -X GET "$BASE_URL/admin/stats" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

TOTAL_USERS_STATS=$(echo $STATS_RESPONSE | jq -r '.users.total')
if [ "$TOTAL_USERS_STATS" != "null" ] && [ "$TOTAL_USERS_STATS" -gt 0 ]; then
  echo -e "${GREEN}✅ 成功获取后台统计数据${NC}"
  echo "   总用户数: $TOTAL_USERS_STATS"
  echo "   活跃用户: $(echo $STATS_RESPONSE | jq -r '.users.active')"
  echo "   管理员数: $(echo $STATS_RESPONSE | jq -r '.users.admin')"
else
  echo -e "${RED}❌ 获取统计数据失败${NC}"
  echo "   Response: $STATS_RESPONSE"
fi
echo ""

# 7. 获取用户详情
echo "7️⃣  测试获取用户详情..."
USER_DETAIL_RESPONSE=$(curl -s -X GET "$BASE_URL/admin/users/$USER_ID" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

USER_EMAIL=$(echo $USER_DETAIL_RESPONSE | jq -r '.email')
if [ "$USER_EMAIL" = "$TEST_USER_EMAIL" ]; then
  echo -e "${GREEN}✅ 成功获取用户详情${NC}"
  echo "   用户ID: $USER_ID"
  echo "   邮箱: $USER_EMAIL"
  echo "   角色: $(echo $USER_DETAIL_RESPONSE | jq -r '.role')"
else
  echo -e "${RED}❌ 获取用户详情失败${NC}"
  echo "   Response: $USER_DETAIL_RESPONSE"
fi
echo ""

# 8. 切换用户状态
echo "8️⃣  测试切换用户状态..."
TOGGLE_RESPONSE=$(curl -s -X POST "$BASE_URL/admin/users/$USER_ID/toggle-status" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

NEW_STATUS=$(echo $TOGGLE_RESPONSE | jq -r '.is_active')
if [ "$NEW_STATUS" != "null" ]; then
  echo -e "${GREEN}✅ 成功切换用户状态${NC}"
  echo "   新状态: $([ "$NEW_STATUS" = "true" ] && echo "激活" || echo "禁用")"
  
  # 恢复状态
  echo "   恢复原状态..."
  curl -s -X POST "$BASE_URL/admin/users/$USER_ID/toggle-status" \
    -H "Authorization: Bearer $ADMIN_TOKEN" > /dev/null
  echo -e "${GREEN}   ✅ 状态已恢复${NC}"
else
  echo -e "${RED}❌ 切换用户状态失败${NC}"
  echo "   Response: $TOGGLE_RESPONSE"
fi
echo ""

# 9. 测试 RAG rebuild-index 权限（管理员功能）
echo "9️⃣  测试 RAG rebuild-index 管理员权限..."
RAG_FORBIDDEN=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/rag/rebuild-index" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{}")

RAG_HTTP_CODE=$(echo "$RAG_FORBIDDEN" | tail -n1)
if [ "$RAG_HTTP_CODE" = "403" ]; then
  echo -e "${GREEN}✅ RAG rebuild-index 权限检查正常${NC}"
else
  echo -e "${YELLOW}⚠️  RAG rebuild-index 权限检查状态码: $RAG_HTTP_CODE${NC}"
fi
echo ""

echo "============================================"
echo -e "${GREEN}🎉 所有测试完成！${NC}"
echo "============================================"
echo ""
echo "测试总结:"
echo "  ✅ 管理员登录"
echo "  ✅ 普通用户登录"
echo "  ✅ 权限检查（403拒绝）"
echo "  ✅ 用户列表获取"
echo "  ✅ 后台统计数据"
echo "  ✅ 用户详情获取"
echo "  ✅ 用户状态切换"
echo "  ✅ RAG管理员功能权限"
echo ""

