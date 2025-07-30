-- PFA聊天记录数据库安全策略（修复版）
-- 在Supabase SQL Editor中执行此脚本

-- 1. 启用RLS（Row Level Security）
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- 2. 删除现有策略（如果存in）
DROP POLICY IF EXISTS "Users can view own sessions" ON chat_sessions;
DROP POLICY IF EXISTS "Users can create own sessions" ON chat_sessions;
DROP POLICY IF EXISTS "Users can update own sessions" ON chat_sessions;
DROP POLICY IF EXISTS "Users can archive own sessions" ON chat_sessions;

DROP POLICY IF EXISTS "Users can view own messages" ON chat_messages;
DROP POLICY IF EXISTS "Users can create own messages" ON chat_messages;
DROP POLICY IF EXISTS "Users can update own messages" ON chat_messages;
DROP POLICY IF EXISTS "Users can delete own messages" ON chat_messages;

-- 3. chat_sessions表的RLS策略
-- 用户只能查看自己的会话
CREATE POLICY "Users can view own sessions" ON chat_sessions
    FOR SELECT USING (auth.uid() = user_id);

-- 用户只能创建自己的会话
CREATE POLICY "Users can create own sessions" ON chat_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 用户只能更新自己的会话
CREATE POLICY "Users can update own sessions" ON chat_sessions
    FOR UPDATE USING (auth.uid() = user_id);

-- 用户只能删除（归档）自己的会话
CREATE POLICY "Users can archive own sessions" ON chat_sessions
    FOR UPDATE USING (auth.uid() = user_id);

-- 4. chat_messages表的RLS策略
-- 用户只能查看自己的消息
CREATE POLICY "Users can view own messages" ON chat_messages
    FOR SELECT USING (auth.uid() = user_id);

-- 用户只能创建自己的消息
CREATE POLICY "Users can create own messages" ON chat_messages
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 用户只能更新自己的消息
CREATE POLICY "Users can update own messages" ON chat_messages
    FOR UPDATE USING (auth.uid() = user_id);

-- 用户只能删除自己的消息
CREATE POLICY "Users can delete own messages" ON chat_messages
    FOR DELETE USING (auth.uid() = user_id);

-- 5. 创建视图以便查询统计信息
CREATE OR REPLACE VIEW chat_sessions_with_stats AS
SELECT 
    s.*,
    COALESCE(m.latest_message_time, s.created_at) as last_message_at,
    SUBSTRING(m.latest_message_content, 1, 100) as last_message_preview
FROM chat_sessions s
LEFT JOIN LATERAL (
    SELECT 
        created_at as latest_message_time,
        content as latest_message_content
    FROM chat_messages 
    WHERE session_id = s.id 
    ORDER BY created_at DESC 
    LIMIT 1
) m ON true
WHERE s.is_archived = false;

-- 6. 创建触发器函数自动更新统计信息
CREATE OR REPLACE FUNCTION update_chat_session_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- 更新会话的updated_at和message_count
    UPDATE chat_sessions 
    SET 
        updated_at = NOW(),
        message_count = (
            SELECT COUNT(*) 
            FROM chat_messages 
            WHERE session_id = NEW.session_id
        )
    WHERE id = NEW.session_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. 创建触发器
DROP TRIGGER IF EXISTS trigger_update_session_stats ON chat_messages;
CREATE TRIGGER trigger_update_session_stats
    AFTER INSERT ON chat_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_chat_session_stats();

-- 8. 授予必要的权限
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON chat_sessions TO authenticated;
GRANT ALL ON chat_messages TO authenticated;
GRANT SELECT ON chat_sessions_with_stats TO authenticated;