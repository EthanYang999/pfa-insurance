-- 临时禁用所有RLS策略来测试基本功能
-- 注意：这会暂时移除安全限制，仅用于调试

-- 禁用所有管理表的RLS
ALTER TABLE admin_users DISABLE ROW LEVEL SECURITY;
ALTER TABLE system_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE system_config DISABLE ROW LEVEL SECURITY;
ALTER TABLE service_health DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity_stats DISABLE ROW LEVEL SECURITY;
ALTER TABLE api_call_stats DISABLE ROW LEVEL SECURITY;

-- 验证管理员记录
SELECT 
    'admin_users check' as table_name,
    id,
    user_id,
    role,
    is_active
FROM admin_users 
WHERE user_id = '677cd193-8947-4c38-942d-aa9a3e8f8a25';