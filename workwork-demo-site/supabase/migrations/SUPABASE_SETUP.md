# Supabase 设置指南

## 🚀 快速开始

### 1. 创建 Supabase 项目

1. 访问 [Supabase](https://supabase.com)
2. 点击 "Start your project"
3. 创建新组织（如果没有）
4. 创建新项目：
   - 项目名称：`workwork-platform`
   - 数据库密码：生成一个强密码并保存
   - 区域：选择离你最近的区域

### 2. 获取项目配置

项目创建完成后，在项目 Dashboard 中：

1. 点击左侧菜单 "Settings" → "API"
2. 复制以下信息：
   - **Project URL** (类似: `https://your-project-ref.supabase.co`)
   - **Anon (public) key** (以 `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9` 开头)

### 3. 配置环境变量

1. 复制 `.env.example` 为 `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. 填入你的 Supabase 配置：
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

### 4. 运行数据库迁移

在 Supabase Dashboard 中：

1. 点击左侧菜单 "SQL Editor"
2. 点击 "New query"
3. 复制 `supabase/migrations/001_create_users_table.sql` 的内容
4. 粘贴到查询编辑器
5. 点击 "Run" 执行

### 5. 验证设置

重启开发服务器：
```bash
npm run dev
```

现在用户数据将自动保存到 Supabase！

## 📊 数据库结构

### users 表
| 字段 | 类型 | 描述 |
|------|------|------|
| wallet_address | TEXT (PK) | 钱包地址，主键 |
| username | TEXT | 用户名 |
| bio | TEXT | 个人简介 |
| avatar | TEXT | 头像URL |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |

## 🔄 自动降级机制

如果 Supabase 未配置，应用会自动使用 localStorage 作为后备：

- ✅ 开发环境：使用 localStorage
- ✅ 生产环境：自动切换到 Supabase
- ✅ 配置错误：降级到 localStorage

## 🚀 部署到 Vercel

1. 在 Vercel Dashboard 添加环境变量：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

2. 重新部署项目

## 🔧 故障排除

### 常见问题

**Q: 环境变量不生效？**
A: 确保变量名以 `NEXT_PUBLIC_` 开头，并重启开发服务器

**Q: RLS 策略阻止操作？**
A: 检查 Supabase Dashboard 中的 RLS 策略配置

**Q: 连接超时？**
A: 检查网络连接，或尝试不同的 Supabase 区域

### 调试

在浏览器控制台查看详细错误信息：
```javascript
// 检查 Supabase 连接
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log('Supabase configured:', !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY))
```