#!/bin/bash

# 测试缓存预热 API 端点

BASE_URL="http://localhost:8000/api"
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiZW1haWwiOiJhZG1pbkBhZG1pbi5jb20iLCJleHAiOjE3NjM3MzMwODEsInR5cGUiOiJhY2Nlc3MifQ.TcirhX4obGU_5KiOcKhGNu9hrgbHR2TBvAf08LxAs1Y"

echo "=========================================="
echo "测试缓存预热 API"
echo "=========================================="
echo ""

# 1. 获取预热状态
echo "1. 测试获取预热状态 (GET /admin/cache-warming/status)"
curl -s -X GET "${BASE_URL}/admin/cache-warming/status" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" | jq '.'
echo ""
echo ""

# 2. 获取预热策略
echo "2. 测试获取预热策略 (GET /admin/cache-warming/strategies)"
curl -s -X GET "${BASE_URL}/admin/cache-warming/strategies" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" | jq '.'
echo ""
echo ""

# 3. 获取预热历史
echo "3. 测试获取预热历史 (GET /admin/cache-warming/history)"
curl -s -X GET "${BASE_URL}/admin/cache-warming/history?limit=5" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" | jq '.'
echo ""
echo ""

# 4. 触发预热
echo "4. 测试触发预热 (POST /admin/cache-warming/warm)"
curl -s -X POST "${BASE_URL}/admin/cache-warming/warm" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" | jq '.'
echo ""
echo ""

# 等待预热完成
echo "等待 3 秒后再次检查状态..."
sleep 3
echo ""

# 5. 再次获取状态
echo "5. 再次获取预热状态"
curl -s -X GET "${BASE_URL}/admin/cache-warming/status" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" | jq '.'
echo ""
echo ""

echo "=========================================="
echo "测试完成"
echo "=========================================="
