#!/bin/bash

# 完整测试所有缓存管理 API 端点

BASE_URL="http://localhost:8000/api"
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiZW1haWwiOiJhZG1pbkBhZG1pbi5jb20iLCJleHAiOjE3NjM3MzMwODEsInR5cGUiOiJhY2Nlc3MifQ.TcirhX4obGU_5KiOcKhGNu9hrgbHR2TBvAf08LxAs1Y"

echo "=========================================="
echo "完整测试缓存管理 API"
echo "=========================================="
echo ""

# ==========================================
# 缓存统计 API
# ==========================================
echo "【缓存统计 API】"
echo ""

echo "1. 获取缓存统计 (GET /admin/cache/stats)"
curl -s -X GET "${BASE_URL}/admin/cache/stats?time_window=3600" \
  -H "Authorization: Bearer ${TOKEN}" | jq '.'
echo ""

echo "2. 获取热门键 (GET /admin/cache/stats/top-keys)"
curl -s -X GET "${BASE_URL}/admin/cache/stats/top-keys?limit=5" \
  -H "Authorization: Bearer ${TOKEN}" | jq '.'
echo ""

echo "3. 获取缓存信息 (GET /admin/cache/info)"
curl -s -X GET "${BASE_URL}/admin/cache/info" \
  -H "Authorization: Bearer ${TOKEN}" | jq '.'
echo ""

# ==========================================
# 缓存配置 API
# ==========================================
echo "【缓存配置 API】"
echo ""

echo "4. 获取缓存配置 (GET /admin/cache/config)"
curl -s -X GET "${BASE_URL}/admin/cache/config" \
  -H "Authorization: Bearer ${TOKEN}" | jq '.'
echo ""

# ==========================================
# 缓存预热 API
# ==========================================
echo "【缓存预热 API】"
echo ""

echo "5. 获取预热状态 (GET /admin/cache-warming/status)"
curl -s -X GET "${BASE_URL}/admin/cache-warming/status" \
  -H "Authorization: Bearer ${TOKEN}" | jq '.'
echo ""

echo "6. 获取预热策略 (GET /admin/cache-warming/strategies)"
curl -s -X GET "${BASE_URL}/admin/cache-warming/strategies" \
  -H "Authorization: Bearer ${TOKEN}" | jq '.'
echo ""

echo "7. 获取预热历史 (GET /admin/cache-warming/history)"
curl -s -X GET "${BASE_URL}/admin/cache-warming/history?limit=3" \
  -H "Authorization: Bearer ${TOKEN}" | jq '.'
echo ""

echo "=========================================="
echo "所有 API 测试完成"
echo "=========================================="
