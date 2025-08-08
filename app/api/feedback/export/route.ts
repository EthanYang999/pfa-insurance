import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

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

    // 临时方案：允许所有认证用户导出反馈（生产环境需要添加权限控制）
    // TODO: 实现真正的管理员权限验证

    const url = new URL(request.url);
    const format = url.searchParams.get('format') || 'csv';
    const status = url.searchParams.get('status');
    const type = url.searchParams.get('type');

    // 构建查询
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

    const { data, error } = await query;

    if (error) {
      console.error('获取反馈数据失败:', error);
      return NextResponse.json(
        { error: "获取数据失败" },
        { status: 500 }
      );
    }

    const feedbackTypeLabels: Record<string, string> = {
      'knowledge_error': '知识点错误',
      'response_delay': '响应延迟',
      'system_freeze': '系统卡死',
      'ui_issue': '界面问题',
      'feature_request': '功能建议',
      'bug_report': '错误报告',
      'content_quality': '内容质量问题',
      'other': '其他问题'
    };

    const statusLabels: Record<string, string> = {
      'pending': '待处理',
      'in_progress': '处理中',
      'resolved': '已解决',
      'closed': '已关闭'
    };

    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    if (format === 'csv') {
      // CSV格式导出
      const csvHeader = 'ID,提交者姓名,用户邮箱,反馈类型,状态,描述,提交时间\n';
      const csvRows = data.map(item => {
        const values = [
          item.id,
          `"${item.submitter_name}"`,
          `"${item.user_email || ''}"`,
          `"${feedbackTypeLabels[item.feedback_type] || item.feedback_type}"`,
          `"${statusLabels[item.status] || item.status}"`,
          `"${item.description.replace(/"/g, '""')}"`, // 转义双引号
          `"${formatDate(item.created_at)}"`
        ];
        return values.join(',');
      }).join('\n');

      const csvContent = csvHeader + csvRows;

      return new Response(csvContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="feedback-export-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });

    } else {
      // TXT格式导出
      let txtContent = `PFA 反馈数据导出\n`;
      txtContent += `导出时间: ${formatDate(new Date().toISOString())}\n`;
      txtContent += `总记录数: ${data.length}\n`;
      txtContent += `\n${'='.repeat(80)}\n\n`;

      data.forEach((item, index) => {
        txtContent += `【反馈 ${index + 1}】\n`;
        txtContent += `ID: ${item.id}\n`;
        txtContent += `提交者: ${item.submitter_name}\n`;
        txtContent += `邮箱: ${item.user_email || '无'}\n`;
        txtContent += `类型: ${feedbackTypeLabels[item.feedback_type] || item.feedback_type}\n`;
        txtContent += `状态: ${statusLabels[item.status] || item.status}\n`;
        txtContent += `提交时间: ${formatDate(item.created_at)}\n`;
        txtContent += `描述:\n${item.description}\n`;
        txtContent += `\n${'-'.repeat(60)}\n\n`;
      });

      return new Response(txtContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Content-Disposition': `attachment; filename="feedback-export-${new Date().toISOString().split('T')[0]}.txt"`,
        },
      });
    }

  } catch (error) {
    console.error('处理导出请求失败:', error);
    return NextResponse.json(
      { error: "服务器内部错误" },
      { status: 500 }
    );
  }
}