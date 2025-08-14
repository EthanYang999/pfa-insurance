-- 为聊天记录表添加访客模式支持
-- 在现有的 n8n_chat_histories 表中添加新字段

-- 添加访客ID字段
ALTER TABLE n8n_chat_histories 
ADD COLUMN IF NOT EXISTS guest_id VARCHAR(100);

-- 添加用户ID字段（如果还没有的话）
ALTER TABLE n8n_chat_histories 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- 添加会话类型字段
ALTER TABLE n8n_chat_histories 
ADD COLUMN IF NOT EXISTS session_type VARCHAR(10) DEFAULT 'user';

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_n8n_chat_histories_user_id ON n8n_chat_histories(user_id);
CREATE INDEX IF NOT EXISTS idx_n8n_chat_histories_guest_id ON n8n_chat_histories(guest_id);
CREATE INDEX IF NOT EXISTS idx_n8n_chat_histories_session_type ON n8n_chat_histories(session_type);
CREATE INDEX IF NOT EXISTS idx_n8n_chat_histories_session_id_type ON n8n_chat_histories(session_id, session_type);

-- 更新现有记录的session_type（如果user_id不为空，设置为'user'）
UPDATE n8n_chat_histories 
SET session_type = 'user' 
WHERE user_id IS NOT NULL AND session_type IS NULL;

-- 创建用户聊天统计视图
CREATE OR REPLACE VIEW user_chat_stats AS
SELECT 
  user_id,
  COUNT(DISTINCT session_id) as total_sessions,
  COUNT(*) as total_messages,
  MAX(created_at) as last_activity,
  MIN(created_at) as first_activity
FROM n8n_chat_histories 
WHERE session_type = 'user' AND user_id IS NOT NULL
GROUP BY user_id;

-- 创建访客聊天统计视图
CREATE OR REPLACE VIEW guest_chat_stats AS
SELECT 
  guest_id,
  COUNT(DISTINCT session_id) as total_sessions,
  COUNT(*) as total_messages,
  MAX(created_at) as last_activity,
  MIN(created_at) as first_activity
FROM n8n_chat_histories 
WHERE session_type = 'guest' AND guest_id IS NOT NULL
GROUP BY guest_id;

-- 创建每日聊天统计视图
CREATE OR REPLACE VIEW daily_chat_stats AS
SELECT 
  DATE(created_at) as date,
  session_type,
  COUNT(DISTINCT COALESCE(user_id::text, guest_id)) as unique_users,
  COUNT(DISTINCT session_id) as total_sessions,
  COUNT(*) as total_messages
FROM n8n_chat_histories 
GROUP BY DATE(created_at), session_type
ORDER BY date DESC, session_type;

-- 添加表注释
COMMENT ON COLUMN n8n_chat_histories.user_id IS '已登录用户的ID，关联auth.users表';
COMMENT ON COLUMN n8n_chat_histories.guest_id IS '访客用户的ID，用于标识未登录用户';
COMMENT ON COLUMN n8n_chat_histories.session_type IS '会话类型：user（已登录）、guest（访客）、unknown（未知）';

-- 创建清理旧访客数据的函数（可选）
CREATE OR REPLACE FUNCTION cleanup_old_guest_sessions(days_to_keep INTEGER DEFAULT 30)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- 删除超过指定天数的访客会话记录
  DELETE FROM n8n_chat_histories 
  WHERE session_type = 'guest' 
    AND created_at < NOW() - INTERVAL '1 day' * days_to_keep;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- 添加函数注释
COMMENT ON FUNCTION cleanup_old_guest_sessions(INTEGER) IS '清理超过指定天数的访客聊天记录，默认保留30天';

-- 创建检查数据完整性的函数
CREATE OR REPLACE FUNCTION check_chat_data_integrity()
RETURNS TABLE(
  issue_type TEXT,
  issue_count BIGINT,
  description TEXT
) AS $$
BEGIN
  -- 检查缺少用户/访客标识的记录
  RETURN QUERY
  SELECT 
    'missing_identity'::TEXT,
    COUNT(*),
    '缺少用户ID和访客ID的记录'::TEXT
  FROM n8n_chat_histories 
  WHERE user_id IS NULL AND guest_id IS NULL;
  
  -- 检查session_type不一致的记录
  RETURN QUERY
  SELECT 
    'inconsistent_session_type'::TEXT,
    COUNT(*),
    'session_type与实际用户类型不一致的记录'::TEXT
  FROM n8n_chat_histories 
  WHERE (session_type = 'user' AND user_id IS NULL) 
     OR (session_type = 'guest' AND guest_id IS NULL);
  
  -- 检查同时有用户ID和访客ID的记录
  RETURN QUERY
  SELECT 
    'duplicate_identity'::TEXT,
    COUNT(*),
    '同时具有用户ID和访客ID的记录'::TEXT
  FROM n8n_chat_histories 
  WHERE user_id IS NOT NULL AND guest_id IS NOT NULL;
  
END;
$$ LANGUAGE plpgsql;

-- 添加函数注释
COMMENT ON FUNCTION check_chat_data_integrity() IS '检查聊天记录数据的完整性和一致性';

-- 执行数据完整性检查
SELECT * FROM check_chat_data_integrity();