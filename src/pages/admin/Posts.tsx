import { useEffect, useState } from 'react'
import MDEditor from '@uiw/react-md-editor'
import { useStore } from '../../store'

export default function Posts() {
  const { token, profileKey } = useStore()
  const [posts, setPosts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [editing, setEditing] = useState<any>(null)
  
  const qp = `?profileKey=${encodeURIComponent(profileKey)}`
  const fetchPosts = () => fetch(`/api/posts${qp}`).then(r => r.json()).then(setPosts)
  const fetchCategories = () => fetch(`/api/categories${qp}`).then(r => r.json()).then(setCategories)
  
  useEffect(() => { fetchPosts(); fetchCategories() }, [profileKey])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    const method = editing.id ? 'PUT' : 'POST'
    const url = editing.id ? `/api/posts/${editing.id}${qp}` : `/api/posts${qp}`
    
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(editing)
    })
    setEditing(null)
    fetchPosts()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('确认删除？')) return
    await fetch(`/api/posts/${id}${qp}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
    fetchPosts()
  }

  const handleImageUpload = async (file: File) => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      })
      if (!res.ok) throw new Error('Upload failed')
      const data = await res.json()
      return data.url
    } catch (e) {
      console.error('Image upload error:', e)
      alert('图片上传失败，请检查文件类型或大小')
      return null
    }
  }

  const onDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    
    // Fallback for different browsers dataTransfer APIs
    let file = null
    if (e.dataTransfer.items) {
      for (let i = 0; i < e.dataTransfer.items.length; i++) {
        if (e.dataTransfer.items[i].kind === 'file') {
          file = e.dataTransfer.items[i].getAsFile()
          break
        }
      }
    } else if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      file = e.dataTransfer.files[0]
    }

    if (file && file.type.startsWith('image/')) {
      const url = await handleImageUpload(file)
      if (url) {
        const markdownImage = `\n![${file.name}](${url})\n`
        setEditing({ ...editing, content: editing.content + markdownImage })
      }
    }
  }

  const buildTree = (cats: any[]) => {
    const tree: any[] = []
    const map: any = {}
    cats.forEach(c => map[c.id] = { ...c, children: [] })
    cats.forEach(c => {
      if (c.parentId && map[c.parentId]) {
        map[c.parentId].children.push(map[c.id])
      } else {
        tree.push(map[c.id])
      }
    })
    return tree
  }

  const flattenTree = (tree: any[], level = 1): any[] => {
    let result: any[] = []
    tree.forEach(node => {
      result.push({ ...node, level })
      if (node.children && node.children.length > 0) {
        result = result.concat(flattenTree(node.children, level + 1))
      }
    })
    return result
  }

  const treeCategories = flattenTree(buildTree(categories))

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">图文发布</h1>
        <button onClick={() => setEditing({ title: '', content: '', summary: '', thumbnailUrl: '', externalUrl: '', categoryId: categories[0]?.id || '', isFeatured: false })} className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-4 py-2 rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors">
          发布图文
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {posts.map(p => (
          <div key={p.id} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between">
            <div className="mb-4 md:mb-0">
              <div className="flex items-center space-x-2 mb-2">
                <span className="inline-block px-2.5 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 text-xs rounded-md font-medium">{p.category?.name || '无分类'}</span>
                {p.isFeatured && <span className="inline-block px-2.5 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500 text-xs rounded-md font-medium">精选</span>}
              </div>
              <h3 className="font-bold text-xl text-zinc-900 dark:text-white mb-2">{p.title}</h3>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm line-clamp-2 max-w-2xl">{p.summary || p.content}</p>
            </div>
            <div className="flex space-x-2 shrink-0">
              <button onClick={() => setEditing(p)} className="text-blue-600 hover:text-blue-800 text-sm font-medium px-4 py-2 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">编辑</button>
              <button onClick={() => handleDelete(p.id)} className="text-red-600 hover:text-red-800 text-sm font-medium px-4 py-2 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">删除</button>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form onSubmit={handleSave} className="bg-white dark:bg-zinc-900 p-8 rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6 text-zinc-900 dark:text-white">{editing.id ? '编辑图文' : '发布图文'}</h2>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">所属栏目</label>
                <select required value={editing.categoryId} onChange={e => setEditing({...editing, categoryId: e.target.value})} className="block w-full rounded-2xl border border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 p-2.5 text-zinc-900 dark:text-white focus:ring-2 focus:ring-zinc-500 outline-none">
                  {treeCategories.map(c => (
                    <option key={c.id} value={c.id}>
                      {'\u00A0'.repeat((c.level - 1) * 4)}{c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">标题</label>
                <input required type="text" value={editing.title} onChange={e => setEditing({...editing, title: e.target.value})} className="block w-full rounded-2xl border border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 p-2.5 text-zinc-900 dark:text-white focus:ring-2 focus:ring-zinc-500 outline-none" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">缩略图 URL (可选)</label>
                  <div className="flex items-center space-x-2">
                    <input type="text" value={editing.thumbnailUrl || ''} onChange={e => setEditing({...editing, thumbnailUrl: e.target.value})} className="block w-full rounded-2xl border border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 p-2.5 text-zinc-900 dark:text-white focus:ring-2 focus:ring-zinc-500 outline-none" />
                    <label className="shrink-0 cursor-pointer bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-2xl px-4 py-2.5 text-sm font-medium hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
                      上传
                      <input type="file" className="hidden" onChange={async (e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          const url = await handleImageUpload(file)
                          if (url) setEditing({...editing, thumbnailUrl: url})
                        }
                      }} />
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">跳转外部链接 (可选)</label>
                  <input type="url" placeholder="如填写，点击文章将直接跳转此链接" value={editing.externalUrl || ''} onChange={e => setEditing({...editing, externalUrl: e.target.value})} className="block w-full rounded-2xl border border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 p-2.5 text-zinc-900 dark:text-white focus:ring-2 focus:ring-zinc-500 outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1 flex items-center justify-between">
                  <span>文章概要</span>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" checked={editing.isFeatured || false} onChange={e => setEditing({...editing, isFeatured: e.target.checked})} className="w-4 h-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900" />
                    <span className="text-xs text-zinc-600 dark:text-zinc-400">设为精选</span>
                  </label>
                </label>
                <input type="text" required value={editing.summary || ''} onChange={e => setEditing({...editing, summary: e.target.value})} className="block w-full rounded-2xl border border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 p-2.5 text-zinc-900 dark:text-white focus:ring-2 focus:ring-zinc-500 outline-none" />
              </div>
              <div onDrop={onDrop} onDragOver={e => e.preventDefault()} onDragEnter={e => e.preventDefault()} onDragLeave={e => e.preventDefault()}>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1 flex justify-between">
                  <span>正文内容 (Markdown)</span>
                  <span className="text-xs text-zinc-500 font-normal">支持拖拽图片上传</span>
                </label>
                <div data-color-mode="light" className="dark:hidden">
                  <MDEditor
                    value={editing.content}
                    onChange={(val) => setEditing({...editing, content: val || ''})}
                    height={400}
                    className="border border-zinc-300 rounded-2xl overflow-hidden shadow-none"
                  />
                </div>
                <div data-color-mode="dark" className="hidden dark:block">
                  <MDEditor
                    value={editing.content}
                    onChange={(val) => setEditing({...editing, content: val || ''})}
                    height={400}
                    className="border border-zinc-700 rounded-2xl overflow-hidden shadow-none"
                  />
                </div>
              </div>
            </div>
            <div className="mt-8 flex justify-end space-x-3 pt-6 border-t border-zinc-100 dark:border-zinc-800">
              <button type="button" onClick={() => setEditing(null)} className="px-5 py-2.5 text-zinc-600 font-medium hover:bg-zinc-100 rounded-2xl transition-colors">取消</button>
              <button type="submit" className="px-5 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-medium rounded-2xl hover:bg-zinc-800 transition-colors">保存发布</button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
