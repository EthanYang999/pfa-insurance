import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/admin-auth';

// 更新系统设置
export async function POST(request: NextRequest) {
  try {
    // 验证管理员权限
    const adminCheck = await isAdmin();
    if (!adminCheck) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const { key, value } = await request.json();

    if (!key) {
      return NextResponse.json(
        { error: 'Missing required field: key' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // 检查设置项是否已存在
    const { data: existingSetting } = await supabase
      .from('system_settings')
      .select('*')
      .eq('key', key)
      .single();

    let result;
    if (existingSetting) {
      // 更新现有设置
      const { data, error } = await supabase
        .from('system_settings')
        .update({ 
          value,
          updated_at: new Date().toISOString()
        })
        .eq('key', key)
        .select()
        .single();

      if (error) {
        console.error('Error updating system setting:', error);
        return NextResponse.json(
          { error: 'Failed to update system setting' },
          { status: 500 }
        );
      }

      result = data;
    } else {
      // 创建新设置
      const { data, error } = await supabase
        .from('system_settings')
        .insert({
          key,
          value,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating system setting:', error);
        return NextResponse.json(
          { error: 'Failed to create system setting' },
          { status: 500 }
        );
      }

      result = data;
    }

    console.log('系统设置更新成功:', { key, value });

    return NextResponse.json({
      success: true,
      setting: result
    });

  } catch (error) {
    console.error('Admin settings API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// 获取系统设置
export async function GET(request: NextRequest) {
  try {
    // 验证管理员权限
    const adminCheck = await isAdmin();
    if (!adminCheck) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const supabase = await createClient();

    const { data: settings, error } = await supabase
      .from('system_settings')
      .select('*')
      .order('key');

    if (error) {
      console.error('Error fetching system settings:', error);
      return NextResponse.json(
        { error: 'Failed to fetch system settings' },
        { status: 500 }
      );
    }

    // 转换为键值对格式
    const settingsMap = settings?.reduce((acc: any, setting: any) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {}) || {};

    return NextResponse.json({
      success: true,
      settings: settingsMap,
      raw: settings
    });

  } catch (error) {
    console.error('Admin settings fetch API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}