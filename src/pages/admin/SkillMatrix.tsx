import { useEffect, useMemo, useState } from 'react'
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown, Eye, EyeOff, Save } from 'lucide-react'
import { useStore } from '../../store'

export default function SkillMatrix() {
  const { token, profileKey } = useStore()
  const qp = `?profileKey=${encodeURIComponent(profileKey)}`
  const [settings, setSettings] = useState<any>(null)
  const [items, setItems] = useState<any[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [currentItem, setCurrentItem] = useState<any>(null)
  const [savingTitle, setSavingTitle] = useState(false)

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
  }, [items])

  useEffect(() => {
    Promise.all([
      fetch(`/api/settings${qp}`).then(r => r.ok ? r.json() : null),
      fetch(`/api/skill-matrix${qp}`).then(r => r.ok ? r.json() : []),
    ]).then(([s, list]) => {
      setSettings(s)
      setItems(list || [])
    })
  }, [profileKey])

  const fetchItems = async () => {
    const res = await fetch(`/api/skill-matrix${qp}`)
    if (!res.ok) return
    setItems(await res.json())
  }

  const handleSaveTitle = async () => {
    if (!settings?.id) return
    setSavingTitle(true)
    await fetch(`/api/settings${qp}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(settings),
    })
    setSavingTitle(false)
  }

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault()
    const method = currentItem.id ? 'PUT' : 'POST'
    const url = currentItem.id ? `/api/skill-matrix/${currentItem.id}${qp}` : `/api/skill-matrix${qp}`

    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(currentItem),
    })

    setIsEditing(false)
    setCurrentItem(null)
    fetchItems()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个技能卡片吗？')) return
    await fetch(`/api/skill-matrix/${id}${qp}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
    fetchItems()
  }

  const handleToggleVisible = async (item: any) => {
    await fetch(`/api/skill-matrix/${item.id}${qp}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ isVisible: !item.isVisible }),
    })
    fetchItems()
  }

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return
    if (direction === 'down' && index === sortedItems.length - 1) return

    const newItems = [...sortedItems]
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    const temp = newItems[index]
    newItems[index] = newItems[targetIndex]
    newItems[targetIndex] = temp

    await Promise.all(newItems.map((it, i) =>
      fetch(`/api/skill-matrix/${it.id}${qp}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ sortOrder: i }),
      })
    ))

    fetchItems()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">技能矩阵管理</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">用于首页 Hero 下方的技能矩阵展示区</p>
        </div>
        <button
          onClick={() => {
            setCurrentItem({ title: '', content: '', isVisible: true, sortOrder: sortedItems.length })
            setIsEditing(true)
          }}
          className="flex items-center justify-center px-4 py-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          添加技能卡片
        </button>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="text-sm font-medium text-zinc-700 dark:text-zinc-300">技能矩阵标题</div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">前台会用像素字体展示</div>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={settings?.skillsMatrixTitle || ''}
              onChange={(e) => setSettings((prev: any) => ({ ...prev, skillsMatrixTitle: e.target.value }))}
              className="w-full sm:w-80 rounded-2xl border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 shadow-sm focus:border-zinc-500 focus:ring-zinc-500 p-2.5 border outline-none transition-shadow"
              placeholder="例如: 技能矩阵 / Skill Matrix"
            />
            <button
              type="button"
              onClick={handleSaveTitle}
              disabled={savingTitle || !settings}
              className="inline-flex items-center px-4 py-2 rounded-2xl bg-zinc-900 text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200 transition-colors"
            >
              <Save className="w-4 h-4 mr-2" />
              保存
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800">
            <tr>
              <th className="px-6 py-4 text-sm font-medium text-zinc-500 dark:text-zinc-400">标题</th>
              <th className="px-6 py-4 text-sm font-medium text-zinc-500 dark:text-zinc-400">显示</th>
              <th className="px-6 py-4 text-sm font-medium text-zinc-500 dark:text-zinc-400">排序</th>
              <th className="px-6 py-4 text-sm font-medium text-zinc-500 dark:text-zinc-400 text-right">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {sortedItems.map((it, index) => (
              <tr key={it.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                <td className="px-6 py-4 text-zinc-900 dark:text-zinc-100 font-medium">{it.title}</td>
                <td className="px-6 py-4">
                  <button
                    type="button"
                    onClick={() => handleToggleVisible(it)}
                    className="inline-flex items-center px-3 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-800 text-sm text-zinc-600 dark:text-zinc-300 hover:border-[var(--primary)]/40 hover:text-[var(--primary)] transition-colors"
                  >
                    {it.isVisible ? <Eye className="w-4 h-4 mr-2" /> : <EyeOff className="w-4 h-4 mr-2" />}
                    {it.isVisible ? '显示中' : '已隐藏'}
                  </button>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleMove(index, 'up')}
                      disabled={index === 0}
                      className="p-1 text-zinc-400 hover:text-zinc-900 disabled:opacity-30 disabled:cursor-not-allowed dark:hover:text-white"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleMove(index, 'down')}
                      disabled={index === sortedItems.length - 1}
                      className="p-1 text-zinc-400 hover:text-zinc-900 disabled:opacity-30 disabled:cursor-not-allowed dark:hover:text-white"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => {
                      setCurrentItem(it)
                      setIsEditing(true)
                    }}
                    className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(it.id)}
                    className="p-2 text-zinc-400 hover:text-red-600 transition-colors ml-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {sortedItems.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-zinc-500">
                  暂无技能卡片，请点击右上角添加
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isEditing && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl max-w-2xl w-full p-6 animate-in zoom-in-95 duration-200">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-6">
              {currentItem.id ? '编辑技能卡片' : '添加技能卡片'}
            </h2>
            <form onSubmit={handleSaveItem} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">标题</label>
                  <input
                    type="text"
                    required
                    value={currentItem.title}
                    onChange={(e) => setCurrentItem({ ...currentItem, title: e.target.value })}
                    className="w-full rounded-lg border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 shadow-sm focus:border-zinc-500 focus:ring-zinc-500 p-2.5 border"
                    placeholder="例如: React / Node.js / UI Design"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">内容（支持多行）</label>
                  <textarea
                    required
                    rows={6}
                    value={currentItem.content}
                    onChange={(e) => setCurrentItem({ ...currentItem, content: e.target.value })}
                    className="w-full rounded-lg border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 shadow-sm focus:border-zinc-500 focus:ring-zinc-500 p-2.5 border resize-none"
                    placeholder="用要点描述熟练度、项目经验、工具链等..."
                  />
                </div>
                <div className="sm:col-span-2 flex items-center justify-between rounded-xl border border-zinc-200 dark:border-zinc-800 px-4 py-3">
                  <div>
                    <div className="text-sm font-medium text-zinc-900 dark:text-white">前台显示</div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">关闭后仍保留数据，但前台不展示</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurrentItem({ ...currentItem, isVisible: !currentItem.isVisible })}
                    className={`inline-flex items-center px-3 py-1.5 rounded-full border transition-colors ${
                      currentItem.isVisible
                        ? 'border-[var(--primary)]/30 text-[var(--primary)] bg-[var(--primary)]/10'
                        : 'border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400'
                    }`}
                  >
                    {currentItem.isVisible ? <Eye className="w-4 h-4 mr-2" /> : <EyeOff className="w-4 h-4 mr-2" />}
                    {currentItem.isVisible ? '显示' : '隐藏'}
                  </button>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-8">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200 rounded-lg transition-colors"
                >
                  保存
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
