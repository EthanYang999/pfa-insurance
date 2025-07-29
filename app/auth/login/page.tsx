import { LoginForm } from "@/components/login-form";

export default function Page() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-coach-blue-primary to-coach-blue-gradient flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* 品牌标识区域 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-coach-gold-accent rounded-full mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">AI教练雪莉</h1>
          <p className="text-coach-gold-light text-sm">PFA保险经纪人专业培训助手</p>
        </div>
        
        {/* 登录表单卡片 */}
        <div className="bg-white rounded-xl shadow-2xl p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-coach-gray-dark mb-2">欢迎回来</h2>
            <p className="text-coach-gray-medium">请登录您的账户开始学习</p>
          </div>
          <LoginForm />
        </div>
        
        {/* 底部信息 */}
        <div className="text-center mt-6">
          <p className="text-coach-gold-light text-sm">
            © 2024 PFA保险公司. 保留所有权利.
          </p>
        </div>
      </div>
    </div>
  );
}
