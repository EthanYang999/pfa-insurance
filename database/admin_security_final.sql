-- PFA后台管理系统最终安全策略
-- 在管理员功能测试正常后执行此脚本来加强安全性

-- 注意：只有在确认管理员功能完全正常后才执行此脚本

-- 1. 为其他管理表启用安全的RLS策略
ALTER TABLE system_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_health ENABLE ROW LEVEL SECURITY;

-- 2. 创建安全的策略（不依赖递归查询）
-- system_logs: 只允许管理员查看
CREATE POLICY "Admins can access system_logs" ON system_logs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE user_id = auth.uid() 
            AND is_active = true
        )
    );

-- system_config: 只允许管理员访问
CREATE POLICY "Admins can access system_config" ON system_config
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE user_id = auth.uid() 
            AND is_active = true
        )
    );

-- service_health: 只允许管理员查看
CREATE POLICY "Admins can access service_health" ON service_health
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE user_id = auth.uid() 
            AND is_active = true
        )
    );

-- 3. 创建管理员操作日志函数（安全版本）
CREATE OR REPLACE FUNCTION log_admin_action_safe(
    p_action VARCHAR(100),
    p_target_type VARCHAR(50) DEFAULT NULL,
    p_target_id VARCHAR(100) DEFAULT NULL,
    p_details JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
    log_id UUID;
    admin_record RECORD;
BEGIN
    -- 获取管理员信息（避免递归）
    SELECT id INTO admin_record 
    FROM admin_users 
    WHERE user_id = auth.uid() 
    AND is_active = true
    LIMIT 1;
    
    -- 如果不是管理员，返回NULL
    IF admin_record.id IS NULL THEN
        RETURN NULL;
    END IF;
    
    -- 插入日志记录
    INSERT INTO system_logs (admin_id, action, target_type, target_id, details)
    VALUES (admin_record.id, p_action, p_target_type, p_target_id, p_details)
    RETURNING id INTO log_id;
    
    RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. 创建管理视图（确保权限正确）
CREATE OR REPLACE VIEW admin_dashboard_stats AS
SELECT 
    (SELECT COUNT(*) FROM auth.users) as total_users,
    (SELECT COUNT(*) FROM auth.users WHERE created_at >= CURRENT_DATE) as new_users_today,
    (SELECT COUNT(*) FROM chat_sessions WHERE created_at >= CURRENT_DATE) as new_sessions_today,
    (SELECT COUNT(*) FROM chat_messages WHERE created_at >= CURRENT_DATE) as new_messages_today,
    (SELECT COUNT(*) FROM chat_sessions WHERE is_archived = false) as active_sessions,
    (SELECT AVG(response_time) FROM service_health WHERE service_name = 'n8n' AND checked_at >= NOW() - INTERVAL '1 hour') as avg_n8n_response_time;

-- 5. 授予必要权限
GRANT SELECT ON admin_dashboard_stats TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- 6. 初始化系统配置（如果还没有）
INSERT INTO system_config (key, value, description) VALUES
('maintenance_mode', 'false', '系统维护模式开关'),
('max_sessions_per_user', '100', '每个用户最大会话数限制'),
('auto_archive_days', '30', '自动归档会话天数'),
('n8n_webhook_url', '""', 'n8n工作流webhook地址'),
('admin_notification_email', '""', '管理员通知邮箱')
ON CONFLICT (key) DO NOTHING;

-- 7. 验证配置
SELECT 'Admin system setup completed' as status;
SELECT COUNT(*) as admin_count FROM admin_users WHERE is_active = true;
SELECT COUNT(*) as config_count FROM system_config;