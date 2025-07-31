import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";
import { requirePermission, logAdminAction, getAdminUser } from "@/lib/admin-auth";

export async function POST(request: NextRequest) {
  try {
    await requirePermission('delete_user');
    
    const { userId, deleteType = 'soft' } = await request.json();
    
    // 验证必填字段
    if (!userId) {
      return NextResponse.json(
        { error: "用户ID是必填字段" },
        { status: 400 }
      );
    }
    
    // 验证删除类型
    if (!['soft', 'hard'].includes(deleteType)) {
      return NextResponse.json(
        { error: "无效的删除类型" },
        { status: 400 }
      );
    }
    
    const adminClient = createAdminClient();
    const supabase = await createClient();
    
    // 获取要删除的用户信息
    const { data: userData, error: getUserError } = await adminClient.auth.admin.getUserById(userId);
    
    if (getUserError || !userData.user) {
      return NextResponse.json(
        { error: "用户不存在" },
        { status: 404 }
      );
    }
    
    const targetUser = userData.user;
    const currentAdmin = await getAdminUser();
    
    // 安全检查：不能删除自己
    if (currentAdmin && currentAdmin.user_id === userId) {
      return NextResponse.json(
        { error: "不能删除自己的账户" },
        { status: 403 }
      );
    }
    
    // 检查目标用户是否是超级管理员
    const { data: targetAdminUser } = await supabase
      .from('admin_users')
      .select('role')
      .eq('user_id', userId)
      .single();
    
    // 安全检查：只有超级管理员可以删除其他超级管理员
    if (targetAdminUser?.role === 'super_admin' && currentAdmin?.role !== 'super_admin') {
      return NextResponse.json(
        { error: "只有超级管理员可以删除超级管理员账户" },
        { status: 403 }
      );
    }
    
    // 获取用户的关联数据统计
    const { data: chatSessions, error: sessionsError } = await supabase
      .from('chat_sessions')
      .select('id')
      .eq('user_id', userId);
    
    if (sessionsError) {
      console.error('获取用户聊天记录失败:', sessionsError);
    }
    
    const sessionCount = chatSessions?.length || 0;
    
    if (deleteType === 'soft') {
      // 软删除：禁用用户账户
      const { error: banError } = await adminClient.auth.admin.updateUserById(userId, {
        ban_duration: '8760h' // 禁用一年
      });
      
      if (banError) {
        console.error('禁用用户失败:', banError);
        return NextResponse.json(
          { error: "禁用用户失败" },
          { status: 500 }
        );
      }
      
      // 在admin_users表中标记为不活跃（如果存在）
      if (targetAdminUser) {
        await supabase
          .from('admin_users')
          .update({ is_active: false })
          .eq('user_id', userId);
      }
      
      await logAdminAction('ban_user', 'user', userId, {
        email: targetUser.email,
        delete_type: 'soft',
        session_count: sessionCount,
        reason: 'Admin deletion (soft)'
      });
      
      return NextResponse.json({
        success: true,
        message: `用户已被禁用（软删除）`,
        details: {
          user_email: targetUser.email,
          session_count: sessionCount,
          delete_type: 'soft'
        }
      });
      
    } else {
      // 硬删除：彻底删除用户和所有相关数据
      
      // 先删除管理员记录（如果存在）
      if (targetAdminUser) {
        const { error: adminDeleteError } = await supabase
          .from('admin_users')
          .delete()
          .eq('user_id', userId);
        
        if (adminDeleteError) {
          console.error('删除管理员记录失败:', adminDeleteError);
          return NextResponse.json(
            { error: "删除管理员记录失败" },
            { status: 500 }
          );
        }
      }
      
      // 删除聊天消息（通过级联删除会自动处理）
      if (sessionCount > 0) {
        const { error: messagesDeleteError } = await supabase
          .from('chat_messages')
          .delete()
          .in('session_id', chatSessions!.map(s => s.id));
        
        if (messagesDeleteError) {
          console.error('删除聊天消息失败:', messagesDeleteError);
        }
        
        // 删除聊天会话
        const { error: sessionsDeleteError } = await supabase
          .from('chat_sessions')
          .delete()
          .eq('user_id', userId);
        
        if (sessionsDeleteError) {
          console.error('删除聊天会话失败:', sessionsDeleteError);
        }
      }
      
      // 记录操作日志（在删除用户之前）
      await logAdminAction('delete_user', 'user', userId, {
        email: targetUser.email,
        delete_type: 'hard',
        session_count: sessionCount,
        reason: 'Admin deletion (hard)'
      });
      
      // 最后删除用户账户
      const { error: deleteUserError } = await adminClient.auth.admin.deleteUser(userId);
      
      if (deleteUserError) {
        console.error('删除用户失败:', deleteUserError);
        return NextResponse.json(
          { error: "删除用户失败" },
          { status: 500 }
        );
      }
      
      return NextResponse.json({
        success: true,
        message: `用户已被彻底删除（硬删除）`,
        details: {
          user_email: targetUser.email,
          session_count: sessionCount,
          delete_type: 'hard'
        }
      });
    }
    
  } catch (error) {
    console.error('删除用户API失败:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "Failed to delete user"
      },
      { 
        status: error instanceof Error && error.message.includes('permission') ? 403 : 500 
      }
    );
  }
}