#!/bin/bash

# API 测试脚本

BASE_URL="http://localhost:3000"

echo "=== 测试用户注册 ==="
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "phone": "13800138000",
    "password": "password123"
  }')
echo "注册响应: $REGISTER_RESPONSE"
echo ""

echo "=== 测试用户登录 ==="
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "identity": "testuser",
    "password": "password123"
  }')
echo "登录响应: $LOGIN_RESPONSE"
echo ""

# 提取 token
TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | grep -o '[^"]*$')
echo "提取的 Token: $TOKEN"
echo ""

if [ -z "$TOKEN" ]; then
  echo "登录失败，无法继续测试"
  exit 1
fi

echo "=== 测试获取标记类型 ==="
curl -s -X GET "$BASE_URL/marker-types" \
  -H "Authorization: Bearer $TOKEN" | jq .
echo ""

echo "=== 测试获取标记点列表 ==="
curl -s -X GET "$BASE_URL/markers" \
  -H "Authorization: Bearer $TOKEN" | jq .
echo ""

echo "=== 测试获取好友列表 ==="
curl -s -X GET "$BASE_URL/friends" \
  -H "Authorization: Bearer $TOKEN" | jq .
echo ""

echo "测试完成！"

