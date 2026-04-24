import { useEffect, useState } from 'react'
import { useStore } from '../../store'

function randomKey() {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz0123456789'
  const bytes = new Uint8Array(8)
  crypto.getRandomValues(bytes)
  return Array.from(bytes).map(b => alphabet[b % alphabet.length]).join('')
}

export default function Profiles() {
  const { token, profileKey, setProfileKey } = useStore()
  const [profiles, setProfiles] = useState<any[]>([])
  const [editing, setEditing] = useState<any>(null)

  const fetchProfiles = () =>
    fetch('/api/profiles')
      .then(r => r.ok ? r.json() : [])
      .then(setProfiles)

  useEffect(() => { fetchProfiles() }, [])

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    const method = editing.id ? 'PUT' : 'POST'
    const url = editing.id ? `/api/profiles/${editing.id}` : '/api/profiles'
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name: editing.name, key: editing.key, isDefault: Boolean(editing.isDefault) })
    })
    const data = await res.json().catch(() => null)
    if (!res.ok) {
      alert(data?.error || '保存失败')
      return
    }
    setEditing(null)
    await fetchProfiles()
  }

  const deleteProfile = async (p: any) => {
    if (!confirm(`确认删除 Profile：${p.name}？`)) return
    const res = await fetch(`/api/profiles/${p.id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
    const data = await res.json().catch(() => null)
    if (!res.ok) {
      alert(data?.error || '删除失败')
      return
    }
    if (profileKey === p.key) setProfileKey('default')
    fetchProfiles()
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Profiles</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-2">每个 Profile 对应一套独立站点内容，对外通过 key 路由访问。</p>
        </div>
        <button
          onClick={() => setEditing({ name: '', key: randomKey(), isDefault: false })}
          className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-4 py-2 rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors"
        >
          新增 Profile
        </button>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-zinc-500 dark:text-zinc-400">名称</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-zinc-500 dark:text-zinc-400">Key（对外路由）</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-zinc-500 dark:text-zinc-400">默认</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-zinc-500 dark:text-zinc-400">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {profiles.map(p => (
                <tr key={p.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                  <td className="px-6 py-4 text-zinc-900 dark:text-zinc-100 font-medium">{p.name}</td>
                  <td className="px-6 py-4 font-mono text-sm text-zinc-600 dark:text-zinc-400">/{p.key}</td>
                  <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400">{p.isDefault ? '是' : '否'}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setEditing({ id: p.id, name: p.name, key: p.key, isDefault: p.isDefault })}
                        className="px-3 py-1.5 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                      >
                        编辑
                      </button>
                      <button
                        onClick={() => deleteProfile(p)}
                        className="px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                      >
                        删除
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {profiles.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-zinc-500 dark:text-zinc-400">暂无 Profile</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form onSubmit={saveProfile} className="bg-white dark:bg-zinc-900 rounded-2xl p-6 w-full max-w-lg border border-zinc-200 dark:border-zinc-800 space-y-5">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white">{editing.id ? '编辑 Profile' : '新增 Profile'}</h2>
              <button type="button" onClick={() => setEditing(null)} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200">✕</button>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">名称</label>
              <input value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} required className="block w-full rounded-2xl border border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 p-2.5 text-zinc-900 dark:text-white focus:ring-2 focus:ring-zinc-500 outline-none" />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1 flex items-center justify-between">
                <span>Key（对外路由）</span>
                <button type="button" onClick={() => setEditing({ ...editing, key: randomKey() })} className="text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">
                  随机生成
                </button>
              </label>
              <input value={editing.key} onChange={e => setEditing({ ...editing, key: e.target.value })} required className="block w-full rounded-2xl border border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 p-2.5 font-mono text-zinc-900 dark:text-white focus:ring-2 focus:ring-zinc-500 outline-none" />
              <div className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">建议使用不明显的短字符串（2-32 位，小写字母/数字/连字符）。</div>
            </div>

            <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
              <input type="checkbox" checked={Boolean(editing.isDefault)} onChange={e => setEditing({ ...editing, isDefault: e.target.checked })} className="w-4 h-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900" />
              设为默认 Profile（不带 key 的 /、/projects、/articles 将使用默认 Profile）
            </label>

            <div className="flex justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
              <button type="button" onClick={() => setEditing(null)} className="px-5 py-2.5 text-zinc-600 font-medium hover:bg-zinc-100 rounded-2xl transition-colors">取消</button>
              <button type="submit" className="px-5 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-medium rounded-2xl hover:bg-zinc-800 transition-colors">保存</button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

