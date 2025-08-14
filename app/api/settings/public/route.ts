import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// 获取公开的系统设置（不需要认证）
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // 只获取公开的系统设置
    const publicSettings = [
      'guest_access_enabled',
      'maintenance_mode',
      'max_message_length',
      'rate_limit_per_minute'
    ];

    const { data: settings, error } = await supabase
      .from('system_settings')
      .select('key, value')
      .in('key', publicSettings);

    if (error) {
      console.error('Error fetching public settings:', error);
      // 返回默认设置，不报错
      return NextResponse.json({
        success: true,
        settings: {
          guest_access_enabled: true, // 默认启用访客模式
          maintenance_mode: false,
          max_message_length: 4000,
          rate_limit_per_minute: 30
        }
      });
    }

    // 转换为键值对格式
    const settingsMap = settings?.reduce((acc: any, setting: any) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {}) || {};

    // 设置默认值
    const finalSettings = {
      guest_access_enabled: settingsMap.guest_access_enabled ?? true,
      maintenance_mode: settingsMap.maintenance_mode ?? false,
      max_message_length: settingsMap.max_message_length ?? 4000,
      rate_limit_per_minute: settingsMap.rate_limit_per_minute ?? 30,
      ...settingsMap
    };

    return NextResponse.json({
      success: true,
      settings: finalSettings
    });

  } catch (error) {
    console.error('Public settings API error:', error);
    
    // 即使出错也返回默认设置，确保前端不会崩溃
    return NextResponse.json({
      success: true,
      settings: {
        guest_access_enabled: true,
        maintenance_mode: false,
        max_message_length: 4000,
        rate_limit_per_minute: 30
      }
    });
  }
}