# 便了么（Bianlemo）

一个面向肠道健康管理的移动优先 Web 应用。核心路径是「记录 -> 分析 -> 报告 -> 习惯养成」，后端统一采用 **Supabase**（Auth + Postgres + RLS），前端围绕轻量录入和持续反馈设计。

---

## 项目简介

`便了么`帮助用户持续记录排便情况（布里斯托分型、颜色、用时、备注等），并通过健康分、趋势分析、提醒机制和社区互动提高健康管理的可坚持性。  
项目现阶段为可运行 MVP：核心记录链路可用，分析与提醒可用，报告与 AI 助手仍有扩展空间。

---

## 系统规划（重构后目标）

### 1) 产品目标

- 降低记录门槛：3-4 步完成一次完整记录，减少用户决策负担。
- 提升复盘价值：将原始记录自动聚合为趋势与建议，而不是只做数据堆叠。
- 强化长期留存：用提醒、连续打卡、轻社区互动维持使用频率。
- 保证可演进：先以前端 + Supabase 完成闭环，再按模块接入 AI、实时与报告导出。

### 2) 分层架构

```text
UI层（sections/components/ui）
  -> 业务状态层（hooks/useAppState）
  -> 数据访问层（lib/supabaseRepository）
  -> Supabase（Auth / Postgres / RLS / Trigger）
```

### 3) 里程碑路线

- **M1（当前）**：基础记录、分析、提醒、社区、主题切换、匿名登录可用。
- **M2**：报告落库（`health_reports`）、隐私设置落库（`privacy_settings`）、AI 消息持久化。
- **M3**：登录体系升级（邮箱/手机号/三方）、Realtime 互动推送、Storage 文件能力。
- **M4**：Edge Functions（AI 总结、周报生成）和数据导出（PDF/CSV）。

---

## 功能模块构成

| 模块 | 对应文件 | 说明 |
|---|---|---|
| 首页 | `src/sections/HomePage.tsx` | 健康分、快捷操作、提醒、社区动态聚合入口 |
| 记录 | `src/sections/RecordPage.tsx` + `src/components/RecordModal.tsx` | 分步新增记录、历史记录、日历回顾 |
| 分析 | `src/sections/AnalysisPage.tsx` | 近 7 日趋势、频次与健康指标展示 |
| 报告 | `src/sections/ReportPage.tsx` | 报告列表与摘要（当前以演示数据为主） |
| 我的 | `src/sections/ProfilePage.tsx` | 主题切换、设置入口与账户相关展示 |
| 隐私页 | `src/sections/PrivacyPage.tsx` | 隐私开关与数据管理入口 |
| AI 助手 | `src/components/AIAssistant.tsx` | 当前为前端模拟交互，后续接入模型服务 |
| 全局壳层 | `src/App.tsx` + `src/components/BottomNav.tsx` | 顶栏/底栏、页面切换与弹窗承载 |

---

## 后端数据方案（Supabase）

### 当前已落地

- 鉴权：匿名登录（前端自动 `signInAnonymously`）。
- 核心表：`profiles`、`bowel_records`、`reminders`、`community_posts`、`post_likes`。
- 安全：RLS 按 `user_id` 隔离用户私有数据；社区数据按策略控制读写边界。
- 数据访问：通过 `src/lib/supabaseClient.ts` + `src/lib/supabaseRepository.ts` 统一管理。

### 规划新增

- `health_reports`：存储周报/月报结果与生成时间。
- `privacy_settings`：隐私页开关状态持久化。
- `ai_messages`：AI 对话历史与会话上下文。
- 可选 `user_profiles_ext`：补充偏好与健康目标字段。

### 数据流说明

- 入口状态集中在 `src/hooks/useAppState.ts`。
- 记录写入 `bowel_records` 后，前端通过 `src/lib/statsFromRecords.ts` 计算健康分、连续天数和趋势数据。
- 未配置环境变量时自动回退 Mock 数据，保障本地体验与联调效率。

---

## 技术路线

- 前端：React 19 + TypeScript
- 工程化：Vite 7 + ESLint 9
- UI：Tailwind CSS 3 + Radix UI（`src/components/ui/*`）
- 交互：lucide-react、sonner
- 数据层：`@supabase/supabase-js`（Auth / PostgREST / RLS）
- 扩展依赖：react-hook-form、zod、recharts（用于表单校验与可视化扩展）

---

## UI 风格

- 移动优先：内容宽度与操作触达围绕手机场景设计。
- 视觉语言：圆角卡片、轻阴影、蓝绿主色，强调“医疗友好 + 低压感”。
- 色彩建议：
  - 主色：`#4A90E2`
  - 辅色：`#5CDB95`
  - 强调/提醒：`#FF6B4A`
  - 深色背景：`#1A1F2E`
- 主题策略：亮色与暗色双主题，保持信息层级一致。
- 交互原则：少跳转、强反馈、短路径（Toast、微动效、分步录入）。

---

## 代码结构

```text
src/
  components/        # 业务组件 + 通用 UI 组件
  sections/          # 页面级模块（首页、记录、分析、报告、我的、隐私）
  hooks/             # 状态逻辑（useAppState）
  lib/               # Supabase 客户端、仓储、统计计算
  types/             # 类型定义
supabase/
  schema.sql         # 数据库结构 + RLS + 触发器
  seed.sql           # 初始示例数据
```

---

## 快速开始

```bash
npm install
npm run dev
```

### 环境变量

复制 `.env.example` 为 `.env.local` 并配置：

```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 初始化数据库

1. 在 Supabase 项目中启用匿名登录（Authentication -> Providers -> Anonymous）。
2. 执行 `supabase/schema.sql`。
3. 可选执行 `supabase/seed.sql`。

> 不要把 `service_role` 写入前端环境变量。前端仅使用 `anon key`，数据访问安全依赖 RLS。

---

## 开发与构建命令

```bash
npm run dev      # 本地开发
npm run build    # 类型检查 + 生产构建
npm run preview  # 预览构建
npm run lint     # 代码检查
```

---

## 后续优化建议

- 报告页接入真实报告生成与持久化。
- AI 助手升级为真实问答与个性化建议（Edge Functions）。
- 建立自动化测试（核心流程 E2E + 统计逻辑单测）。
- 增加部署说明（Vercel/Netlify）与 CI 检查流程。

---

## License

MIT
