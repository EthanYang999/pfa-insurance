#!/bin/bash

# 测试n8n webhook的终端请求脚本
# 使用正确的text和sessionId参数格式

echo "测试n8n webhook..."
echo "URL: https://n8n.aifunbox.com/webhook/insurance"
echo ""

# 生成唯一的sessionId
SESSION_ID="user_$(date +%s)_$(openssl rand -hex 4)"
echo "SessionId: $SESSION_ID"
echo ""

# 发送测试请求
curl -X POST \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d "{
    \"text\": \"你好，我想了解一下重疾险的产品特点\",
    \"sessionId\": \"$SESSION_ID\"
  }" \
  https://n8n.aifunbox.com/webhook/insurance

echo ""
echo "请求完成"