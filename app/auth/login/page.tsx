import { LoginForm } from "@/components/login-form";

export default function Page() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-pfa-royal-blue to-pfa-navy-blue flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* 品牌标识区域 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">AI实战教练</h1>
        </div>
        
        {/* 登录表单卡片 */}
        <div className="bg-white rounded-xl shadow-2xl p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-pfa-royal-blue mb-2">欢迎回来</h2>
            <p className="text-pfa-dark-gray">登录您的账户，与AI实战教练开启专业成长之旅</p>
          </div>
          <LoginForm />
        </div>
        
        {/* 底部信息 */}
        <div className="text-center mt-6">
          <p className="text-pfa-champagne-gold text-sm">
            © 2025 AI实战教练. 保留所有权利.
          </p>
        </div>
      </div>
    </div>
  );
}
