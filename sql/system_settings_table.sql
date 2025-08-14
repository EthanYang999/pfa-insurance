-- 创建系统设置表
CREATE TABLE IF NOT EXISTS system_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    key VARCHAR(255) UNIQUE NOT NULL,
    value JSONB,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_system_settings_key ON system_settings(key);
CREATE INDEX IF NOT EXISTS idx_system_settings_updated_at ON system_settings(updated_at);

-- 插入默认系统设置
INSERT INTO system_settings (key, value, description)
VALUES 
    ('guest_access_enabled', 'true', '是否允许访客访问聊天功能'),
    ('maintenance_mode', 'false', '系统维护模式开关'),
    ('max_guest_sessions_per_day', '100', '每日最大访客会话数量'),
    ('guest_session_timeout', '3600', '访客会话超时时间（秒）'),
    ('enable_chat_history', 'true', '是否启用聊天历史记录'),
    ('max_message_length', '4000', '单条消息最大长度'),
    ('rate_limit_per_minute', '30', '每分钟最大请求数')
ON CONFLICT (key) DO NOTHING;

-- 更新时间戳触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_system_settings_updated_at 
    BEFORE UPDATE ON system_settings 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 添加注释
COMMENT ON TABLE system_settings IS '系统设置表，存储系统级配置项';
COMMENT ON COLUMN system_settings.key IS '设置项的唯一键';
COMMENT ON COLUMN system_settings.value IS '设置值，支持JSON格式';
COMMENT ON COLUMN system_settings.description IS '设置项描述';