import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";
import { requirePermission, logAdminAction, getAdminUser } from "@/lib/admin-auth";

export async function POST(request: NextRequest) {
  try {
    await requirePermission('create_user');
    
    const { userId, role } = await request.json();
    
    // 验证必填字段
    if (!userId || !role) {
      return NextResponse.json(
        { error: "用户ID和角色是必填字段" },
        { status: 400 }
      );
    }
    
    // 验证角色
    if (!['admin', 'super_admin'].includes(role)) {
      return NextResponse.json(
        { error: "无效的管理员角色" },
        { status: 400 }
      );
    }
    
    const supabase = await createClient();
    const adminClient = createAdminClient();
    const currentAdmin = await getAdminUser();
    
    // 只有超级管理员可以创建其他超级管理员
    if (role === 'super_admin' && currentAdmin?.role !== 'super_admin') {
      return NextResponse.json(
        { error: "只有超级管理员可以提升用户为超级管理员" },
        { status: 403 }
      );
    }
    
    // 获取目标用户信息
    const { data: userData, error: getUserError } = await adminClient.auth.admin.getUserById(userId);
    
    if (getUserError || !userData.user) {
      return NextResponse.json(
        { error: "用户不存在" },
        { status: 404 }
      );
    }
    
    const targetUser = userData.user;
    
    // 检查用户是否已经是管理员
    const { data: existingAdmin } = await supabase
      .from('admin_users')
      .select('role')
      .eq('user_id', userId)
      .single();
    
    if (existingAdmin) {
      // 更新现有管理员角色
      const { error: updateError } = await supabase
        .from('admin_users')
        .update({
          role,
          is_active: true,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);
      
      if (updateError) {
        console.error('更新管理员角色失败:', updateError);
        return NextResponse.json(
          { error: "更新管理员角色失败" },
          { status: 500 }
        );
      }
    } else {
      // 创建新的管理员记录
      const permissions = {
        user_management: role === 'super_admin' || role === 'admin',
        system_config: role === 'super_admin',
        data_export: role === 'super_admin' || role === 'admin',
        log_access: role === 'super_admin' || role === 'admin',
        service_monitoring: role === 'super_admin' || role === 'admin',
        user_data_access: role === 'super_admin' || role === 'admin'
      };
      
      // 创建管理员记录 - 不包含 created_by 字段以避免外键约束问题
      const insertData: {
        user_id: string;
        role: string;
        permissions: Record<string, boolean>;
        is_active: boolean;
        created_by?: string;
      } = {
        user_id: userId,
        role,
        permissions,
        is_active: true
      };
      
      // 只有当 created_by 存在且是有效的管理员 ID 时才添加
      if (currentAdmin?.user_id) {
        // 验证 created_by 是否是有效的管理员
        const { data: creatorExists } = await supabase
          .from('admin_users')
          .select('id')
          .eq('user_id', currentAdmin.user_id)
          .single();
        
        if (creatorExists) {
          insertData.created_by = creatorExists.id;
        }
      }
      
      const { error: insertError } = await supabase
        .from('admin_users')
        .insert(insertData);
      
      if (insertError) {
        console.error('创建管理员记录失败:', insertError);
        return NextResponse.json(
          { error: "创建管理员记录失败" },
          { status: 500 }
        );
      }
    }
    
    // 记录管理员操作日志
    await logAdminAction('update_user', 'user', userId, {
      email: targetUser.email,
      action: 'promote_to_admin',
      new_role: role,
      previous_role: existingAdmin?.role || 'user'
    });
    
    const roleNames = {
      admin: '管理员',
      super_admin: '超级管理员'
    };
    
    return NextResponse.json({
      success: true,
      message: `用户已成功提升为${roleNames[role as keyof typeof roleNames]}`,
      user: {
        id: targetUser.id,
        email: targetUser.email,
        new_role: role
      }
    });
    
  } catch (error) {
    console.error('提升用户API失败:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "Failed to promote user"
      },
      { 
        status: error instanceof Error && error.message.includes('permission') ? 403 : 500 
      }
    );
  }
}