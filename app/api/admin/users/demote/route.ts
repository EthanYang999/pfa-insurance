import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";
import { requirePermission, logAdminAction, getAdminUser } from "@/lib/admin-auth";

export async function POST(request: NextRequest) {
  try {
    await requirePermission('delete_user');
    
    const { userId } = await request.json();
    
    // 验证必填字段
    if (!userId) {
      return NextResponse.json(
        { error: "用户ID是必填字段" },
        { status: 400 }
      );
    }
    
    const supabase = await createClient();
    const adminClient = createAdminClient();
    const currentAdmin = await getAdminUser();
    
    // 不能降级自己
    if (currentAdmin && currentAdmin.user_id === userId) {
      return NextResponse.json(
        { error: "不能降级自己的管理员权限" },
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
    
    // 检查用户是否是管理员
    const { data: adminUser, error: getAdminError } = await supabase
      .from('admin_users')
      .select('role')
      .eq('user_id', userId)
      .single();
    
    if (getAdminError || !adminUser) {
      return NextResponse.json(
        { error: "该用户不是管理员" },
        { status: 404 }
      );
    }
    
    // 只有超级管理员可以降级其他超级管理员
    if (adminUser.role === 'super_admin' && currentAdmin?.role !== 'super_admin') {
      return NextResponse.json(
        { error: "只有超级管理员可以降级超级管理员" },
        { status: 403 }
      );
    }
    
    // 删除管理员记录
    const { error: deleteError } = await supabase
      .from('admin_users')
      .delete()
      .eq('user_id', userId);
    
    if (deleteError) {
      console.error('删除管理员记录失败:', deleteError);
      return NextResponse.json(
        { error: "删除管理员记录失败" },
        { status: 500 }
      );
    }
    
    // 记录管理员操作日志
    await logAdminAction('update_user', 'user', userId, {
      email: targetUser.email,
      action: 'demote_from_admin',
      previous_role: adminUser.role,
      new_role: 'user'
    });
    
    return NextResponse.json({
      success: true,
      message: "管理员已降级为普通用户",
      user: {
        id: targetUser.id,
        email: targetUser.email,
        previous_role: adminUser.role,
        new_role: 'user'
      }
    });
    
  } catch (error) {
    console.error('降级用户API失败:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "Failed to demote user"
      },
      { 
        status: error instanceof Error && error.message.includes('permission') ? 403 : 500 
      }
    );
  }
}