import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { requirePermission, logAdminAction } from "@/lib/admin-auth";

export async function POST(request: NextRequest) {
  try {
    await requirePermission('reset_password');
    
    const supabase = await createClient();
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "缺少用户ID" },
        { status: 400 }
      );
    }

    // 获取用户邮箱
    const { data: user, error: userError } = await supabase
      .from('auth.users')
      .select('email')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: "用户不存在" },
        { status: 404 }
      );
    }

    // 发送密码重置邮件
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      user.email,
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
      email: user.email 
    });

    return NextResponse.json({
      success: true,
      message: "密码重置邮件已发送"
    });

  } catch (error) {
    console.error('重置密码API失败:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "重置密码失败" 
      },
      { status: error instanceof Error && error.message.includes('权限') ? 403 : 500 }
    );
  }
}