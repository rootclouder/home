import { useEffect, useState } from 'react'
import { useStore } from '../../store'
import { useNavigate } from 'react-router-dom'
import { resolveMediaUrl } from '../../lib/utils'

export default function Projects() {
  const navigate = useNavigate()
  const { token, setToken, profileKey } = useStore()
  const [projects, setProjects] = useState<any[]>([])
  const [editing, setEditing] = useState<any>(null)
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({})
  
  const qp = `?profileKey=${encodeURIComponent(profileKey)}`
  const fetchProjects = () => fetch(`/api/projects${qp}`).then(r => r.json()).then(setProjects)
  
  useEffect(() => { fetchProjects() }, [profileKey])

  const handleAuthFailure = async (res: Response) => {
    if (res.status !== 401) return
    const data = await res.json().catch(() => null)
    if (data?.error === 'Invalid token' || data?.error === 'Missing token') {
      setToken(null)
      alert('登录已失效，请重新登录')
      navigate('/console-center/login')
      throw new Error('Unauthorized')
    }
  }

  const projectPayload = (p: any) => ({
    title: p.title,
    description: p.description || null,
    coverUrl: p.coverUrl || null,
    thumbnailUrl: p.thumbnailUrl || null,
    projectUrl: p.projectUrl,
    sortOrder: typeof p.sortOrder === 'number' ? p.sortOrder : typeof p.order === 'number' ? p.order : 0,
    isVisible: p.isVisible !== false,
  })

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) {
      setToken(null)
      navigate('/console-center/login')
      return
    }
    const method = editing.id ? 'PUT' : 'POST'
    const url = editing.id ? `/api/projects/${editing.id}${qp}` : `/api/projects${qp}`
    
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(projectPayload(editing))
    })
    await handleAuthFailure(res)
    if (!res.ok) {
      const data = await res.json().catch(() => null)
      alert(data?.error || '保存失败')
      return
    }
    setEditing(null)
    fetchProjects()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('确认删除？')) return
    if (!token) {
      setToken(null)
      navigate('/console-center/login')
      return
    }
    const res = await fetch(`/api/projects/${id}${qp}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
    await handleAuthFailure(res)
    if (!res.ok) {
      const data = await res.json().catch(() => null)
      alert(data?.error || '删除失败')
      return
    }
    fetchProjects()
  }

  const handleQuickToggle = async (p: any) => {
    if (!token) {
      setToken(null)
      navigate('/console-center/login')
      return
    }
    const nextIsVisible = !p.isVisible
    setProjects(prev => prev.map(item => item.id === p.id ? { ...item, isVisible: nextIsVisible } : item))
    const res = await fetch(`/api/projects/${p.id}${qp}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ ...projectPayload(p), isVisible: nextIsVisible })
    })
    await handleAuthFailure(res)
    if (!res.ok) {
      setProjects(prev => prev.map(item => item.id === p.id ? { ...item, isVisible: p.isVisible } : item))
      const data = await res.json().catch(() => null)
      alert(data?.error || '保存失败')
      return
    }
    const updated = await res.json().catch(() => null)
    if (updated?.id) {
      setProjects(prev => prev.map(item => item.id === updated.id ? updated : item))
    } else {
      fetchProjects()
    }
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    if (!e.target.files?.[0]) return
    if (!token) {
      setToken(null)
      navigate('/console-center/login')
      return
    }
    const file = e.target.files[0]
    
    if (file.size > 10 * 1024 * 1024) {
      alert('图片不能超过10MB')
      return
    }

    const formData = new FormData()
    formData.append('file', file)
    
    setUploadProgress(prev => ({ ...prev, [field]: 0 }))

    try {
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const current = prev[field] || 0
          if (current >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return { ...prev, [field]: current + 10 }
        })
      }, 200)

      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      })
      await handleAuthFailure(res)
      
      clearInterval(progressInterval)
      setUploadProgress(prev => ({ ...prev, [field]: 100 }))

      if (!res.ok) throw new Error('Upload failed')

      const data = await res.json()
      if (data.url) {
        setEditing({ ...editing, [field]: data.url })
      }
      
      setTimeout(() => {
        setUploadProgress(prev => {
          const next = { ...prev }
          delete next[field]
          return next
        })
      }, 1000)
    } catch (err) {
      console.error('Upload error', err)
      alert('上传失败')
      setUploadProgress(prev => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">项目管理</h1>
        <button onClick={() => setEditing({ title: '', description: '', projectUrl: '', thumbnailUrl: '', coverUrl: '', sortOrder: 0, isVisible: true })} className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-4 py-2 rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors">
          添加项目
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map(p => (
          <div key={p.id} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm flex flex-col">
            {p.thumbnailUrl || p.coverUrl ? <img src={resolveMediaUrl(p.thumbnailUrl || p.coverUrl)} alt={p.title} className="h-40 w-full object-cover" /> : <div className="h-40 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400">无图片</div>}
            <div className="p-5 flex-1 flex flex-col relative">
              <div className="absolute top-4 right-4 flex items-center gap-2">
                <span className={`text-xs font-semibold ${p.isVisible ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-500 dark:text-zinc-400'}`}>
                  {p.isVisible ? '公开' : '隐藏'}
                </span>
                <button
                  type="button"
                  onClick={() => handleQuickToggle(p)}
                  className={`relative inline-flex h-5 w-10 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 ${p.isVisible ? 'bg-[var(--primary)]' : 'bg-zinc-200 dark:bg-zinc-700'}`}
                  role="switch"
                  aria-label={`切换作品可见性：${p.title}`}
                  aria-checked={p.isVisible !== false}
                >
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${p.isVisible ? 'translate-x-5' : 'translate-x-0'}`}
                  />
                </button>
              </div>
              <h3 className="font-semibold text-lg text-zinc-900 dark:text-white mb-1 pr-16">{p.title}</h3>
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
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">封面大图</label>
                <div className="flex items-center space-x-4">
                  <div className="h-16 w-24 rounded-lg bg-zinc-100 dark:bg-zinc-800 overflow-hidden border border-zinc-200 dark:border-zinc-700 flex-shrink-0">
                    {editing.coverUrl ? <img src={resolveMediaUrl(editing.coverUrl)} alt="Cover" className="h-full w-full object-cover" /> : <span className="h-full w-full flex items-center justify-center text-zinc-400 text-xs">无</span>}
                  </div>
                  <div className="flex-1">
                    <input type="file" accept="image/*" onChange={e => handleUpload(e, 'coverUrl')} className="block w-full text-sm text-zinc-500 dark:text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-zinc-50 file:text-zinc-700 hover:file:bg-zinc-100 dark:file:bg-zinc-800 dark:file:text-zinc-300 dark:hover:file:bg-zinc-700 transition-colors" />
                    {uploadProgress['coverUrl'] !== undefined && (
                      <div className="mt-2 w-full bg-zinc-200 rounded-full h-1.5 dark:bg-zinc-700">
                        <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${uploadProgress['coverUrl']}%` }}></div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">缩略图 (用于列表展示)</label>
                <div className="flex items-center space-x-4">
                  <div className="h-16 w-16 rounded-lg bg-zinc-100 dark:bg-zinc-800 overflow-hidden border border-zinc-200 dark:border-zinc-700 flex-shrink-0">
                    {editing.thumbnailUrl ? <img src={resolveMediaUrl(editing.thumbnailUrl)} alt="Thumbnail" className="h-full w-full object-cover" /> : <span className="h-full w-full flex items-center justify-center text-zinc-400 text-xs">无</span>}
                  </div>
                  <div className="flex-1">
                    <input type="file" accept="image/*" onChange={e => handleUpload(e, 'thumbnailUrl')} className="block w-full text-sm text-zinc-500 dark:text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-zinc-50 file:text-zinc-700 hover:file:bg-zinc-100 dark:file:bg-zinc-800 dark:file:text-zinc-300 dark:hover:file:bg-zinc-700 transition-colors" />
                    {uploadProgress['thumbnailUrl'] !== undefined && (
                      <div className="mt-2 w-full bg-zinc-200 rounded-full h-1.5 dark:bg-zinc-700">
                        <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${uploadProgress['thumbnailUrl']}%` }}></div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditing({ ...editing, isVisible: !editing.isVisible })}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 ${editing.isVisible ? 'bg-[var(--primary)]' : 'bg-zinc-200 dark:bg-zinc-700'}`}
                  role="switch"
                  aria-checked={editing.isVisible}
                >
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${editing.isVisible ? 'translate-x-5' : 'translate-x-0'}`}
                  />
                </button>
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  {editing.isVisible ? '公开展示此作品' : '已隐藏（前台不可见）'}
                </span>
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
