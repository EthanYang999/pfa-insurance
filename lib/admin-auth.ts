// 管理员认证和权限管理工具

import { createClient } from "@/lib/supabase/server";
import { AdminUser, AdminPermissions, AdminAction } from "@/types/admin";

// 检查用户是否为管理员
export async function isAdmin(userId?: string): Promise<boolean> {
  try {
    const supabase = await createClient();
    
    let targetUserId = userId;
    if (!targetUserId) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;
      targetUserId = user.id;
    }

    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('id, is_active')
      .eq('user_id', targetUserId)
      .eq('is_active', true)
      .single();

    return !!adminUser;
  } catch (error) {
    console.error('检查管理员权限失败:', error);
    return false;
  }
}

// 获取管理员信息
export async function getAdminUser(): Promise<AdminUser | null> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return null;

    const { data: adminUser, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    if (error || !adminUser) return null;

    return adminUser as AdminUser;
  } catch (error) {
    console.error('获取管理员信息失败:', error);
    return null;
  }
}

// 检查管理员角色
export async function hasRole(requiredRole: 'super_admin' | 'admin' | 'monitor'): Promise<boolean> {
  try {
    const adminUser = await getAdminUser();
    if (!adminUser) return false;

    // super_admin 拥有所有权限
    if (adminUser.role === 'super_admin') return true;
    
    // 角色匹配检查
    return adminUser.role === requiredRole;
  } catch (error) {
    console.error('检查管理员角色失败:', error);
    return false;
  }
}

// 检查特定权限
export async function hasPermission(action: AdminAction): Promise<boolean> {
  try {
    const adminUser = await getAdminUser();
    if (!adminUser) return false;

    // super_admin 拥有所有权限
    if (adminUser.role === 'super_admin') return true;

    // 基于角色的权限映射
    const rolePermissions: Record<string, AdminAction[]> = {
      admin: [
        'create_user', 'update_user', 'delete_user', 'reset_password',
        'view_user_data', 'export_data', 'update_config', 'view_logs',
        'system_maintenance'
      ],
      monitor: [
        'view_user_data', 'view_logs'
      ]
    };

    const allowedActions = rolePermissions[adminUser.role] || [];
    return allowedActions.includes(action);
  } catch (error) {
    console.error('检查管理员权限失败:', error);
    return false;
  }
}

// 记录管理员操作日志
export async function logAdminAction(
  action: AdminAction,
  targetType?: string,
  targetId?: string,
  details?: Record<string, unknown>
): Promise<void> {
  try {
    const supabase = await createClient();
    
    await supabase.rpc('log_admin_action', {
      p_action: action,
      p_target_type: targetType,
      p_target_id: targetId,
      p_details: details || {}
    });
  } catch (error) {
    console.error('记录管理员操作日志失败:', error);
  }
}

// 管理员权限中间件
export async function requireAdmin() {
  const isAdminUser = await isAdmin();
  if (!isAdminUser) {
    throw new Error('Admin permission required');
  }
}

// 特定权限中间件
export async function requirePermission(action: AdminAction) {
  const hasRequiredPermission = await hasPermission(action);
  if (!hasRequiredPermission) {
    throw new Error(`Permission required: ${action}`);
  }
}

// 获取管理员默认权限配置
export function getDefaultPermissions(role: 'super_admin' | 'admin' | 'monitor'): AdminPermissions {
  const permissions: Record<string, AdminPermissions> = {
    super_admin: {
      user_management: true,
      system_config: true,
      data_export: true,
      log_access: true,
      service_monitoring: true,
      user_data_access: true
    },
    admin: {
      user_management: true,
      system_config: true,
      data_export: true,
      log_access: true,
      service_monitoring: true,
      user_data_access: true
    },
    monitor: {
      user_management: false,
      system_config: false,
      data_export: false,
      log_access: true,
      service_monitoring: true,
      user_data_access: true
    }
  };

  return permissions[role];
}

// 更新管理员最后登录时间
export async function updateLastLogin(): Promise<void> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return;

    await supabase
      .from('admin_users')
      .update({ last_login_at: new Date().toISOString() })
      .eq('user_id', user.id);
  } catch (error) {
    console.error('更新最后登录时间失败:', error);
  }
}

// 创建新管理员账户
export async function createAdminUser(
  userEmail: string,
  role: 'super_admin' | 'admin' | 'monitor' = 'admin',
  permissions?: AdminPermissions
): Promise<{ success: boolean; error?: string }> {
  try {
    await requirePermission('create_user');
    
    const supabase = await createClient();
    
    // 检查用户是否存在
    const { data: existingUser } = await supabase
      .from('auth.users')
      .select('id')
      .eq('email', userEmail)
      .single();

    if (!existingUser) {
      return { success: false, error: '用户不存在，请先注册普通账户' };
    }

    // 检查是否已经是管理员
    const { data: existingAdmin } = await supabase
      .from('admin_users')
      .select('id')
      .eq('user_id', existingUser.id)
      .single();

    if (existingAdmin) {
      return { success: false, error: '该用户已经是管理员' };
    }

    // 创建管理员记录
    const currentAdmin = await getAdminUser();
    const { error } = await supabase
      .from('admin_users')
      .insert({
        user_id: existingUser.id,
        role,
        permissions: permissions || getDefaultPermissions(role),
        created_by: currentAdmin?.id
      });

    if (error) throw error;

    await logAdminAction('create_user', 'admin', existingUser.id, { role, email: userEmail });
    
    return { success: true };
  } catch (error) {
    console.error('创建管理员用户失败:', error);
    return { success: false, error: error instanceof Error ? error.message : '创建失败' };
  }
}