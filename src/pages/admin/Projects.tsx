import { useEffect, useState } from 'react'
import { useStore } from '../../store'

export default function Projects() {
  const { token } = useStore()
  const [projects, setProjects] = useState<any[]>([])
  const [editing, setEditing] = useState<any>(null)
  
  const fetchProjects = () => fetch('/api/projects').then(r => r.json()).then(setProjects)
  
  useEffect(() => { fetchProjects() }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    const method = editing.id ? 'PUT' : 'POST'
    const url = editing.id ? `/api/projects/${editing.id}` : '/api/projects'
    
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(editing)
    })
    setEditing(null)
    fetchProjects()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('确认删除？')) return
    await fetch(`/api/projects/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
    fetchProjects()
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">项目管理</h1>
        <button onClick={() => setEditing({ title: '', description: '', projectUrl: '', isVisible: true })} className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-4 py-2 rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors">
          添加项目
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map(p => (
          <div key={p.id} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm flex flex-col">
            {p.coverUrl ? <img src={p.coverUrl} className="h-40 w-full object-cover" /> : <div className="h-40 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400">无封面</div>}
            <div className="p-5 flex-1 flex flex-col">
              <h3 className="font-semibold text-lg text-zinc-900 dark:text-white mb-1">{p.title}</h3>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm line-clamp-2 mb-4 flex-1">{p.description}</p>
              <div className="flex space-x-2 mt-auto pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <button onClick={() => setEditing(p)} className="text-blue-600 hover:text-blue-800 text-sm font-medium px-2 py-1 bg-blue-50 hover:bg-blue-100 rounded">编辑</button>
                <button onClick={() => handleDelete(p.id)} className="text-red-600 hover:text-red-800 text-sm font-medium px-2 py-1 bg-red-50 hover:bg-red-100 rounded">删除</button>
                <a href={p.projectUrl} target="_blank" className="text-zinc-600 hover:text-zinc-800 text-sm font-medium px-2 py-1 bg-zinc-50 hover:bg-zinc-100 rounded ml-auto">访问</a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form onSubmit={handleSave} className="bg-white dark:bg-zinc-900 p-8 rounded-2xl w-full max-w-lg shadow-2xl">
            <h2 className="text-xl font-bold mb-6 text-zinc-900 dark:text-white">{editing.id ? '编辑项目' : '添加项目'}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">标题</label>
                <input required type="text" value={editing.title} onChange={e => setEditing({...editing, title: e.target.value})} className="mt-1 block w-full rounded-2xl border border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 p-2.5 outline-none focus:ring-2 focus:ring-zinc-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">描述</label>
                <textarea value={editing.description} onChange={e => setEditing({...editing, description: e.target.value})} className="mt-1 block w-full rounded-2xl border border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 p-2.5 h-24 outline-none focus:ring-2 focus:ring-zinc-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">链接地址</label>
                <input required type="url" value={editing.projectUrl} onChange={e => setEditing({...editing, projectUrl: e.target.value})} className="mt-1 block w-full rounded-2xl border border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 p-2.5 outline-none focus:ring-2 focus:ring-zinc-500" />
              </div>
            </div>
            <div className="mt-8 flex justify-end space-x-3">
              <button type="button" onClick={() => setEditing(null)} className="px-5 py-2.5 text-zinc-600 hover:bg-zinc-100 rounded-2xl transition-colors font-medium">取消</button>
              <button type="submit" className="px-5 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-2xl transition-colors font-medium">保存</button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
