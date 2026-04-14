## Summary

为提升“入口层面”的安全性与隐蔽性：点击悬浮机器人进入的后台入口改为**假登录页**（无论输入什么都提示账号或密码错误），真实后台管理系统整体迁移到仅通过 URL 访问的路径前缀 **/console-center** 下（仍保持原有鉴权逻辑，未登录无法进入）。

## Current State Analysis

- 悬浮机器人点击后跳转到 `/admin`：[FloatingRobot.tsx](file:///workspace/src/components/FloatingRobot.tsx#L75-L84)
- 当前真实后台路由位于：
  - 登录页：`/admin/login`：[App.tsx](file:///workspace/src/App.tsx#L41-L54)
  - 后台主入口（含 Dashboard/Settings/...）：`/admin/*`，并在未登录时由布局组件跳转到 `/admin/login`：[AdminLayout.tsx](file:///workspace/src/components/AdminLayout.tsx#L1-L20)
- 登录成功后会 `navigate('/admin')`：[Login.tsx](file:///workspace/src/pages/admin/Login.tsx#L26-L47)

## Decisions (Locked)

- 真实后台入口前缀：`/console-center`
- 访问 `/admin` 或 `/admin/*`：始终显示假登录页
- 假登录页 UI：尽量复用真实登录页 UI，仅替换提交逻辑为“永远失败”

## Proposed Changes

### 1) 增加假登录页（永远失败）

**新增文件**
- 新增 `src/pages/admin/FakeLogin.tsx`

**行为**
- 复用现有 `src/pages/admin/Login.tsx` 的视觉结构（背景、卡片、表单、提示样式保持一致）
- 表单提交时不请求任何接口，不写入 token，不跳转
- 无论输入什么，都在短暂延迟（例如 300–600ms）后设置错误提示：`账号或密码错误`
- 可选：每次提交前清空 error，再显示错误，模拟真实请求体验

### 2) 将真实后台整体迁移到 /console-center

**修改文件**
- 修改 `src/App.tsx`

**路由调整**
- 假入口：
  - `path="/admin"` → `<FakeLogin />`
  - `path="/admin/*"` → `<FakeLogin />`（确保任何 /admin 子路径都不会暴露真实后台）
- 真入口（迁移原 admin 路由）：
  - `path="/console-center/login"` → 真实 `<Login />`
  - `path="/console-center"` → 真实 `<AdminLayout />`（其下保留原有子路由：dashboard/settings/projects/...）

### 3) 更新真实后台内部跳转与侧边栏链接

**修改文件**
- 修改 `src/components/AdminLayout.tsx`

**调整点**
- 未登录时跳转目标从 `/admin/login` 改为 `/console-center/login`
- `navGroups` 中所有链接路径前缀从 `/admin...` 改为 `/console-center...`
- `isActive()` 中对 settings 与 query 的判断逻辑同步更新为 `/console-center/settings...`

### 4) 更新真实登录页跳转目标

**修改文件**
- 修改 `src/pages/admin/Login.tsx`

**调整点**
- 登录成功后跳转从 `navigate('/admin')` 改为 `navigate('/console-center')`

### 5) 保持机器人入口不变（仍指向 /admin）

**确认文件**
- `src/components/FloatingRobot.tsx` 继续 `navigate('/admin')`，让机器人始终进入假入口

## Edge Cases & Failure Modes

- 直接访问 `/admin/login`、`/admin/settings` 等：因为 `/admin/*` 全部路由到假登录页，都会显示“账号或密码错误”的假入口，不会出现真实后台内容。
- 直接访问 `/console-center`：
  - 未登录：由 `AdminLayout` 跳转到 `/console-center/login`
  - 已登录：正常进入后台
- 注意：该方案属于“入口层面的隐藏/迷惑”，不能替代真正的安全措施。真实安全仍依赖 token 鉴权与后端接口鉴权（当前已存在）。

## Verification Steps

1. 路由与类型检查
   - `pnpm run check`
2. 本地交互验证（dev）
   - 启动：`pnpm run dev`
   - 点击悬浮机器人：应进入 `/admin`，提交任意账号密码都提示“账号或密码错误”，不会发起 `/api/auth/login`。
   - 手动访问真实入口：打开 `/console-center/login`，使用正确账号密码登录后进入 `/console-center` 的后台首页。
   - 未登录访问 `/console-center`：应自动跳转到 `/console-center/login`。

