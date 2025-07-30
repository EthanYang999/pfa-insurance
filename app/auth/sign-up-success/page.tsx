import Link from "next/link";

export default function Page() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-pfa-royal-blue to-pfa-navy-blue flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* 品牌标识区域 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-pfa-champagne-gold rounded-full mb-4">
            <span className="text-2xl font-bold text-pfa-royal-blue">P</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">PFA 保险联盟</h1>
          <p className="text-pfa-champagne-gold text-sm">Premier Financial Alliance</p>
        </div>
        
        {/* 成功消息卡片 */}
        <div className="bg-white rounded-xl shadow-2xl p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-pfa-royal-blue mb-2">
            注册成功！
          </h2>
          <p className="text-pfa-dark-gray mb-6">
            请检查您的邮箱并点击确认链接来激活您的账户，然后即可开始您的保险学习之旅。
          </p>
          <Link
            href="/auth/login"
            className="inline-block bg-pfa-champagne-gold hover:bg-pfa-accent-gold text-pfa-royal-blue font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            返回登录
          </Link>
        </div>
        
        {/* 底部信息 */}
        <div className="text-center mt-6">
          <p className="text-pfa-champagne-gold text-sm">
            © 2025 PFA 保险联盟. 保留所有权利.
          </p>
        </div>
      </div>
    </div>
  );
}
