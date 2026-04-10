export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">仪表盘</h1>
      </div>
      <div className="bg-white dark:bg-zinc-900 shadow-sm rounded-2xl p-8 border border-zinc-100 dark:border-zinc-800">
        <h2 className="text-xl font-semibold text-zinc-800 dark:text-zinc-200 mb-4">欢迎回来，管理员</h2>
        <p className="text-zinc-600 dark:text-zinc-400">
          通过左侧导航栏，您可以全面定制和管理您的个人主页。
        </p>
        <ul className="mt-6 space-y-4 text-zinc-600 dark:text-zinc-400 list-disc pl-5">
          <li><strong>基础设置</strong>：修改主题色、Hero背景、全站文本信息。</li>
          <li><strong>项目管理</strong>：增删改查您希望在首页展示的项目案例。</li>
          <li><strong>栏目管理</strong>：自由定义首页动态图文栏目的名称。</li>
          <li><strong>内容发布</strong>：在指定栏目下发布并管理富图文内容。</li>
        </ul>
      </div>
    </div>
  )
}
