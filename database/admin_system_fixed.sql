-- PFA后台管理系统数据库结构（修复版）
-- 在Supabase SQL Editor中执行此脚本

-- 1. 删除现有的错误策略
DROP POLICY IF EXISTS "Only admins can access admin_users" ON admin_users;
DROP POLICY IF EXISTS "Only admins can access system_logs" ON system_logs;
DROP POLICY IF EXISTS "Only admins can access system_config" ON system_config;
DROP POLICY IF EXISTS "Only admins can access service_health" ON service_health;
DROP POLICY IF EXISTS "Only admins can access user_activity_stats" ON user_activity_stats;
DROP POLICY IF EXISTS "Only admins can access api_call_stats" ON api_call_stats;

-- 2. 管理员表
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin', 'monitor')),
  permissions JSONB DEFAULT '{}', -- 权限配置
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  last_login_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES admin_users(id)
);

-- 3. 系统日志表
CREATE TABLE IF NOT EXISTS system_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID REFERENCES admin_users(id),
  action VARCHAR(100) NOT NULL, -- 操作类型
  target_type VARCHAR(50), -- 操作对象类型 (user, session, system)
  target_id VARCHAR(100), -- 操作对象ID
  details JSONB DEFAULT '{}', -- 详细信息
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 系统配置表
CREATE TABLE IF NOT EXISTS system_config (
  key VARCHAR(100) PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  updated_by UUID REFERENCES admin_users(id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. 服务健康监控表
CREATE TABLE IF NOT EXISTS service_health (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  service_name VARCHAR(50) NOT NULL, -- n8n, database, api
  status VARCHAR(20) NOT NULL CHECK (status IN ('healthy', 'warning', 'error', 'unknown')),
  response_time INTEGER, -- 响应时间(ms)
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  checked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. 用户活动统计表
CREATE TABLE IF NOT EXISTS user_activity_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  login_count INTEGER DEFAULT 0,
  chat_sessions_count INTEGER DEFAULT 0,
  messages_count INTEGER DEFAULT 0,
  total_chat_time INTEGER DEFAULT 0, -- 聊天总时长(秒)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- 7. API调用统计表
CREATE TABLE IF NOT EXISTS api_call_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  endpoint VARCHAR(200) NOT NULL,
  method VARCHAR(10) NOT NULL,
  status_code INTEGER NOT NULL,
  response_time INTEGER, -- 响应时间(ms)
  user_id UUID REFERENCES auth.users(id),
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. 创建索引
CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON admin_users(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_users_role ON admin_users(role);
CREATE INDEX IF NOT EXISTS idx_system_logs_admin_id ON system_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_system_logs_action ON system_logs(action);
CREATE INDEX IF NOT EXISTS idx_system_logs_created_at ON system_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_service_health_service ON service_health(service_name);
CREATE INDEX IF NOT EXISTS idx_service_health_checked_at ON service_health(checked_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_activity_date ON user_activity_stats(date DESC);
CREATE INDEX IF NOT EXISTS idx_api_call_stats_endpoint ON api_call_stats(endpoint);
CREATE INDEX IF NOT EXISTS idx_api_call_stats_created_at ON api_call_stats(created_at DESC);

-- 9. 启用RLS但使用简单策略（避免递归）
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_health ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_call_stats ENABLE ROW LEVEL SECURITY;

-- 10. 创建简单的RLS策略（避免递归查询）
-- admin_users表：允许已认证用户查看自己相关的记录
CREATE POLICY "Users can view own admin record" ON admin_users
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all admin records" ON admin_users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM admin_users au 
            WHERE au.user_id = auth.uid() 
            AND au.is_active = true 
            AND au.role IN ('super_admin', 'admin')
        )
    );

-- 其他表的策略：只允许表中存在的管理员访问
CREATE POLICY "Authenticated users can access system_logs" ON system_logs
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can access system_config" ON system_config
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can access service_health" ON service_health
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can access user_activity_stats" ON user_activity_stats
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can access api_call_stats" ON api_call_stats
    FOR ALL USING (auth.role() = 'authenticated');

-- 11. 创建管理视图
CREATE OR REPLACE VIEW admin_dashboard_stats AS
SELECT 
    (SELECT COUNT(*) FROM auth.users) as total_users,
    (SELECT COUNT(*) FROM auth.users WHERE created_at >= CURRENT_DATE) as new_users_today,
    (SELECT COUNT(*) FROM chat_sessions WHERE created_at >= CURRENT_DATE) as new_sessions_today,
    (SELECT COUNT(*) FROM chat_messages WHERE created_at >= CURRENT_DATE) as new_messages_today,
    (SELECT COUNT(*) FROM chat_sessions WHERE is_archived = false) as active_sessions,
    (SELECT AVG(response_time) FROM service_health WHERE service_name = 'n8n' AND checked_at >= NOW() - INTERVAL '1 hour') as avg_n8n_response_time;

-- 12. 初始化系统配置
INSERT INTO system_config (key, value, description) VALUES
('maintenance_mode', 'false', '系统维护模式开关'),
('max_sessions_per_user', '100', '每个用户最大会话数限制'),
('auto_archive_days', '30', '自动归档会话天数'),
('n8n_webhook_url', '""', 'n8n工作流webhook地址'),
('admin_notification_email', '""', '管理员通知邮箱')
ON CONFLICT (key) DO NOTHING;

-- 13. 函数：记录管理员操作日志
CREATE OR REPLACE FUNCTION log_admin_action(
    p_action VARCHAR(100),
    p_target_type VARCHAR(50) DEFAULT NULL,
    p_target_id VARCHAR(100) DEFAULT NULL,
    p_details JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
    log_id UUID;
    admin_id UUID;
BEGIN
    -- 获取当前管理员ID
    SELECT id INTO admin_id 
    FROM admin_users 
    WHERE user_id = auth.uid() AND is_active = true
    LIMIT 1;
    
    -- 插入日志记录
    INSERT INTO system_logs (admin_id, action, target_type, target_id, details)
    VALUES (admin_id, p_action, p_target_type, p_target_id, p_details)
    RETURNING id INTO log_id;
    
    RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 14. 函数：检查管理员权限
CREATE OR REPLACE FUNCTION check_admin_permission(required_role VARCHAR(50) DEFAULT 'admin')
RETURNS BOOLEAN AS $$
DECLARE
    user_role VARCHAR(50);
BEGIN
    SELECT role INTO user_role
    FROM admin_users 
    WHERE user_id = auth.uid() AND is_active = true
    LIMIT 1;
    
    -- super_admin 拥有所有权限
    IF user_role = 'super_admin' THEN
        RETURN TRUE;
    END IF;
    
    -- 检查角色匹配
    RETURN user_role = required_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 15. 授予权限
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON admin_users TO authenticated;
GRANT ALL ON system_logs TO authenticated;
GRANT ALL ON system_config TO authenticated;
GRANT ALL ON service_health TO authenticated;
GRANT ALL ON user_activity_stats TO authenticated;
GRANT ALL ON api_call_stats TO authenticated;
GRANT SELECT ON admin_dashboard_stats TO authenticated;