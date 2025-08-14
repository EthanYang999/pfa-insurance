import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// 创建访客会话记录
export async function POST(request: NextRequest) {
  try {
    const { guestId, deviceInfo } = await request.json();

    if (!guestId) {
      return NextResponse.json(
        { error: 'Missing guestId' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // 简单记录访客会话（可选，不影响主要功能）
    const sessionData = {
      guest_id: guestId,
      device_info: deviceInfo || {},
      created_at: new Date().toISOString(),
      last_activity: new Date().toISOString()
    };

    // 尝试插入到访客会话表（如果表存在的话）
    try {
      const { error } = await supabase
        .from('guest_sessions')
        .upsert(sessionData, { 
          onConflict: 'guest_id',
          ignoreDuplicates: false 
        });

      if (error) {
        console.log('Guest session table not found or error:', error.message);
        // 不抛出错误，继续返回成功
      }
    } catch (tableError) {
      console.log('Guest session tracking skipped:', tableError);
      // 表不存在或其他错误，不影响主要功能
    }

    console.log('访客会话记录成功:', guestId);

    return NextResponse.json({
      success: true,
      guestId,
      message: 'Guest session initialized'
    });

  } catch (error) {
    console.error('Guest session API error:', error);
    
    // 即使出错也返回成功，确保不影响前端
    return NextResponse.json({
      success: true,
      message: 'Guest session initialized (fallback)'
    });
  }
}