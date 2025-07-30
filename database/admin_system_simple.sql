-- PFA后台管理系统数据库结构（简化版，无RLS递归）
-- 在Supabase SQL Editor中执行此脚本

-- 1. 完全重置 admin_users 表的RLS
ALTER TABLE admin_users DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own admin record" ON admin_users;
DROP POLICY IF EXISTS "Admins can view all admin records" ON admin_users;
DROP POLICY IF EXISTS "Only admins can access admin_users" ON admin_users;

-- 2. 重新启用RLS并创建简单策略
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- 3. 创建最简单的策略：允许所有已认证用户读取
CREATE POLICY "Authenticated users can read admin_users" ON admin_users
    FOR SELECT USING (auth.role() = 'authenticated');

-- 4. 允许管理员插入和更新
CREATE POLICY "Authenticated users can insert admin_users" ON admin_users
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update admin_users" ON admin_users
    FOR UPDATE USING (auth.role() = 'authenticated');

-- 5. 重置其他表的策略
ALTER TABLE system_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE system_config DISABLE ROW LEVEL SECURITY;
ALTER TABLE service_health DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity_stats DISABLE ROW LEVEL SECURITY;
ALTER TABLE api_call_stats DISABLE ROW LEVEL SECURITY;

-- 暂时禁用其他表的RLS，先让admin_users工作
-- ALTER TABLE system_logs ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE system_config ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE service_health ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE user_activity_stats ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE api_call_stats ENABLE ROW LEVEL SECURITY;

-- 6. 确保管理员记录存在且正确
-- 删除可能的重复记录
DELETE FROM admin_users WHERE user_id = '677cd193-8947-4c38-942d-aa9a3e8f8a25';

-- 重新插入管理员记录
INSERT INTO admin_users (user_id, role, permissions, is_active)
VALUES (
  '677cd193-8947-4c38-942d-aa9a3e8f8a25', 
  'super_admin',
  '{"user_management": true, "system_config": true, "data_export": true, "log_access": true, "service_monitoring": true, "user_data_access": true}',
  true
);

-- 7. 验证记录插入成功
SELECT 
    id,
    user_id,
    role,
    permissions,
    is_active,
    created_at
FROM admin_users 
WHERE user_id = '677cd193-8947-4c38-942d-aa9a3e8f8a25';