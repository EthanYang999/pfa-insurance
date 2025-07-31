# ⚠️ 数据库更新需要

由于实现了双工作流架构，需要更新数据库表结构。

## 🔧 执行步骤

1. **打开 Supabase Dashboard**
   - 访问 https://app.supabase.com/project/nmibsnvsbiimvlopwdky
   - 进入 SQL Editor

2. **执行数据库更新脚本**
   - 打开文件：`database/update_chat_messages_for_dual_workflow.sql`
   - 复制全部内容到 Supabase SQL Editor
   - 点击 "Run" 执行

## 📋 更新内容

这个脚本会：
- ✅ 添加 `source` 字段（标识消息来源：user/dify/n8n）
- ✅ 添加 `is_regenerated` 字段（标识是否为重新生成的消息）
- ✅ 添加 `parent_message_id` 字段（关联被替换的消息）
- ✅ 添加 `role` 字段（新架构使用）
- ✅ 迁移现有数据
- ✅ 创建必要的索引和约束

## 🚨 执行后效果

- 修复当前的 500 错误
- 支持双工作流架构
- 保持现有数据完整性

执行完成后，聊天功能将正常工作！