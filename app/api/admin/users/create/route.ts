import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";
import { requirePermission, logAdminAction } from "@/lib/admin-auth";

export async function POST(request: NextRequest) {
  try {
    await requirePermission('create_user');
    
    const { email, password, role, sendEmail = true } = await request.json();
    
    // 验证必填字段
    if (!email || !password) {
      return NextResponse.json(
        { error: "邮箱和密码是必填字段" },
        { status: 400 }
      );
    }
    
    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "邮箱格式不正确" },
        { status: 400 }
      );
    }
    
    // 验证密码强度
    if (password.length < 6) {
      return NextResponse.json(
        { error: "密码长度不能少于6位" },
        { status: 400 }
      );
    }
    
    // 验证角色
    const validRoles = ['user', 'admin', 'super_admin'];
    const userRole = role || 'user';
    if (!validRoles.includes(userRole)) {
      return NextResponse.json(
        { error: "无效的用户角色" },
        { status: 400 }
      );
    }
    
    const adminClient = createAdminClient();
    
    // 检查用户是否已存在
    const { data: existingUser } = await adminClient.auth.admin.listUsers();
    const userExists = existingUser?.users?.some(u => u.email === email);
    
    if (userExists) {
      return NextResponse.json(
        { error: "该邮箱已被注册" },
        { status: 409 }
      );
    }
    
    // 创建用户
    const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: !sendEmail, // 如果不发送邮件，直接确认邮箱
      user_metadata: {
        role: userRole,
        created_by_admin: true,
        created_at: new Date().toISOString()
      }
    });
    
    if (createError) {
      console.error('创建用户失败:', createError);
      return NextResponse.json(
        { error: createError.message || "创建用户失败" },
        { status: 500 }
      );
    }
    
    if (!newUser.user) {
      return NextResponse.json(
        { error: "创建用户失败，未返回用户信息" },
        { status: 500 }
      );
    }
    
    // 如果用户角色不是普通用户，需要添加到admin_users表
    if (userRole !== 'user') {
      const { createClient } = await import("@/lib/supabase/server");
      const supabase = await createClient();
      
      const permissions = {
        user_management: userRole === 'super_admin' || userRole === 'admin',
        system_config: userRole === 'super_admin',
        data_export: userRole === 'super_admin' || userRole === 'admin',
        log_access: userRole === 'super_admin' || userRole === 'admin',
        service_monitoring: userRole === 'super_admin' || userRole === 'admin',
        user_data_access: userRole === 'super_admin' || userRole === 'admin'
      };
      
      const { error: adminInsertError } = await supabase
        .from('admin_users')
        .insert({
          user_id: newUser.user.id,
          role: userRole,
          permissions,
          is_active: true
        });
      
      if (adminInsertError) {
        console.error('添加管理员记录失败:', adminInsertError);
        // 如果添加管理员记录失败，删除已创建的用户
        await adminClient.auth.admin.deleteUser(newUser.user.id);
        return NextResponse.json(
          { error: "创建管理员用户失败" },
          { status: 500 }
        );
      }
    }
    
    // 记录管理员操作日志
    await logAdminAction('create_user', 'user', newUser.user.id, {
      email: newUser.user.email,
      role: userRole,
      send_email: sendEmail
    });
    
    return NextResponse.json({
      success: true,
      message: `用户创建成功${sendEmail ? '，邀请邮件已发送' : ''}`,
      user: {
        id: newUser.user.id,
        email: newUser.user.email,
        role: userRole,
        created_at: newUser.user.created_at
      }
    });
    
  } catch (error) {
    console.error('创建用户API失败:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "Failed to create user"
      },
      { 
        status: error instanceof Error && error.message.includes('permission') ? 403 : 500 
      }
    );
  }
}