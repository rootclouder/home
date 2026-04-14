import { useState, useEffect } from 'react'
import { Navigate, Outlet, Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, Settings, FolderKanban, ListTree, FileText, LogOut, Home, Briefcase, LayoutGrid, Image as ImageIcon, Menu, X } from 'lucide-react'
import { useStore } from '../store'

export default function AdminLayout() {
  const { token, setToken } = useStore()
  const location = useLocation()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  // 路由变化时，如果在移动端则自动收起侧边栏
  useEffect(() => {
    setIsSidebarOpen(false)
  }, [location.pathname, location.search])

  if (!token) {
    return <Navigate to="/console-center/login" />
  }

  const navGroups = [
    {
      title: '',
      items: [
        { name: '仪表盘', path: '/console-center', icon: LayoutDashboard },
      ]
    },
    {
      title: '首页',
      items: [
        { name: '基础设置', path: '/console-center/settings', icon: Settings },
        { name: '页面设置', path: '/console-center/settings?tab=home-page', icon: ImageIcon },
        { name: '技能矩阵', path: '/console-center/skill-matrix', icon: LayoutGrid },
        { name: '工作经历', path: '/console-center/work-experiences', icon: Briefcase },
        { name: '项目经历', path: '/console-center/project-experiences', icon: FolderKanban },
      ]
    },
    {
      title: '作品集',
      items: [
        { name: '页面设置', path: '/console-center/settings?tab=portfolio-page', icon: ImageIcon },
        { name: '作品管理', path: '/console-center/projects', icon: FolderKanban },
      ]
    },
    {
      title: '博客',
      items: [
        { name: '页面设置', path: '/console-center/settings?tab=blog-page', icon: ImageIcon },
        { name: '栏目管理', path: '/console-center/categories', icon: ListTree },
        { name: '内容发布', path: '/console-center/posts', icon: FileText },
      ]
    }
  ]

  const isActive = (itemPath: string) => {
    if (itemPath === '/console-center') return location.pathname === '/console-center'
    if (itemPath === '/console-center/settings') {
      return location.pathname === '/console-center/settings' && (!location.search || location.search === '?tab=basic')
    }
    return location.pathname + location.search === itemPath
  }

  return (
    <div className="flex h-[100dvh] bg-zinc-50 dark:bg-zinc-950 overflow-hidden">
      
      {/* 移动端遮罩层 */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* 侧边栏 */}
      <aside 
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 flex flex-col transform transition-transform duration-300 ease-in-out lg:transform-none ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
          <h1 className="text-lg font-bold text-zinc-900 dark:text-white">Admin 控制台</h1>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="p-1 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 lg:hidden transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto custom-scrollbar">
          {navGroups.map((group, idx) => (
            <div key={idx} className={idx > 0 ? "mt-8" : ""}>
              {group.title && (
                <div className="px-3 mb-3 text-xs font-bold text-zinc-400 uppercase tracking-wider">
                  {group.title}
                </div>
              )}
              <div className="space-y-1">
                {group.items.map((item) => {
                  const active = isActive(item.path)
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                        active 
                          ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-sm' 
                          : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'
                      }`}
                    >
                      <item.icon className={`w-5 h-5 mr-3 ${active ? '' : 'text-zinc-400'}`} />
                      {item.name}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 space-y-2 shrink-0">
          <Link
            to="/"
            target="_blank"
            className="flex items-center w-full px-3 py-2.5 text-sm font-medium text-zinc-600 dark:text-zinc-400 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <Home className="w-5 h-5 mr-3" />
            查看前台主页
          </Link>
          <button 
            onClick={() => setToken(null)}
            className="flex items-center w-full px-3 py-2.5 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3" />
            退出登录
          </button>
        </div>
      </aside>

      {/* 主内容区 */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* 移动端顶部导航栏（汉堡菜单） */}
        <div className="lg:hidden h-14 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 flex items-center px-4 shrink-0 sticky top-0 z-30">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 -ml-2 rounded-md text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
          <span className="ml-2 font-semibold text-zinc-900 dark:text-white">Admin 控制台</span>
        </div>

        {/* 内容滚动区 */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
          <div className="max-w-5xl mx-auto pb-10">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  )
}
