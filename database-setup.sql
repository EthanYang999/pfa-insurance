-- 创建首页内容管理表
CREATE TABLE IF NOT EXISTS homepage_content (
  id SERIAL PRIMARY KEY,
  -- Hero Section
  hero_title_line1 TEXT DEFAULT '专业保险经纪人的',
  hero_title_line2 TEXT DEFAULT '智能成长平台',
  hero_description TEXT DEFAULT 'AI实战教练为您提供24/7 AI教练支持，助力保险经纪人快速成长，实现事业突破。专业培训，智能指导，共创辉煌未来。',
  hero_button_text TEXT DEFAULT '体验AI教练',
  
  -- AI Coach Section
  ai_coach_title TEXT DEFAULT 'AI教练：您的专属保险导师',
  ai_coach_description TEXT DEFAULT '基于先进AI技术，为每位经纪人提供个性化指导，实时解答疑问，助力业务增长',
  ai_coach_feature1_title TEXT DEFAULT '24/7 智能支持',
  ai_coach_feature1_desc TEXT DEFAULT '随时随地获得专业指导，无论是产品咨询还是销售技巧',
  ai_coach_feature2_title TEXT DEFAULT '个性化学习',
  ai_coach_feature2_desc TEXT DEFAULT '根据您的经验水平和业务需求，定制专属学习路径',
  ai_coach_feature3_title TEXT DEFAULT '团队协作',
  ai_coach_feature3_desc TEXT DEFAULT '与团队成员分享经验，共同成长，建立强大的保险网络',
  
  -- About Section
  about_title TEXT DEFAULT '关于 AI实战教练',
  about_description TEXT DEFAULT '我们是一个致力于推动保险行业数字化转型的专业平台。通过创新的AI技术和丰富的行业经验，为保险经纪人提供全方位的成长支持。',
  about_feature1 TEXT DEFAULT '专业的保险行业背景',
  about_feature2 TEXT DEFAULT '先进的AI技术支持',
  about_feature3 TEXT DEFAULT '完善的培训体系',
  about_feature4 TEXT DEFAULT '强大的团队文化',
  
  -- Success Cases Section
  success_cases_title TEXT DEFAULT '成功案例',
  success_cases_description TEXT DEFAULT '见证AI教练如何助力保险经纪人实现突破',
  case1_number TEXT DEFAULT '3个月',
  case1_title TEXT DEFAULT '业绩翻倍',
  case1_desc TEXT DEFAULT '新手经纪人通过AI教练指导快速成长',
  case2_number TEXT DEFAULT '200%',
  case2_title TEXT DEFAULT '效率提升',
  case2_desc TEXT DEFAULT '团队协作效率大幅提升',
  case3_number TEXT DEFAULT '45%',
  case3_title TEXT DEFAULT '转化率',
  case3_desc TEXT DEFAULT '客户转化率突破行业平均',
  
  -- CTA Section
  cta_title TEXT DEFAULT '准备开始您的保险事业新篇章？',
  cta_description TEXT DEFAULT '加入 AI实战教练，与AI教练一起，实现您的职业目标',
  cta_button_text TEXT DEFAULT '联系我们',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 插入默认数据
INSERT INTO homepage_content (id) VALUES (1) 
ON CONFLICT (id) DO NOTHING;

-- 创建更新时间触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_homepage_content_updated_at 
    BEFORE UPDATE ON homepage_content 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();