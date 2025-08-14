import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    
    // 获取当前用户信息
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "未授权访问" },
        { status: 401 }
      );
    }

    // 解析请求数据
    const body = await request.json();
    const { submitter_name, feedback_type, description, user_email, user_id } = body;

    // 验证必填字段
    if (!submitter_name || !feedback_type || !description) {
      return NextResponse.json(
        { error: "缺少必填字段" },
        { status: 400 }
      );
    }

    // 验证反馈类型
    const validTypes = [
      'knowledge_error',
      'response_delay',
      'system_freeze',
      'ui_issue',
      'feature_request',
      'bug_report',
      'content_quality',
      'other'
    ];

    if (!validTypes.includes(feedback_type)) {
      return NextResponse.json(
        { error: "无效的反馈类型" },
        { status: 400 }
      );
    }

    // 插入反馈数据
    const { data, error } = await supabase
      .from('feedback')
      .insert({
        submitter_name: submitter_name.trim(),
        feedback_type,
        description: description.trim(),
        user_email: user_email || user.email,
        user_id: user_id || user.id,
        status: 'pending',
        priority: 'medium'
      })
      .select()
      .single();

    if (error) {
      console.error('保存反馈失败:', error);
      return NextResponse.json(
        { error: "保存失败，请稍后重试" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        message: "反馈提交成功", 
        feedback_id: data.id 
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('处理反馈请求失败:', error);
    return NextResponse.json(
      { error: "服务器内部错误" },
      { status: 500 }
    );
  }
}

// 获取反馈列表（管理员用）
export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    
    // 获取当前用户信息
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "未授权访问" },
        { status: 401 }
      );
    }

    // 临时方案：允许所有认证用户查看反馈（生产环境需要添加权限控制）
    // TODO: 实现真正的管理员权限验证

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const status = url.searchParams.get('status');
    const type = url.searchParams.get('type');

    let query = supabase
      .from('feedback')
      .select('*')
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    if (type) {
      query = query.eq('feedback_type', type);
    }

    const offset = (page - 1) * limit;
    
    // 先获取总数
    let countQuery = supabase.from('feedback').select('*', { count: 'exact', head: true });
    if (status) {
      countQuery = countQuery.eq('status', status);
    }
    if (type) {
      countQuery = countQuery.eq('feedback_type', type);
    }
    
    const { count, error: countError } = await countQuery;
    
    if (countError) {
      console.error('获取反馈总数失败:', countError);
      return NextResponse.json(
        { error: "获取总数失败" },
        { status: 500 }
      );
    }

    // 获取分页数据
    const { data, error } = await query.range(offset, offset + limit - 1);

    if (error) {
      console.error('获取反馈列表失败:', error);
      return NextResponse.json(
        { error: "获取数据失败" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });

  } catch (error) {
    console.error('处理反馈列表请求失败:', error);
    return NextResponse.json(
      { error: "服务器内部错误" },
      { status: 500 }
    );
  }
}

// 更新反馈状态（管理员用）
export async function PUT(request: Request) {
  try {
    // 验证管理员权限
    const adminCheck = await isAdmin();
    if (!adminCheck) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { id, status, priority } = body;

    // 验证必填字段
    if (!id || !status) {
      return NextResponse.json(
        { error: "缺少必填字段: id 和 status" },
        { status: 400 }
      );
    }

    // 验证状态值
    const validStatuses = ['pending', 'in_progress', 'resolved', 'closed'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "无效的状态值" },
        { status: 400 }
      );
    }

    // 验证优先级（如果提供）
    if (priority) {
      const validPriorities = ['low', 'medium', 'high', 'urgent'];
      if (!validPriorities.includes(priority)) {
        return NextResponse.json(
          { error: "无效的优先级值" },
          { status: 400 }
        );
      }
    }

    const supabase = await createClient();
    
    // 构建更新数据
    const updateData: any = {
      status,
      updated_at: new Date().toISOString()
    };
    
    if (priority) {
      updateData.priority = priority;
    }

    // 更新反馈
    const { data, error } = await supabase
      .from('feedback')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('更新反馈状态失败:', error);
      return NextResponse.json(
        { error: "更新失败，请稍后重试" },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: "未找到指定的反馈记录" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "反馈状态更新成功",
      feedback: data
    });

  } catch (error) {
    console.error('处理反馈更新请求失败:', error);
    return NextResponse.json(
      { error: "服务器内部错误" },
      { status: 500 }
    );
  }
}