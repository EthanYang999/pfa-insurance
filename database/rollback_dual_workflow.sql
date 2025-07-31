-- 回滚双工作流架构的数据库更改
-- 在Supabase SQL Editor中执行此脚本来撤销 update_chat_messages_for_dual_workflow.sql 的更改

-- 1. 删除外键约束
ALTER TABLE chat_messages 
DROP CONSTRAINT IF EXISTS fk_parent_message;

-- 2. 删除索引
DROP INDEX IF EXISTS idx_chat_messages_source;
DROP INDEX IF EXISTS idx_chat_messages_is_regenerated;
DROP INDEX IF EXISTS idx_chat_messages_parent_message_id;

-- 3. 删除检查约束
ALTER TABLE chat_messages 
DROP CONSTRAINT IF EXISTS check_role;

ALTER TABLE chat_messages 
DROP CONSTRAINT IF EXISTS check_source;

-- 4. 删除新增的列
ALTER TABLE chat_messages 
DROP COLUMN IF EXISTS source;

ALTER TABLE chat_messages 
DROP COLUMN IF EXISTS is_regenerated;

ALTER TABLE chat_messages 
DROP COLUMN IF EXISTS parent_message_id;

ALTER TABLE chat_messages 
DROP COLUMN IF EXISTS role;

-- 5. 清理注释
COMMENT ON COLUMN chat_messages.message_type IS NULL;

-- 执行完成后，数据库架构将回到原始状态
-- 保留 id, session_id, user_id, message_type, content, created_at 字段