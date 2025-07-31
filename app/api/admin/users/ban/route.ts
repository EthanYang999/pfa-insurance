import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";
import { requirePermission, logAdminAction } from "@/lib/admin-auth";

export async function POST(request: NextRequest) {
  try {
    await requirePermission('update_user');
    
    const adminClient = createAdminClient();
    const { userId, ban } = await request.json();

    if (!userId || typeof ban !== 'boolean') {
      return NextResponse.json(
        { error: "参数错误" },
        { status: 400 }
      );
    }

    // 使用 Supabase Auth Admin API 获取用户信息
    const { data: userData, error: userError } = await adminClient.auth.admin.getUserById(userId);

    if (userError || !userData.user) {
      return NextResponse.json(
        { error: "用户不存在" },
        { status: 404 }
      );
    }

    const user = userData.user;

    // 使用 Supabase Auth Admin API 更新用户状态
    const { error: updateError } = await adminClient.auth.admin.updateUserById(userId, {
      ban_duration: ban ? '8760h' : 'none' // 8760小时 = 1年
    });

    if (updateError) {
      console.error('更新用户状态失败:', updateError);
      return NextResponse.json(
        { error: "更新用户状态失败" },
        { status: 500 }
      );
    }

    await logAdminAction(
      ban ? 'ban_user' : 'unban_user',
      'user',
      userId,
      { email: user.email!, banned: ban }
    );

    return NextResponse.json({
      success: true,
      message: `用户${ban ? '禁用' : '启用'}成功`
    });

  } catch (error) {
    console.error('用户状态更新API失败:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "Failed to update user status" 
      },
      { status: error instanceof Error && error.message.includes('permission') ? 403 : 500 }
    );
  }
}