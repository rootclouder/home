import { useEffect, useState } from 'react'
import MDEditor from '@uiw/react-md-editor'
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2 } from 'lucide-react'
import { useStore } from '../../store'

export default function ProjectExperiences() {
  const { token, profileKey } = useStore()
  const qp = `?profileKey=${encodeURIComponent(profileKey)}`
  const [experiences, setExperiences] = useState<any[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [current, setCurrent] = useState<any>(null)

  const fetchExperiences = async () => {
    const res = await fetch(`/api/project-experiences${qp}`)
    if (res.ok) setExperiences(await res.json())
  }

  useEffect(() => {
    fetchExperiences()
  }, [profileKey])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    const method = current.id ? 'PUT' : 'POST'
    const url = current.id ? `/api/project-experiences/${current.id}${qp}` : `/api/project-experiences${qp}`

    await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(current),
    })

    setIsEditing(false)
    setCurrent(null)
    fetchExperiences()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这条项目经历吗？')) return
    await fetch(`/api/project-experiences/${id}${qp}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
    fetchExperiences()
  }

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return
    if (direction === 'down' && index === experiences.length - 1) return

    const next = [...experiences]
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    const tmp = next[index]
    next[index] = next[targetIndex]
    next[targetIndex] = tmp

    await Promise.all(
      next.map((exp, i) =>
        fetch(`/api/project-experiences/${exp.id}${qp}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ sortOrder: i }),
        }),
      ),
    )

    fetchExperiences()
  }

  const handleToggleVisible = async (exp: any) => {
    // 乐观更新
    setExperiences(experiences.map(e => e.id === exp.id ? { ...e, isVisible: !e.isVisible } : e))
    try {
      const res = await fetch(`/api/project-experiences/${exp.id}${qp}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isVisible: !exp.isVisible }),
      })
      if (!res.ok) throw new Error('Failed to toggle')
    } catch (e) {
      console.error(e)
      // 恢复状态
      fetchExperiences()
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">项目经历管理</h1>
        <button
          onClick={() => {
            setCurrent({
              projectName: '',
              role: '',
              startDate: '',
              endDate: '',
              content: '',
              sortOrder: experiences.length,
              isVisible: true,
            })
            setIsEditing(true)
          }}
          className="flex items-center px-4 py-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          添加项目经历
        </button>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800">
            <tr>
              <th className="px-6 py-4 text-sm font-medium text-zinc-500 dark:text-zinc-400">项目名称</th>
              <th className="px-6 py-4 text-sm font-medium text-zinc-500 dark:text-zinc-400">角色 / 职责</th>
              <th className="px-6 py-4 text-sm font-medium text-zinc-500 dark:text-zinc-400">时间</th>
              <th className="px-6 py-4 text-sm font-medium text-zinc-500 dark:text-zinc-400">排序</th>
              <th className="px-6 py-4 text-sm font-medium text-zinc-500 dark:text-zinc-400">前台显示</th>
              <th className="px-6 py-4 text-sm font-medium text-zinc-500 dark:text-zinc-400 text-right">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {experiences.map((exp, index) => (
              <tr key={exp.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                <td className="px-6 py-4 text-zinc-900 dark:text-zinc-100 font-medium">
                  {exp.projectName}
                  {exp.isVisible === false && <span className="ml-2 text-xs font-normal text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">已隐藏</span>}
                </td>
                <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400">{exp.role}</td>
                <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400">{exp.startDate} - {exp.endDate}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleMove(index, 'up')}
                      disabled={index === 0}
                      className="p-1 text-zinc-400 hover:text-zinc-900 disabled:opacity-30 disabled:cursor-not-allowed dark:hover:text-white"
                      aria-label="上移"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleMove(index, 'down')}
                      disabled={index === experiences.length - 1}
                      className="p-1 text-zinc-400 hover:text-zinc-900 disabled:opacity-30 disabled:cursor-not-allowed dark:hover:text-white"
                      aria-label="下移"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <button
                    type="button"
                    onClick={() => handleToggleVisible(exp)}
                    className={`relative inline-flex h-5 w-10 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 ${exp.isVisible !== false ? 'bg-[var(--primary)]' : 'bg-zinc-200 dark:bg-zinc-700'}`}
                    role="switch"
                    aria-checked={exp.isVisible !== false}
                  >
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${exp.isVisible !== false ? 'translate-x-5' : 'translate-x-0'}`}
                    />
                  </button>
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => {
                      setCurrent(exp)
                      setIsEditing(true)
                    }}
                    className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
                    aria-label="编辑"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(exp.id)}
                    className="p-2 text-zinc-400 hover:text-red-600 transition-colors ml-2"
                    aria-label="删除"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {experiences.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                  暂无项目经历，请点击右上角添加
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isEditing && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl max-w-4xl w-full p-6 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-6">
              {current.id ? '编辑项目经历' : '添加项目经历'}
            </h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">项目名称</label>
                  <input
                    type="text"
                    required
                    name="projectName"
                    autoComplete="off"
                    value={current.projectName}
                    onChange={e => setCurrent({ ...current, projectName: e.target.value })}
                    className="w-full rounded-lg border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 shadow-sm focus:border-zinc-500 focus:ring-zinc-500 p-2.5 border"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">角色 / 职责</label>
                  <input
                    type="text"
                    required
                    name="role"
                    autoComplete="off"
                    value={current.role}
                    onChange={e => setCurrent({ ...current, role: e.target.value })}
                    className="w-full rounded-lg border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 shadow-sm focus:border-zinc-500 focus:ring-zinc-500 p-2.5 border"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">开始时间</label>
                  <input
                    type="text"
                    required
                    name="startDate"
                    autoComplete="off"
                    value={current.startDate}
                    onChange={e => setCurrent({ ...current, startDate: e.target.value })}
                    className="w-full rounded-lg border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 shadow-sm focus:border-zinc-500 focus:ring-zinc-500 p-2.5 border"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">结束时间</label>
                  <input
                    type="text"
                    required
                    name="endDate"
                    autoComplete="off"
                    value={current.endDate}
                    onChange={e => setCurrent({ ...current, endDate: e.target.value })}
                    className="w-full rounded-lg border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 shadow-sm focus:border-zinc-500 focus:ring-zinc-500 p-2.5 border"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">项目详情 (Markdown)</label>
                <div data-color-mode="light" className="dark:hidden">
                  <MDEditor
                    value={current.content}
                    onChange={(val) => setCurrent({ ...current, content: val || '' })}
                    height={360}
                    className="border border-zinc-300 rounded-2xl overflow-hidden shadow-none"
                  />
                </div>
                <div data-color-mode="dark" className="hidden dark:block">
                  <MDEditor
                    value={current.content}
                    onChange={(val) => setCurrent({ ...current, content: val || '' })}
                    height={360}
                    className="border border-zinc-700 rounded-2xl overflow-hidden shadow-none"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCurrent({ ...current, isVisible: !current.isVisible })}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 ${current.isVisible !== false ? 'bg-[var(--primary)]' : 'bg-zinc-200 dark:bg-zinc-700'}`}
                  role="switch"
                  aria-checked={current.isVisible !== false}
                >
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${current.isVisible !== false ? 'translate-x-5' : 'translate-x-0'}`}
                  />
                </button>
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  {current.isVisible !== false ? '前台公开展示此项目经历' : '已隐藏（前台不可见）'}
                </span>
              </div>

              <div className="flex justify-end space-x-3 mt-8">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false)
                    setCurrent(null)
                  }}
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
