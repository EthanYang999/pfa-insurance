-- Dify聊天记录表
-- 基于现有n8n_chat_histories结构，为Dify工作流设计

CREATE TABLE IF NOT EXISTS dify_chat_histories (
  id SERIAL PRIMARY KEY,
  session_id VARCHAR(255) NOT NULL,
  message JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 为session_id创建索引，提高查询性能
CREATE INDEX IF NOT EXISTS idx_dify_chat_histories_session_id 
ON dify_chat_histories(session_id);

-- 为created_at创建索引，支持时间范围查询
CREATE INDEX IF NOT EXISTS idx_dify_chat_histories_created_at 
ON dify_chat_histories(created_at);

-- 为message整个JSONB字段创建GIN索引，支持JSON查询
CREATE INDEX IF NOT EXISTS idx_dify_chat_histories_message_gin 
ON dify_chat_histories USING GIN (message);

-- RLS策略：只允许已认证用户访问自己的聊天记录
ALTER TABLE dify_chat_histories ENABLE ROW LEVEL SECURITY;

-- 管理员可以查看所有记录
CREATE POLICY "管理员可以查看所有Dify聊天记录" ON dify_chat_histories
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid()
    )
  );

-- 普通用户只能查看自己session的记录（如果需要用户关联）
-- 注：这里假设session_id与用户相关，具体实现需要根据业务逻辑调整
CREATE POLICY "用户可以查看自己的Dify聊天记录" ON dify_chat_histories
  FOR SELECT TO authenticated
  USING (true); -- 暂时允许所有认证用户查看，后续可根据业务需求调整

-- 允许系统服务插入聊天记录
CREATE POLICY "允许插入Dify聊天记录" ON dify_chat_histories
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- 触发器：自动更新updated_at字段
CREATE OR REPLACE FUNCTION update_dify_chat_histories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_dify_chat_histories_updated_at
  BEFORE UPDATE ON dify_chat_histories
  FOR EACH ROW
  EXECUTE FUNCTION update_dify_chat_histories_updated_at();

-- 添加表注释
COMMENT ON TABLE dify_chat_histories IS 'Dify工作流聊天记录存储表';
COMMENT ON COLUMN dify_chat_histories.id IS '主键，自增ID';
COMMENT ON COLUMN dify_chat_histories.session_id IS '会话ID，用于关联同一对话的消息';
COMMENT ON COLUMN dify_chat_histories.message IS 'JSON格式消息内容，包含type、content等字段';
COMMENT ON COLUMN dify_chat_histories.created_at IS '创建时间';
COMMENT ON COLUMN dify_chat_histories.updated_at IS '更新时间';