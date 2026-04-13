import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useStore } from '../../store'

export default function Settings() {
  const { token } = useStore()
  const [searchParams] = useSearchParams()
  const tab = searchParams.get('tab') || 'basic'

  const [settings, setSettings] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})

  const gradientPresets = [
    { name: '暗夜黑', value: 'linear-gradient(to right, #0f172a, #000000)' },
    { name: '晨曦紫', value: 'linear-gradient(to right, #6366f1, #a855f7, #ec4899)' },
    { name: '海洋蓝', value: 'linear-gradient(to right, #0ea5e9, #06b6d4)' },
    { name: '森林绿', value: 'linear-gradient(to right, #10b981, #14b8a6)' },
    { name: '落日橙', value: 'linear-gradient(to right, #f97316, #ef4444)' },
    { name: '樱花粉', value: 'linear-gradient(to right, #f43f5e, #ec4899)' },
  ]

  useEffect(() => {
    fetch('/api/settings').then(r => r.json()).then(setSettings)
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          ...settings,
          heroBgOpacity: typeof settings.heroBgOpacity === 'string' ? parseFloat(settings.heroBgOpacity) : settings.heroBgOpacity,
          projectsBgOpacity: typeof settings.projectsBgOpacity === 'string' ? parseFloat(settings.projectsBgOpacity) : settings.projectsBgOpacity,
          blogBgOpacity: typeof settings.blogBgOpacity === 'string' ? parseFloat(settings.blogBgOpacity) : settings.blogBgOpacity
        })
      })
      if (!res.ok) throw new Error('Save failed')
      setMessage('保存成功')
    } catch {
      setMessage('保存失败')
    }
    setLoading(false)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings({ ...settings, [e.target.name]: e.target.value })
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    if (!e.target.files?.[0]) return
    const file = e.target.files[0]
    
    // Check file size (client side)
    if (file.size > 10 * 1024 * 1024) {
      setMessage('图片不能超过10MB')
      return
    }

    const formData = new FormData()
    formData.append('file', file)
    
    setUploadProgress(prev => ({ ...prev, [field]: 0 }))

    try {
      // Simulate progress since fetch doesn't support upload progress natively
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
      
      clearInterval(progressInterval)
      setUploadProgress(prev => ({ ...prev, [field]: 100 }))

      if (!res.ok) {
        throw new Error('Upload failed')
      }

      const data = await res.json()
      if (data.url) {
        setSettings({ ...settings, [field]: data.url })
      }
      
      // Clear progress after a short delay
      setTimeout(() => {
        setUploadProgress(prev => {
          const next = { ...prev }
          delete next[field]
          return next
        })
      }, 1000)

    } catch (err) {
      console.error('Upload error', err)
      setMessage('上传失败')
      setUploadProgress(prev => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  if (!settings) return <div>Loading...</div>

  const titles: Record<string, string> = {
    'basic': '基础设置',
    'home-bg': '首页壁纸设置',
    'portfolio-bg': '作品集壁纸设置',
    'blog-bg': '博客壁纸设置'
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">{titles[tab] || '设置'}</h1>
      <form onSubmit={handleSave} className="bg-white dark:bg-zinc-900 shadow-sm rounded-2xl p-8 border border-zinc-100 dark:border-zinc-800 space-y-6">
        {message && <div className="text-green-600 bg-green-50 p-3 rounded-lg text-sm">{message}</div>}
        
        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
          {tab === 'basic' && (
            <>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">站点标题</label>
                <input type="text" name="siteTitle" value={settings.siteTitle} onChange={handleChange} className="mt-1 block w-full rounded-2xl border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 shadow-sm focus:border-zinc-500 focus:ring-zinc-500 p-2.5 border outline-none transition-shadow" />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">主题色 (渐变预设)</label>
                <div className="grid grid-cols-3 gap-3">
                  {gradientPresets.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => setSettings({ ...settings, themeColor: preset.value })}
                      className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all ${
                        settings.themeColor === preset.value 
                          ? 'border-zinc-900 dark:border-white shadow-md scale-105' 
                          : 'border-transparent bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                      }`}
                    >
                      <div 
                        className="w-full h-8 rounded-xl mb-2 shadow-sm" 
                        style={{ background: preset.value }}
                      />
                      <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">{preset.name}</span>
                    </button>
                  ))}
                </div>
                <div className="mt-4">
                  <label className="block text-xs text-zinc-500 mb-1">自定义 CSS 渐变值</label>
                  <input type="text" name="themeColor" value={settings.themeColor} onChange={handleChange} className="block w-full rounded-2xl border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 shadow-sm focus:border-zinc-500 focus:ring-zinc-500 p-2.5 border outline-none transition-shadow text-sm" placeholder="例如: linear-gradient(to right, #000, #fff)" />
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">主页 Hero 标题 (多段文字请用英文逗号 , 分隔以实现打字机效果)</label>
                <input type="text" name="heroTitle" value={settings.heroTitle} onChange={handleChange} className="mt-1 block w-full rounded-2xl border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 shadow-sm focus:border-zinc-500 focus:ring-zinc-500 p-2.5 border outline-none transition-shadow" placeholder="例如: 独立开发者, 全栈工程师, 开源爱好者" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">主页 Hero 副标题</label>
                <input type="text" name="heroSubtitle" value={settings.heroSubtitle} onChange={handleChange} className="mt-1 block w-full rounded-2xl border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 shadow-sm focus:border-zinc-500 focus:ring-zinc-500 p-2.5 border outline-none transition-shadow" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">作品集副标题 (多段文字请用英文逗号 , 分隔以实现打字机效果)</label>
                <input type="text" name="projectsSubtitle" value={settings.projectsSubtitle || ''} onChange={handleChange} className="mt-1 block w-full rounded-2xl border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 shadow-sm focus:border-zinc-500 focus:ring-zinc-500 p-2.5 border outline-none transition-shadow" placeholder="例如: 这里展示了我近期参与开发或主导的核心项目" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">博客副标题 (多段文字请用英文逗号 , 分隔以实现打字机效果)</label>
                <input type="text" name="blogSubtitle" value={settings.blogSubtitle || ''} onChange={handleChange} className="mt-1 block w-full rounded-2xl border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 shadow-sm focus:border-zinc-500 focus:ring-zinc-500 p-2.5 border outline-none transition-shadow" placeholder="例如: AIGC 实践心得、开发经验、技术探索笔记" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">主页状态徽章 (如: AVAILABLE FOR NEW OPPORTUNITIES)</label>
                <input type="text" name="badgeText" value={settings.badgeText || ''} onChange={handleChange} className="mt-1 block w-full rounded-2xl border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 shadow-sm focus:border-zinc-500 focus:ring-zinc-500 p-2.5 border outline-none transition-shadow" placeholder="留空则不显示徽章" />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">技能矩阵标题</label>
                <input type="text" name="skillsMatrixTitle" value={settings.skillsMatrixTitle || ''} onChange={handleChange} className="mt-1 block w-full rounded-2xl border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 shadow-sm focus:border-zinc-500 focus:ring-zinc-500 p-2.5 border outline-none transition-shadow" placeholder="例如: 技能矩阵 / Skill Matrix" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">头像上传</label>
                <div className="mt-1 flex items-center space-x-4">
                  {settings.avatarUrl && <img src={settings.avatarUrl} alt="Avatar" className="h-12 w-12 rounded-full object-cover" />}
                  <div className="flex-1">
                    <input type="file" accept="image/*" onChange={e => handleUpload(e, 'avatarUrl')} className="block w-full text-sm text-zinc-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-2xl file:border-0 file:text-sm file:font-semibold file:bg-zinc-100 file:text-zinc-700 hover:file:bg-zinc-200 transition-colors" />
                    {uploadProgress['avatarUrl'] !== undefined && (
                      <div className="mt-2 w-full bg-zinc-200 rounded-full h-1.5 dark:bg-zinc-700">
                        <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${uploadProgress['avatarUrl']}%` }}></div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {tab === 'home-bg' && (
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Hero 壁纸上传 (图片/GIF)</label>
              <div className="mt-1 flex items-center space-x-4">
                {settings.heroBgUrl && <img src={settings.heroBgUrl} alt="Hero BG" className="h-12 w-24 rounded-xl object-cover" />}
                <div className="flex-1">
                  <input type="file" accept="image/*" onChange={e => handleUpload(e, 'heroBgUrl')} className="block w-full text-sm text-zinc-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-2xl file:border-0 file:text-sm file:font-semibold file:bg-zinc-100 file:text-zinc-700 hover:file:bg-zinc-200 transition-colors" />
                  {uploadProgress['heroBgUrl'] !== undefined && (
                    <div className="mt-2 w-full bg-zinc-200 rounded-full h-1.5 dark:bg-zinc-700">
                      <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${uploadProgress['heroBgUrl']}%` }}></div>
                    </div>
                  )}
                </div>
              </div>
              {settings.heroBgUrl && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">背景透明度: {settings.heroBgOpacity ?? 1}</label>
                  <input 
                    type="range" 
                    name="heroBgOpacity" 
                    min="0" 
                    max="1" 
                    step="0.05" 
                    value={settings.heroBgOpacity ?? 1} 
                    onChange={handleChange} 
                    className="w-full"
                  />
                </div>
              )}
            </div>
          )}

          {tab === 'portfolio-bg' && (
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">作品集壁纸上传</label>
              <div className="mt-1 flex items-center space-x-4">
                {settings.projectsBgUrl && <img src={settings.projectsBgUrl} alt="Projects BG" className="h-12 w-24 rounded-xl object-cover" />}
                <div className="flex-1">
                  <input type="file" accept="image/*" onChange={e => handleUpload(e, 'projectsBgUrl')} className="block w-full text-sm text-zinc-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-2xl file:border-0 file:text-sm file:font-semibold file:bg-zinc-100 file:text-zinc-700 hover:file:bg-zinc-200 transition-colors" />
                  {uploadProgress['projectsBgUrl'] !== undefined && (
                    <div className="mt-2 w-full bg-zinc-200 rounded-full h-1.5 dark:bg-zinc-700">
                      <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${uploadProgress['projectsBgUrl']}%` }}></div>
                    </div>
                  )}
                </div>
              </div>
              {settings.projectsBgUrl && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">背景透明度: {settings.projectsBgOpacity ?? 1}</label>
                  <input 
                    type="range" 
                    name="projectsBgOpacity" 
                    min="0" 
                    max="1" 
                    step="0.05" 
                    value={settings.projectsBgOpacity ?? 1} 
                    onChange={handleChange} 
                    className="w-full"
                  />
                </div>
              )}
            </div>
          )}

          {tab === 'blog-bg' && (
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">博客壁纸上传</label>
              <div className="mt-1 flex items-center space-x-4">
                {settings.blogBgUrl && <img src={settings.blogBgUrl} alt="Blog BG" className="h-12 w-24 rounded-xl object-cover" />}
                <div className="flex-1">
                  <input type="file" accept="image/*" onChange={e => handleUpload(e, 'blogBgUrl')} className="block w-full text-sm text-zinc-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-2xl file:border-0 file:text-sm file:font-semibold file:bg-zinc-100 file:text-zinc-700 hover:file:bg-zinc-200 transition-colors" />
                  {uploadProgress['blogBgUrl'] !== undefined && (
                    <div className="mt-2 w-full bg-zinc-200 rounded-full h-1.5 dark:bg-zinc-700">
                      <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${uploadProgress['blogBgUrl']}%` }}></div>
                    </div>
                  )}
                </div>
              </div>
              {settings.blogBgUrl && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">背景透明度: {settings.blogBgOpacity ?? 1}</label>
                  <input 
                    type="range" 
                    name="blogBgOpacity" 
                    min="0" 
                    max="1" 
                    step="0.05" 
                    value={settings.blogBgOpacity ?? 1} 
                    onChange={handleChange} 
                    className="w-full"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-end">
          <button type="submit" disabled={loading} className="px-6 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-medium rounded-2xl hover:bg-zinc-800 transition-colors disabled:opacity-50">
            {loading ? '保存中...' : '保存更改'}
          </button>
        </div>
      </form>
    </div>
  )
}
