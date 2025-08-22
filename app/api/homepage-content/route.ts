import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  
  try {
    const { data, error } = await supabase
      .from('homepage_content')
      .select('*')
      .single()
    
    if (error && error.code !== 'PGRST116') {
      throw error
    }
    
    // 如果没有数据，返回默认内容
    if (!data) {
      const defaultContent = {
        // Hero Section
        hero_title_line1: '专业保险经纪人的',
        hero_title_line2: '智能成长平台',
        hero_description: 'AI实战教练为您提供24/7 AI教练支持，助力保险经纪人快速成长，实现事业突破。专业培训，智能指导，共创辉煌未来。',
        hero_button_text: '体验AI教练',
        
        // AI Coach Section
        ai_coach_title: 'AI教练：您的专属保险导师',
        ai_coach_description: '基于先进AI技术，为每位经纪人提供个性化指导，实时解答疑问，助力业务增长',
        ai_coach_feature1_title: '24/7 智能支持',
        ai_coach_feature1_desc: '随时随地获得专业指导，无论是产品咨询还是销售技巧',
        ai_coach_feature2_title: '个性化学习',
        ai_coach_feature2_desc: '根据您的经验水平和业务需求，定制专属学习路径',
        ai_coach_feature3_title: '团队协作',
        ai_coach_feature3_desc: '与团队成员分享经验，共同成长，建立强大的保险网络',
        
        // About Section
        about_title: '关于 AI实战教练',
        about_description: '我们是一个致力于推动保险行业数字化转型的专业平台。通过创新的AI技术和丰富的行业经验，为保险经纪人提供全方位的成长支持。',
        about_feature1: '专业的保险行业背景',
        about_feature2: '先进的AI技术支持',
        about_feature3: '完善的培训体系',
        about_feature4: '强大的团队文化',
        
        // Success Cases Section
        success_cases_title: '成功案例',
        success_cases_description: '见证AI教练如何助力保险经纪人实现突破',
        case1_number: '3个月',
        case1_title: '业绩翻倍',
        case1_desc: '新手经纪人通过AI教练指导快速成长',
        case2_number: '200%',
        case2_title: '效率提升',
        case2_desc: '团队协作效率大幅提升',
        case3_number: '45%',
        case3_title: '转化率',
        case3_desc: '客户转化率突破行业平均',
        
        // CTA Section
        cta_title: '准备开始您的保险事业新篇章？',
        cta_description: '加入 AI实战教练，与AI教练一起，实现您的职业目标',
        cta_button_text: '联系我们'
      }
      
      return NextResponse.json(defaultContent)
    }
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching homepage content:', error)
    return NextResponse.json(
      { error: 'Failed to fetch homepage content' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  
  try {
    const content = await request.json()
    
    // 更新或插入内容
    const { data, error } = await supabase
      .from('homepage_content')
      .upsert(content)
      .select()
      .single()
    
    if (error) {
      throw error
    }
    
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error updating homepage content:', error)
    return NextResponse.json(
      { error: 'Failed to update homepage content' },
      { status: 500 }
    )
  }
}