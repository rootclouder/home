## Summary

将当前项目内的悬浮小机器人组件（包含：拖拽、眼睛跟随鼠标、皮肤切换、弹窗菜单与动画）抽离为**可复用的开源 GitHub 仓库** `my_robot`，并以 **GitHub dependency** 的方式供其他项目直接安装复用（要求宿主项目使用 TailwindCSS）。

## Current State Analysis

- 机器人组件当前位于 [FloatingRobot.tsx](file:///workspace/src/components/FloatingRobot.tsx)
  - 依赖：React、framer-motion、lucide-react、react-router-dom（用于 navigate）、TailwindCSS className
  - 皮肤数据在组件文件内 `SKINS` 常量中
  - 皮肤存储：`localStorage['robotSkin']`
  - 交互：点击打开菜单，支持“更换皮肤”和“后台管理”
- 机器人被多个页面直接引用：
  - [Home.tsx](file:///workspace/src/pages/Home.tsx)
  - [Projects.tsx](file:///workspace/src/pages/Projects.tsx)
  - [Articles.tsx](file:///workspace/src/pages/Articles.tsx)
- Tailwind 配置：项目存在 [tailwind.config.js](file:///workspace/tailwind.config.js)，组件样式为 Tailwind className（无额外 CSS 依赖）。

## Goals & Success Criteria

**目标**
- 将机器人从当前业务项目中解耦，形成可在其他项目复用的组件库仓库。
- 复用时不内置“后台管理”跳转逻辑，由宿主项目自定义菜单动作。
- 保持当前交互与视觉品质（拖拽、眼睛跟随、皮肤系统、菜单动画），且易配置、易扩展。

**验收标准**
- `my_robot` 仓库可单独 `pnpm install && pnpm build` 通过。
- 其他项目可通过 `pnpm add github:<owner>/my_robot` 安装并使用（前提：宿主项目已配置 TailwindCSS）。
- 组件不依赖 react-router（不再 import/useNavigate）。
- 组件提供清晰的 Props API：actions、自定义 skins、storageKey、默认皮肤、开关眼睛跟随等。
- 文档齐全：README（使用方式/依赖要求/示例代码）、LICENSE(MIT)。

## Assumptions & Decisions (Locked)

- 仓库名：`my_robot`
- License：MIT
- 分发方式：GitHub dependency（不发布 npm）
- 样式方案：要求宿主项目必须使用 TailwindCSS（不提供非 Tailwind 版本）
- “后台管理”动作移除：机器人只提供通用菜单与回调机制

## Proposed Changes

### A) 抽离为独立仓库结构（在当前工程内先整理出可独立迁移的目录）

**新增目录（准备迁移到新仓库）**
- `my_robot/`
  - `package.json`（组件库包元信息，设置 name/version/type/module/exports）
  - `tsconfig.json`（仅用于构建组件库）
  - `src/`
    - `FloatingRobot.tsx`（核心组件）
    - `types.ts`（Skin/Action/Props 类型）
    - `defaultSkins.ts`（内置 8 个皮肤预设）
    - `index.ts`（对外导出）
  - `README.md`
  - `LICENSE`（MIT）

**包结构与构建**
- 使用 `tsc` 产物输出到 `dist/`（ESM），`package.json`：
  - `"type": "module"`
  - `"main" / "module" / "types" / "exports"` 指向 `dist`
  - `"files": ["dist"]`
  - scripts：`build`, `typecheck`
- `peerDependencies`（由宿主提供）：
  - `react`, `react-dom`, `framer-motion`, `lucide-react`
- `dependencies`：尽量保持为空或最小化（组件库自身不绑死宿主依赖版本）。

### B) 组件 API 设计（让“其他项目自定义功能”变成一等公民）

**1) Props：Action（菜单动作）**
- `actions?: Array<{ id: string; label: string; icon?: ReactNode; onClick: () => void; }>`
- 组件只负责渲染动作按钮与交互动画；业务逻辑由宿主传入 `onClick`。
- 默认动作只保留 `更换皮肤`（可通过 `enableSkins` 开关控制是否显示）。

**2) Props：Skins（皮肤）**
- `skins?: Skin[]`：允许宿主完全替换皮肤列表
- `defaultSkinId?: string`
- `storageKey?: string`：默认 `robotSkin`，避免多个项目/多实例冲突
- `onSkinChange?: (skinId: string) => void`：给宿主用于埋点/同步

**3) Props：Eye tracking（眼睛跟随）**
- `enableEyeTracking?: boolean`（默认 true）
- `eyeTrackingMaxOffset?: number`、`eyeTrackingSensitivity?: number`
- 内部继续用 `requestAnimationFrame`，并确保解绑监听与 cancelAnimationFrame。

**4) Props：Position/Drag（拖拽与初始位置）**
- `defaultPosition?: { x: number; y: number }`（默认右下角）
- `boundsPadding?: number`（控制不贴边）
- `enableDrag?: boolean`（默认 true）

**5) 可访问性与交互细节**
- 主按钮、菜单按钮具备 `aria-label` / `title` / `focus-visible` ring
- Esc 关闭菜单（可选）与 click-outside 关闭

### C) 在当前项目中“消费”抽离后的组件（验证可复用性）

**改动点**
- 将现有页面中 `import FloatingRobot from '../components/FloatingRobot'` 替换为从包导入（在本项目内可先用 workspace/file: 引用验证）。
- 提供 actions 示例：例如 `actions=[{ id:'contact', label:'联系我', onClick:... }]`，证明“后台管理”不再是硬编码。

### D) 建立独立 GitHub 仓库并通过 GitHub dependency 复用

**迁移步骤**
- 新建 GitHub 仓库 `my_robot`
- 将 `my_robot/` 目录内容作为仓库根目录提交
- 打 Tag（可选）：`v0.1.0`

**其他项目安装方式（README 提供）**
- `pnpm add github:<owner>/my_robot`
- 宿主项目确保已安装并配置：
  - TailwindCSS + content 包含组件路径
  - `framer-motion`, `lucide-react`

## Edge Cases & Failure Modes

- 宿主未配置 Tailwind content 扫描组件路径：样式可能失效（README 必须写清楚如何配置）。
- 多实例同时存在：`storageKey` 必须可配置，避免互相覆盖皮肤。
- SSR/非浏览器环境：所有 `window/localStorage` 访问需 guarded（`typeof window !== 'undefined'`）。

## Verification Steps

1. 组件库仓库内：
   - `pnpm install`
   - `pnpm run typecheck`
   - `pnpm run build`
2. 当前项目接入验证：
   - 替换 import 后 `pnpm run check`
   - `pnpm run dev`，验证：
     - 拖拽边界正常
     - 眼睛跟随无明显延迟
     - 皮肤切换保存正常（localStorage key 可配置）
     - 自定义 actions 正常触发

