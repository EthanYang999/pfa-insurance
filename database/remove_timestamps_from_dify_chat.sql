-- 删除dify_chat_histories表中的时间戳字段，保持与n8n_chat_histories一致

-- 1. 删除相关的触发器和函数
DROP TRIGGER IF EXISTS trigger_update_dify_chat_histories_updated_at ON dify_chat_histories;
DROP FUNCTION IF EXISTS update_dify_chat_histories_updated_at();

-- 2. 删除时间戳相关的索引
DROP INDEX IF EXISTS idx_dify_chat_histories_created_at;

-- 3. 删除时间戳字段
ALTER TABLE dify_chat_histories DROP COLUMN IF EXISTS created_at;
ALTER TABLE dify_chat_histories DROP COLUMN IF EXISTS updated_at;

-- 验证最终表结构（可选，用于确认）
-- \d dify_chat_histories;