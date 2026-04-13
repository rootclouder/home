import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown } from 'lucide-react'
import { useStore } from '../../store'

export default function WorkExperiences() {
  const [experiences, setExperiences] = useState<any[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [currentExp, setCurrentExp] = useState<any>(null)
  const token = useStore(state => state.token)

  useEffect(() => {
    fetchExperiences()
  }, [])

  const fetchExperiences = async () => {
    const res = await fetch('/api/work-experiences')
    if (res.ok) {
      setExperiences(await res.json())
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    const method = currentExp.id ? 'PUT' : 'POST'
    const url = currentExp.id ? `/api/work-experiences/${currentExp.id}` : '/api/work-experiences'
    
    await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(currentExp)
    })
    
    setIsEditing(false)
    setCurrentExp(null)
    fetchExperiences()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这条工作经历吗？')) return
    await fetch(`/api/work-experiences/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
    fetchExperiences()
  }

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return
    if (direction === 'down' && index === experiences.length - 1) return

    const newExps = [...experiences]
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    const temp = newExps[index]
    newExps[index] = newExps[targetIndex]
    newExps[targetIndex] = temp

    // Update all order values
    await Promise.all(newExps.map((exp, i) => 
      fetch(`/api/work-experiences/${exp.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ sortOrder: i })
      })
    ))
    
    fetchExperiences()
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">工作经历管理</h1>
        <button
          onClick={() => {
            setCurrentExp({ company: '', position: '', startDate: '', endDate: '', description: '', sortOrder: experiences.length })
            setIsEditing(true)
          }}
          className="flex items-center px-4 py-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          添加工作经历
        </button>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800">
            <tr>
              <th className="px-6 py-4 text-sm font-medium text-zinc-500 dark:text-zinc-400">公司名称</th>
              <th className="px-6 py-4 text-sm font-medium text-zinc-500 dark:text-zinc-400">职位</th>
              <th className="px-6 py-4 text-sm font-medium text-zinc-500 dark:text-zinc-400">时间</th>
              <th className="px-6 py-4 text-sm font-medium text-zinc-500 dark:text-zinc-400">排序</th>
              <th className="px-6 py-4 text-sm font-medium text-zinc-500 dark:text-zinc-400 text-right">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {experiences.map((exp, index) => (
              <tr key={exp.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                <td className="px-6 py-4 text-zinc-900 dark:text-zinc-100 font-medium">{exp.company}</td>
                <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400">{exp.position}</td>
                <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400">{exp.startDate} - {exp.endDate}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => handleMove(index, 'up')}
                      disabled={index === 0}
                      className="p-1 text-zinc-400 hover:text-zinc-900 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleMove(index, 'down')}
                      disabled={index === experiences.length - 1}
                      className="p-1 text-zinc-400 hover:text-zinc-900 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => {
                      setCurrentExp(exp)
                      setIsEditing(true)
                    }}
                    className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(exp.id)}
                    className="p-2 text-zinc-400 hover:text-red-600 transition-colors ml-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {experiences.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                  暂无工作经历，请点击右上角添加
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
              {currentExp.id ? '编辑工作经历' : '添加工作经历'}
            </h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">公司名称</label>
                  <input
                    type="text"
                    required
                    value={currentExp.company}
                    onChange={e => setCurrentExp({...currentExp, company: e.target.value})}
                    className="w-full rounded-lg border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 shadow-sm focus:border-zinc-500 focus:ring-zinc-500 p-2.5 border"
                    placeholder="例如: 某某科技公司"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">职位</label>
                  <input
                    type="text"
                    required
                    value={currentExp.position}
                    onChange={e => setCurrentExp({...currentExp, position: e.target.value})}
                    className="w-full rounded-lg border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 shadow-sm focus:border-zinc-500 focus:ring-zinc-500 p-2.5 border"
                    placeholder="例如: 高级前端开发工程师"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">开始时间</label>
                  <input
                    type="text"
                    required
                    value={currentExp.startDate}
                    onChange={e => setCurrentExp({...currentExp, startDate: e.target.value})}
                    className="w-full rounded-lg border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 shadow-sm focus:border-zinc-500 focus:ring-zinc-500 p-2.5 border"
                    placeholder="例如: 2021.06"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">结束时间</label>
                  <input
                    type="text"
                    required
                    value={currentExp.endDate}
                    onChange={e => setCurrentExp({...currentExp, endDate: e.target.value})}
                    className="w-full rounded-lg border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 shadow-sm focus:border-zinc-500 focus:ring-zinc-500 p-2.5 border"
                    placeholder="例如: 至今"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">工作描述 (支持多行)</label>
                <textarea
                  required
                  rows={6}
                  value={currentExp.description}
                  onChange={e => setCurrentExp({...currentExp, description: e.target.value})}
                  className="w-full rounded-lg border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 shadow-sm focus:border-zinc-500 focus:ring-zinc-500 p-2.5 border resize-none"
                  placeholder="描述你在该职位的主要工作内容和项目成就..."
                />
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