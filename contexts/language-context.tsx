"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'zh' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  zh: {
    // Navigation
    'nav.home': '首页',
    'nav.chat': 'AI 教练',
    'nav.about': '关于我们',
    'nav.concept': '核心理念',
    'nav.opportunity': '事业机会',
    'nav.success': '成功案例',
    'nav.login': '登录',
    'nav.logout': '退出',
    'nav.member': '会员',
    
    // Hero Section
    'hero.title.ai': 'AI驱动的',
    'hero.title.coach': ' 保险教练',
    'hero.title.excellence': '助您成就卓越',
    'hero.description': '专为保险经纪人打造的智能培训平台。24/7 AI实战教练，提供个性化指导，助您掌握销售技巧、产品知识，实现事业突破。',
    'hero.cta.experience': '立即体验 AI 教练',
    'hero.cta.demo': '观看演示视频',
    'hero.coach.name': 'AI实战教练',
    'hero.coach.status': '在线 · 随时为您服务',
    'hero.coach.intro': '您好！我是AI实战教练。我可以帮助您...',
    'hero.topics.product': '产品知识',
    'hero.topics.sales': '销售技巧',
    'hero.topics.service': '客户服务',
    
    // Features Section
    'features.title': '专业功能，助力成长',
    'features.subtitle': '全方位的培训支持，让每一位经纪人都能发挥最大潜能',
    'features.ai.title': 'AI智能对话',
    'features.ai.desc': '24/7在线，即时回答您的专业问题，提供个性化指导建议',
    'features.knowledge.title': '产品知识库',
    'features.knowledge.desc': '完整的保险产品信息，条款解析，帮助您成为产品专家',
    'features.sales.title': '销售技巧训练',
    'features.sales.desc': '从开场到成交的全流程指导，提升您的专业销售能力',
    'features.team.title': '团队协作',
    'features.team.desc': '分享经验，互相学习，打造高效的团队合作环境',
    'features.analytics.title': '业绩分析',
    'features.analytics.desc': '数据驱动的业绩分析，帮助您发现提升空间和机会',
    'features.certification.title': '成长认证',
    'features.certification.desc': '专业技能认证体系，记录您的每一步成长轨迹',
    
    // About Section
    'about.title': '关于 PFA 保险联盟',
    'about.subtitle': 'Premier Financial Alliance - 致力于成为保险行业的领军者，以专业、创新、卓越为核心，为每一位伙伴提供最优质的培训支持和事业发展平台。',
    'about.mission.title': '使命愿景',
    'about.mission.desc': '以人为本，用心服务每一位客户和伙伴。通过专业的保险解决方案和卓越的团队文化，创造更美好的未来，让保险真正成为生活的保障。',
    'about.professional.title': '专业保障',
    'about.professional.desc': '拥有资深的专业团队和完善的培训体系，确保每一位经纪人都能提供最专业、最贴心的保险咨询和服务，为客户创造真正的价值。',
    'about.culture.title': '卓越文化',
    'about.culture.desc': '倡导"一个人走得快，一群人走得远"的团队精神，营造互助共赢的工作环境，让每个人都能在团队中实现个人价值和职业成长。',
    'about.global.title': '全球视野，本土服务',
    'about.global.desc': '结合国际先进的保险理念与本土市场需求，为客户提供最适合的保险解决方案',
    'about.global.placeholder': '[专业团队形象展示区域 - 内容待添加]',
    
    // Philosophy Section
    'philosophy.title': '核心理念',
    'philosophy.subtitle': '独特的保险经营理念，以创新科技赋能传统保险业务，实现客户、经纪人、公司的三方共赢',
    'philosophy.wisdom.title': '智慧驱动',
    'philosophy.wisdom.desc': '运用AI技术和数据分析，为每位经纪人提供智能化的培训支持和业务指导，让专业服务更加精准高效。',
    'philosophy.teamwork.title': '团队共赢',
    'philosophy.teamwork.desc': '坚持"一个人走得快，一群人走得远"的理念，通过团队协作和资源共享，实现集体成长和共同成功。',
    'philosophy.customer.title': '客户至上',
    'philosophy.customer.desc': '始终将客户需求放在首位，通过专业的风险评估和个性化的保障方案，为每个家庭提供最适合的保险保障。',
    'philosophy.ai.title': 'AI科技赋能 · 专业服务升级',
    'philosophy.ai.desc': '通过先进的AI教练系统，我们将复杂的保险知识转化为易懂的培训内容，让每位经纪人都能快速掌握专业技能，为客户提供更专业、更贴心的服务。科技与人文的完美结合，让保险服务真正做到有温度、有智慧。',
    
    // Opportunity Section
    'opportunity.title': '事业机会',
    'opportunity.subtitle': '加入我们的团队，开启您的保险事业新篇章。我们提供完整的培训体系、强大的团队支持和广阔的发展空间，助您实现事业梦想。',
    'opportunity.training.title': '完善培训体系',
    'opportunity.training.desc': '从入门基础到高级技能，从产品知识到销售技巧，提供系统化、专业化的培训课程，确保每位伙伴都能快速成长为专业的保险顾问。',
    'opportunity.support.title': '强大团队支持',
    'opportunity.support.desc': '资深导师一对一指导，团队资源共享，定期交流分享会。在这里，您永远不是一个人在奋斗，整个团队都是您的坚强后盾。',
    'opportunity.development.title': '广阔发展前景',
    'opportunity.development.desc': '多元化的职业发展路径，从个人顾问到团队领导，从区域经理到合伙人，为每个人提供适合的成长空间和晋升机会。',
    'opportunity.why.title': '为什么选择 PFA？',
    'opportunity.benefit1': 'AI智能教练24/7专业指导',
    'opportunity.benefit2': '行业领先的产品组合和服务',
    'opportunity.benefit3': '完善的激励机制和福利体系',
    'opportunity.benefit4': '持续的技能提升和职业发展',
    'opportunity.benefit5': '温暖的团队文化和工作氛围',
    'opportunity.cta': '了解加入详情',
    'opportunity.quote': '"一个人走得快，一群人走得远。在这里，我们不仅仅是同事，更是相互支撑的伙伴和朋友。"',
    'opportunity.quote.author': '— 核心理念',
    
    // Success Stories
    'success.title': '成功案例',
    'success.subtitle': '真实的成长故事，见证每一位伙伴在平台上的专业蜕变和事业成功',
    'success.more.title': '更多成功故事',
    'success.more.placeholder': '[真实经纪人成功案例展示区域 - 详细内容待添加]',
    'success.stats.agents': '成功经纪人',
    'success.stats.clients': '满意客户',
    'success.stats.satisfaction': '客户满意度',
    'success.stats.renewal': '续保率',
    
    // CTA Section
    'cta.title': '准备开始您的专业成长之旅？',
    'cta.subtitle': '立即体验AI实战教练，获得个性化的专业指导，让您的保险事业更上一层楼',
    'cta.button': '开始对话',
    
    // Contact Section
    'contact.join.title': '加入我们的团队',
    'contact.join.subtitle': '开启您的保险事业新篇章，与我们一起创造更美好的未来',
    'contact.membership.title': '会员计划',
    'contact.membership.item1': '专业培训认证体系',
    'contact.membership.item2': 'AI教练一对一指导',
    'contact.membership.item3': '团队资源共享平台',
    'contact.membership.item4': '丰厚的激励和奖励机制',
    'contact.membership.placeholder': '[详细会员计划内容 - 待完善]',
    'contact.join.cta': '立即咨询加入',
    'contact.us.title': '联系我们',
    'contact.us.subtitle': '有任何问题或想要了解更多信息？我们随时为您服务',
    'contact.ai.title': 'AI智能咨询',
    'contact.ai.desc': '与我们的AI实战教练对话，获得即时的专业解答和个性化建议',
    'contact.ai.button': '开始咨询',
    'contact.team.title': '团队交流',
    'contact.team.placeholder': '[团队联系方式待添加]',
    'contact.support.title': '在线支持',
    'contact.support.placeholder': '[在线服务支持待添加]',
    'contact.form.title': '联系表单',
    'contact.form.placeholder': '[专业在线联系表单 - 待实现]',
    'contact.form.fields': '姓名、电话、邮箱、咨询内容等字段',
    
    // Footer
    'footer.description': '专注于为保险经纪人提供最专业的AI培训支持，助力每一位伙伴实现事业成功。',
    'footer.quicklinks': '快速链接',
    'footer.services': '服务支持',
    'footer.service1': 'AI智能咨询',
    'footer.service2': '专业培训体系',
    'footer.service3': '团队协作平台',
    'footer.service.contact': '[具体联系方式待添加]',
    'footer.copyright': '© 2025 PFA 保险联盟. 保留所有权利.',
    
    // Chat Interface
    'chat.title': 'AI实战教练',
    'chat.back': '返回首页',
    'chat.online': '在线',
    'chat.placeholder': '输入您的问题...',
    'chat.send': '发送',
    'chat.thinking': '思考中...',
    'chat.error': '发送失败，请重试',
    'chat.loading': '正在验证登录状态...',
    
    // Auth
    'auth.login': '登录',
    'auth.signup': '注册',
    'auth.email': '邮箱',
    'auth.password': '密码',
    'auth.welcome': '欢迎回来',
    'auth.create': '创建账户',
    'auth.forgot': '忘记密码',
    'auth.reset': '重置密码'
  },
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.chat': 'AI Coach',
    'nav.about': 'About Us',
    'nav.concept': 'Core Philosophy',
    'nav.opportunity': 'Career Opportunities',
    'nav.success': 'Success Stories',
    'nav.login': 'Login',
    'nav.logout': 'Logout',
    'nav.member': 'Member',
    
    // Hero Section
    'hero.title.ai': 'AI-Powered',
    'hero.title.coach': ' Insurance Coach',
    'hero.title.excellence': 'Empowering Your Excellence',
    'hero.description': 'Intelligent training platform designed for PFA insurance brokers. 24/7 AI Coach Shirley provides personalized guidance to help you master sales skills, product knowledge, and achieve career breakthroughs.',
    'hero.cta.experience': 'Experience AI Coach Now',
    'hero.cta.demo': 'Watch Demo Video',
    'hero.coach.name': 'AI Coach Shirley',
    'hero.coach.status': 'Online · Always at Your Service',
    'hero.coach.intro': 'Hello! I am Shirley, your dedicated AI insurance coach. I can help you with...',
    'hero.topics.product': 'Product Knowledge',
    'hero.topics.sales': 'Sales Skills',
    'hero.topics.service': 'Customer Service',
    
    // Features Section
    'features.title': 'Professional Features for Growth',
    'features.subtitle': 'Comprehensive training support to help every broker reach their full potential',
    'features.ai.title': 'AI Smart Dialogue',
    'features.ai.desc': '24/7 online support, instant answers to your professional questions with personalized guidance',
    'features.knowledge.title': 'Product Knowledge Base',
    'features.knowledge.desc': 'Complete insurance product information and policy analysis to help you become a product expert',
    'features.sales.title': 'Sales Skills Training',
    'features.sales.desc': 'Full-process guidance from opening to closing deals, enhancing your professional sales capabilities',
    'features.team.title': 'Team Collaboration',
    'features.team.desc': 'Share experiences, learn from each other, and build an efficient team collaboration environment',
    'features.analytics.title': 'Performance Analytics',
    'features.analytics.desc': 'Data-driven performance analysis to help you discover improvement opportunities',
    'features.certification.title': 'Growth Certification',
    'features.certification.desc': 'Professional skill certification system to record every step of your growth journey',
    
    // About Section
    'about.title': 'About PFA Insurance Alliance',
    'about.subtitle': 'Premier Financial Alliance - Committed to becoming a leader in the insurance industry, with professionalism, innovation, and excellence at our core, providing the highest quality training support and career development platform for every partner.',
    'about.mission.title': 'Mission & Vision',
    'about.mission.desc': 'People-centered, serving every client and partner with dedication. Through professional insurance solutions and excellent team culture, we create a better future, making insurance truly a guarantee for life.',
    'about.professional.title': 'Professional Assurance',
    'about.professional.desc': 'With a senior professional team and comprehensive training system, ensuring every broker can provide the most professional and caring insurance consultation and services, creating real value for clients.',
    'about.culture.title': 'Excellence Culture',
    'about.culture.desc': 'Advocating the team spirit of "one person walks fast, a group walks far," creating a collaborative and win-win work environment where everyone can realize personal value and career growth within the team.',
    'about.global.title': 'Global Vision, Local Service',
    'about.global.desc': 'Combining international advanced insurance concepts with local market needs to provide the most suitable insurance solutions for clients',
    'about.global.placeholder': '[Professional team showcase area - content to be added]',
    
    // Philosophy Section
    'philosophy.title': 'Core Philosophy',
    'philosophy.subtitle': "PFA's unique insurance business philosophy, empowering traditional insurance business with innovative technology to achieve win-win outcomes for clients, brokers, and the company",
    'philosophy.wisdom.title': 'Wisdom-Driven',
    'philosophy.wisdom.desc': 'Using AI technology and data analysis to provide intelligent training support and business guidance for every broker, making professional services more precise and efficient.',
    'philosophy.teamwork.title': 'Team Success',
    'philosophy.teamwork.desc': 'Adhering to the philosophy of "one person walks fast, a group walks far," achieving collective growth and common success through team collaboration and resource sharing.',
    'philosophy.customer.title': 'Customer First',
    'philosophy.customer.desc': 'Always putting customer needs first, providing the most suitable insurance protection for every family through professional risk assessment and personalized protection plans.',
    'philosophy.ai.title': 'AI Technology Empowerment · Professional Service Upgrade',
    'philosophy.ai.desc': 'Through advanced AI coaching systems, we transform complex insurance knowledge into understandable training content, enabling every broker to quickly master professional skills and provide more professional and caring services to clients. The perfect combination of technology and humanity makes insurance services truly warm and intelligent.',
    
    // Opportunity Section
    'opportunity.title': 'Career Opportunities',
    'opportunity.subtitle': 'Join the PFA team and start a new chapter in your insurance career. We provide a complete training system, strong team support, and broad development space to help you achieve your career dreams.',
    'opportunity.training.title': 'Comprehensive Training System',
    'opportunity.training.desc': 'From basic entry to advanced skills, from product knowledge to sales techniques, providing systematic and professional training courses to ensure every partner can quickly grow into a professional insurance advisor.',
    'opportunity.support.title': 'Strong Team Support',
    'opportunity.support.desc': 'One-on-one guidance from senior mentors, team resource sharing, regular exchange meetings. At PFA, you are never fighting alone - the entire team is your strong support.',
    'opportunity.development.title': 'Broad Development Prospects',
    'opportunity.development.desc': 'Diversified career development paths, from individual advisor to team leader, from regional manager to partner, providing suitable growth space and promotion opportunities for everyone.',
    'opportunity.why.title': 'Why Choose PFA?',
    'opportunity.benefit1': 'AI Smart Coach 24/7 Professional Guidance',
    'opportunity.benefit2': 'Industry-leading Product Portfolio and Services',
    'opportunity.benefit3': 'Comprehensive Incentive and Benefits System',
    'opportunity.benefit4': 'Continuous Skill Enhancement and Career Development',
    'opportunity.benefit5': 'Warm Team Culture and Work Environment',
    'opportunity.cta': 'Learn About Joining',
    'opportunity.quote': '"One person walks fast, a group walks far. At PFA, we are not just colleagues, but partners and friends who support each other."',
    'opportunity.quote.author': '— PFA Core Philosophy',
    
    // Success Stories
    'success.title': 'Success Stories',
    'success.subtitle': 'Real growth stories, witnessing the professional transformation and career success of every partner on the PFA platform',
    'success.more.title': 'More Success Stories',
    'success.more.placeholder': '[Real broker success stories showcase area - detailed content to be added]',
    'success.stats.agents': 'Successful Brokers',
    'success.stats.clients': 'Satisfied Clients',
    'success.stats.satisfaction': 'Client Satisfaction',
    'success.stats.renewal': 'Renewal Rate',
    
    // CTA Section
    'cta.title': 'Ready to Start Your Professional Growth Journey?',
    'cta.subtitle': 'Experience AI Coach Shirley now for personalized professional guidance to take your insurance career to the next level',
    'cta.button': 'Start Conversation',
    
    // Contact Section
    'contact.join.title': 'Join PFA Team',
    'contact.join.subtitle': 'Start a new chapter in your insurance career and create a better future with us',
    'contact.membership.title': 'Membership Program',
    'contact.membership.item1': 'Professional Training Certification System',
    'contact.membership.item2': 'AI Coach One-on-One Guidance',
    'contact.membership.item3': 'Team Resource Sharing Platform',
    'contact.membership.item4': 'Rich Incentives and Reward System',
    'contact.membership.placeholder': '[Detailed membership program content - to be improved]',
    'contact.join.cta': 'Inquire About Joining Now',
    'contact.us.title': 'Contact Us',
    'contact.us.subtitle': 'Have any questions or want to learn more? We are always here to serve you',
    'contact.ai.title': 'AI Smart Consultation',
    'contact.ai.desc': 'Chat with our AI Coach Shirley for instant professional answers and personalized advice',
    'contact.ai.button': 'Start Consultation',
    'contact.team.title': 'Team Communication',
    'contact.team.placeholder': '[Team contact information to be added]',
    'contact.support.title': 'Online Support',
    'contact.support.placeholder': '[Online service support to be added]',
    'contact.form.title': 'Contact Form',
    'contact.form.placeholder': '[Professional online contact form - to be implemented]',
    'contact.form.fields': 'Name, phone, email, inquiry content and other fields',
    
    // Footer
    'footer.description': 'Dedicated to providing the most professional AI training support for insurance brokers, helping every partner achieve career success.',
    'footer.quicklinks': 'Quick Links',
    'footer.services': 'Service Support',
    'footer.service1': 'AI Smart Consultation',
    'footer.service2': 'Professional Training System',
    'footer.service3': 'Team Collaboration Platform',
    'footer.service.contact': '[Specific contact information to be added]',
    'footer.copyright': '© 2025 PFA Insurance Alliance. All rights reserved.',
    
    // Chat Interface
    'chat.title': 'Premier Insurance Coach - Shirley',
    'chat.back': 'Back to Home',
    'chat.online': 'Online',
    'chat.placeholder': 'Enter your question...',
    'chat.send': 'Send',
    'chat.thinking': 'Thinking...',
    'chat.error': 'Send failed, please try again',
    'chat.loading': 'Verifying login status...',
    
    // Auth
    'auth.login': 'Login',
    'auth.signup': 'Sign Up',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.welcome': 'Welcome Back',
    'auth.create': 'Create Account',
    'auth.forgot': 'Forgot Password',
    'auth.reset': 'Reset Password'
  }
};

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguage] = useState<Language>('zh');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('pfa-language') as Language;
    if (savedLanguage && (savedLanguage === 'zh' || savedLanguage === 'en')) {
      setLanguage(savedLanguage);
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('pfa-language', lang);
  };

  const t = (key: string): string => {
    return (translations[language] as Record<string, string>)[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}