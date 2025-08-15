# Supabase Service Role Key 设置说明

## ⚠️ 重要提示

当前用户管理功能使用的是临时解决方案。要完全启用Supabase Auth Admin API功能，需要完整的服务角色密钥。

## 🔧 修复步骤

### 1. 获取完整的服务角色密钥

1. 登录 [Supabase Dashboard](https://app.supabase.com)
2. 选择你的项目
3. 进入 **Settings > API**
4. 找到 **service_role** 密钥
5. 点击 **Reveal** 显示完整密钥
6. 复制完整的JWT token

### 2. 更新环境变量

在 `.env` 文件中，将当前的：
```
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5taWJzbnZzYmlpbXZsb3B3ZGt5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzMzNDI4OCwiZXhwIjoyMDY4OTEwMjg4fQ.
```

替换为完整的服务角色密钥：
```
SUPABASE_SERVICE_ROLE_KEY=完整的JWT_TOKEN_包含三个部分
```

JWT Token应该包含三个部分，由点(.)分隔：
- Header（头部）
- Payload（载荷）
- Signature（签名）

### 3. 重启开发服务器

```bash
npm run dev
```

## 🚀 完成后的功能

配置正确的服务角色密钥后，以下功能将完全可用：

✅ **真实用户数据**：显示真实的用户邮箱和注册信息  
✅ **用户状态管理**：真正的用户禁用/启用功能  
✅ **密码重置**：发送密码重置邮件  
✅ **用户创建**：创建新的管理员账户  
✅ **完整权限**：所有Supabase Auth Admin API功能

## 🔐 安全注意事项

- 服务角色密钥拥有完整的数据库访问权限
- 仅在服务端使用，永远不要暴露给客户端
- 定期轮换密钥以保证安全
- 在生产环境中使用环境变量管理

## 📝 当前临时方案

在修复服务角色密钥之前，用户管理功能使用以下临时方案：

- 从 `chat_sessions` 表获取活跃用户ID
- 生成模拟用户邮箱地址
- 提供基本的用户统计功能
- 管理员权限和日志记录正常工作

这确保了管理系统的其他功能可以正常使用。