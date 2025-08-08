-- 创建反馈表
CREATE TABLE feedback (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    submitter_name text NOT NULL,
    feedback_type text NOT NULL CHECK (feedback_type IN (
        'knowledge_error',     -- 知识点错误
        'response_delay',      -- 响应延迟
        'system_freeze',       -- 系统卡死
        'ui_issue',           -- 界面问题
        'feature_request',     -- 功能建议
        'bug_report',         -- 错误报告
        'content_quality',     -- 内容质量问题
        'other'               -- 其他
    )),
    description text NOT NULL,
    user_email text,          -- 可选：用户邮箱（从session获取）
    user_id uuid,             -- 可选：关联用户ID
    status text DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'resolved', 'closed')),
    priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    resolved_at timestamp with time zone,
    admin_notes text,         -- 管理员备注
    resolved_by uuid          -- 处理人ID
);

-- 创建索引
CREATE INDEX idx_feedback_created_at ON feedback(created_at DESC);
CREATE INDEX idx_feedback_status ON feedback(status);
CREATE INDEX idx_feedback_type ON feedback(feedback_type);
CREATE INDEX idx_feedback_user_id ON feedback(user_id);

-- 创建更新时间触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_feedback_updated_at 
    BEFORE UPDATE ON feedback 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 启用行级安全策略
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- 允许所有经过身份验证的用户插入反馈
CREATE POLICY "Allow authenticated users to insert feedback" ON feedback
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 允许用户查看自己的反馈
CREATE POLICY "Users can view own feedback" ON feedback
    FOR SELECT USING (
        auth.uid() = user_id OR 
        auth.email() = user_email
    );

-- 管理员可以查看和管理所有反馈（暂时注释，需要profiles表）
-- CREATE POLICY "Admins can manage all feedback" ON feedback
--     FOR ALL USING (
--         EXISTS (
--             SELECT 1 FROM profiles 
--             WHERE profiles.id = auth.uid() 
--             AND profiles.role = 'admin'
--         )
--     );