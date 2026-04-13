import { Navigate, Outlet, Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, Settings, FolderKanban, ListTree, FileText, LogOut, Home, Briefcase } from 'lucide-react'
import { useStore } from '../store'

export default function AdminLayout() {
  const { token, setToken } = useStore()
  const location = useLocation()

  if (!token) {
    return <Navigate to="/admin/login" />
  }

  const navItems = [
    { name: '仪表盘', path: '/admin', icon: LayoutDashboard },
    { name: '基础设置', path: '/admin/settings', icon: Settings },
    { name: '项目管理', path: '/admin/projects', icon: FolderKanban },
    { name: '项目经历', path: '/admin/project-experiences', icon: FolderKanban },
    { name: '工作经历', path: '/admin/work-experiences', icon: Briefcase },
    { name: '栏目管理', path: '/admin/categories', icon: ListTree },
    { name: '内容发布', path: '/admin/posts', icon: FileText },
  ]

  return (
    <div className="flex h-screen bg-zinc-50 dark:bg-zinc-950">
      <aside className="w-64 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-zinc-200 dark:border-zinc-800">
          <h1 className="text-lg font-bold text-zinc-900 dark:text-white">Admin 控制台</h1>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900' 
                    : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'
                }`}
              >
                <item.icon className={`w-5 h-5 mr-3 ${isActive ? '' : 'text-zinc-400'}`} />
                {item.name}
              </Link>
            )
          })}
        </nav>
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
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
            className="flex items-center w-full px-3 py-2.5 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3" />
            退出登录
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto">
        <div className="p-8 max-w-5xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
