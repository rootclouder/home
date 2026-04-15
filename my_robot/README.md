# my_robot

可复用的悬浮小机器人组件（React + TailwindCSS + Framer Motion），支持拖拽、眼睛跟随鼠标、皮肤切换、弹窗菜单与自定义动作。

## 安装（GitHub 依赖）

```bash
pnpm add github:<owner>/my_robot
```

宿主项目需要安装（或已安装）：

```bash
pnpm add framer-motion lucide-react
```

## Tailwind 配置

确保宿主项目的 `tailwind.config.*` `content` 包含组件路径（示例）：

```js
content: [
  "./index.html",
  "./src/**/*.{js,ts,jsx,tsx}",
  "./node_modules/my_robot/dist/**/*.{js,mjs}"
]
```

## 使用

```tsx
import FloatingRobot from "my_robot"

export default function App() {
  return (
    <>
      <FloatingRobot
        actions={[
          { id: "help", label: "帮助", onClick: () => alert("Hello") },
        ]}
        storageKey="my-project-robot-skin"
      />
    </>
  )
}
```

## API

- `actions?: FloatingRobotAction[]` 自定义菜单动作
- `enableSkins?: boolean` 是否启用换肤
- `skins?: FloatingRobotSkin[]` 自定义皮肤列表
- `defaultSkinId?: string` 默认皮肤
- `storageKey?: string` localStorage 键名
- `enableEyeTracking?: boolean` 是否启用眼睛跟随
- `enableDrag?: boolean` 是否可拖拽

## License

MIT

