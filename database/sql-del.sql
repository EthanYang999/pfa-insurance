BEGIN;

  -- 1. 删除API统计相关表
  DROP TABLE IF EXISTS api_call_stats CASCADE;

  -- 2. 删除用户活动统计表
  DROP TABLE IF EXISTS user_activity_stats CASCADE;

  -- 3. 删除系统配置表
  DROP TABLE IF EXISTS system_config CASCADE;

  -- 4. 删除聊天相关表（不需要聊天历史功能）
  DROP TABLE IF EXISTS chat_messages CASCADE;
  DROP TABLE IF EXISTS chat_sessions CASCADE;
  DROP TABLE IF EXISTS chat_sessions_with_stats CASCADE;

  -- 提交更改
  COMMIT;