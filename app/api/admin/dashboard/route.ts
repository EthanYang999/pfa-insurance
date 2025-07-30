import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { requireAdmin, logAdminAction } from "@/lib/admin-auth";

export async function GET() {
  try {
    await requireAdmin();
    
    const supabase = await createClient();
    
    // 获取统计数据
    const { data: stats } = await supabase
      .from('admin_dashboard_stats')
      .select('*')
      .single();

    await logAdminAction('view_dashboard');

    return NextResponse.json({
      success: true,
      stats: stats || {
        total_users: 0,
        new_users_today: 0,
        new_sessions_today: 0,
        new_messages_today: 0,
        active_sessions: 0,
        avg_n8n_response_time: null
      }
    });

  } catch (error) {
    console.error('获取管理面板统计失败:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "获取统计数据失败" 
      },
      { status: error instanceof Error && error.message.includes('权限') ? 403 : 500 }
    );
  }
}