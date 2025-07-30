import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";
import { requirePermission, logAdminAction } from "@/lib/admin-auth";

export async function POST(request: NextRequest) {
  try {
    await requirePermission('reset_password');
    
    const supabase = await createClient();
    const adminClient = createAdminClient();
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "缺少用户ID" },
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

    // 发送密码重置邮件
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      user.email!,
      {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/update-password`
      }
    );

    if (resetError) {
      console.error('发送密码重置邮件失败:', resetError);
      return NextResponse.json(
        { error: "发送密码重置邮件失败" },
        { status: 500 }
      );
    }

    await logAdminAction('reset_password', 'user', userId, { 
      email: user.email! 
    });

    return NextResponse.json({
      success: true,
      message: "密码重置邮件已发送"
    });

  } catch (error) {
    console.error('重置密码API失败:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "Failed to reset password" 
      },
      { status: error instanceof Error && error.message.includes('permission') ? 403 : 500 }
    );
  }
}