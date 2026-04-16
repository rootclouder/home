import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useStore } from '../../store'
import { resolveMediaUrl } from '../../lib/utils'

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setSettings({ ...settings, [e.target.name]: e.target.value })
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    if (!e.target.files?.[0]) return
    const file = e.target.files[0]
    
    // Check file size (client side) - 50MB
    if (file.size > 50 * 1024 * 1024) {
      setMessage('文件不能超过50MB')
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
    'basic': '基础全局设置',
    'home-page': '首页展示配置',
    'portfolio-page': '作品集页面配置',
    'blog-page': '博客页面配置'
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">{titles[tab] || '设置'}</h1>
      <form onSubmit={handleSave} className="bg-white dark:bg-zinc-900 shadow-sm rounded-3xl p-8 md:p-10 border border-zinc-100 dark:border-zinc-800/60 space-y-10">
        {message && (
          <div className="text-emerald-600 bg-emerald-50/50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 p-4 rounded-2xl text-sm font-medium flex items-center">
            <span className="w-2 h-2 rounded-full bg-emerald-500 mr-3"></span>
            {message}
          </div>
        )}

        <div className="space-y-12">
          {tab === 'basic' && (
            <div className="space-y-8">
              <section>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-6 flex items-center">
                  <span className="w-1.5 h-5 bg-[var(--primary)] rounded-full mr-3 opacity-80"></span>
                  核心标识
                </h3>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 bg-zinc-50/50 dark:bg-zinc-800/20 p-6 md:p-8 rounded-3xl border border-zinc-100 dark:border-zinc-800/50">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">站点标题</label>
                    <input type="text" name="siteTitle" value={settings.siteTitle} onChange={handleChange} className="block w-full rounded-2xl border-zinc-200 dark:border-zinc-700 dark:bg-zinc-900 shadow-sm focus:border-[var(--primary)] focus:ring-[var(--primary)] p-3 border outline-none transition-all" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-4">头像上传</label>
                    <div className="flex items-center space-x-6">
                      {settings.avatarUrl ? (
                        <div className="relative group">
                          <img src={resolveMediaUrl(settings.avatarUrl)} alt="Avatar" className="h-20 w-20 rounded-full object-cover ring-4 ring-white dark:ring-zinc-800 shadow-lg" />
                        </div>
                      ) : (
                        <div className="h-20 w-20 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 ring-4 ring-white dark:ring-zinc-900 shadow-sm">
                          无
                        </div>
                      )}
                      <div className="flex-1 max-w-md">
                        <input type="file" accept="image/*" onChange={e => handleUpload(e, 'avatarUrl')} className="block w-full text-sm text-zinc-500 file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-zinc-100 dark:file:bg-zinc-800 file:text-zinc-700 dark:file:text-zinc-300 hover:file:bg-zinc-200 dark:hover:file:bg-zinc-700 transition-colors cursor-pointer" />
                        {uploadProgress['avatarUrl'] !== undefined && (
                          <div className="mt-3 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                            <div className="bg-[var(--primary)] h-full rounded-full transition-all duration-300" style={{ width: `${uploadProgress['avatarUrl']}%` }}></div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-4">网站 ICO</label>
                    <div className="flex flex-col space-y-6">
                      <div className="flex items-center space-x-6">
                        {settings.faviconUrl ? (
                          <div className="relative group">
                            <img src={resolveMediaUrl(settings.faviconUrl)} alt="Favicon" className="h-14 w-14 rounded-2xl object-cover ring-4 ring-white dark:ring-zinc-800 shadow-md bg-white" />
                          </div>
                        ) : (
                          <div className="h-14 w-14 rounded-2xl bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 ring-4 ring-white dark:ring-zinc-900 shadow-sm">
                            无
                          </div>
                        )}
                        <div className="flex-1 max-w-md">
                          <input type="file" accept="image/*,.ico" onChange={e => handleUpload(e, 'faviconUrl')} className="block w-full text-sm text-zinc-500 file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-zinc-100 dark:file:bg-zinc-800 file:text-zinc-700 dark:file:text-zinc-300 hover:file:bg-zinc-200 dark:hover:file:bg-zinc-700 transition-colors cursor-pointer" />
                          {uploadProgress['faviconUrl'] !== undefined && (
                            <div className="mt-3 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                              <div className="bg-[var(--primary)] h-full rounded-full transition-all duration-300" style={{ width: `${uploadProgress['faviconUrl']}%` }}></div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="pt-4 border-t border-zinc-200/50 dark:border-zinc-700/50">
                        <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-3">或使用系统生成的预设图标：</label>
                        <div className="flex space-x-4">
                          {[
                            { name: '赛博科技风', url: '/icons/logo-tech-dark.svg' },
                            { name: '极简线框风', url: '/icons/logo-minimal-light.svg' },
                            { name: '3D 立体风', url: '/icons/logo-isometric.svg' }
                          ].map((icon) => (
                            <button
                              key={icon.url}
                              type="button"
                              onClick={() => setSettings({ ...settings, faviconUrl: icon.url })}
                              className={`group flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all duration-300 ${
                                settings.faviconUrl === icon.url
                                  ? 'border-[var(--primary)] bg-white dark:bg-zinc-900 shadow-md scale-[1.02]'
                                  : 'border-transparent bg-zinc-100/50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:scale-[1.02]'
                              }`}
                            >
                              <img src={resolveMediaUrl(icon.url)} alt={icon.name} className="h-10 w-10 mb-2 rounded-xl bg-white shadow-sm transform group-hover:scale-105 transition-transform" />
                              <span className={`text-[10px] font-semibold ${settings.faviconUrl === icon.url ? 'text-[var(--primary)]' : 'text-zinc-500 dark:text-zinc-400'}`}>{icon.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-6 flex items-center">
                  <span className="w-1.5 h-5 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full mr-3 opacity-80"></span>
                  品牌色彩
                </h3>
                <div className="bg-zinc-50/50 dark:bg-zinc-800/20 p-6 md:p-8 rounded-3xl border border-zinc-100 dark:border-zinc-800/50">
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-4">主题色 (预设渐变)</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                    {gradientPresets.map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => setSettings({ ...settings, themeColor: preset.value })}
                        className={`group flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all duration-300 ${
                          settings.themeColor === preset.value
                            ? 'border-[var(--primary)] bg-white dark:bg-zinc-900 shadow-md scale-[1.02]'
                            : 'border-transparent bg-zinc-100/50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:scale-[1.02]'
                        }`}
                      >
                        <div
                          className="w-full h-10 rounded-xl mb-3 shadow-sm transform group-hover:scale-105 transition-transform"
                          style={{ background: preset.value }}
                        />
                        <span className={`text-xs font-semibold ${settings.themeColor === preset.value ? 'text-[var(--primary)]' : 'text-zinc-500 dark:text-zinc-400'}`}>{preset.name}</span>
                      </button>
                    ))}
                  </div>
                  <div className="mt-6 pt-6 border-t border-zinc-200/50 dark:border-zinc-700/50">
                    <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2">自定义 CSS 渐变值</label>
                    <input type="text" name="themeColor" value={settings.themeColor} onChange={handleChange} className="block w-full rounded-2xl border-zinc-200 dark:border-zinc-700 dark:bg-zinc-900 shadow-sm focus:border-[var(--primary)] focus:ring-[var(--primary)] p-3 border outline-none transition-all text-sm font-mono" placeholder="例如: linear-gradient(to right, #000, #fff)" />
                  </div>
                </div>
              </section>
            </div>
          )}

          {tab === 'home-page' && (
            <div className="space-y-8">
              <section>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-6 flex items-center">
                  <span className="w-1.5 h-5 bg-blue-500 rounded-full mr-3 opacity-80"></span>
                  首页文案
                </h3>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 bg-zinc-50/50 dark:bg-zinc-800/20 p-6 md:p-8 rounded-3xl border border-zinc-100 dark:border-zinc-800/50">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                      Hero 标题 <span className="text-zinc-400 font-normal ml-1">(多段用英文逗号 , 分隔以实现打字机效果)</span>
                    </label>
                    <textarea name="heroTitle" rows={2} value={settings.heroTitle} onChange={handleChange} className="block w-full rounded-2xl border-zinc-200 dark:border-zinc-700 dark:bg-zinc-900 shadow-sm focus:border-[var(--primary)] focus:ring-[var(--primary)] p-4 border outline-none transition-all resize-none text-sm leading-relaxed" placeholder="例如: 独立开发者, 全栈工程师, 开源爱好者" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Hero 副标题</label>
                    <input type="text" name="heroSubtitle" value={settings.heroSubtitle} onChange={handleChange} className="block w-full rounded-2xl border-zinc-200 dark:border-zinc-700 dark:bg-zinc-900 shadow-sm focus:border-[var(--primary)] focus:ring-[var(--primary)] p-3 border outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">状态徽章文本</label>
                    <input type="text" name="badgeText" value={settings.badgeText || ''} onChange={handleChange} className="block w-full rounded-2xl border-zinc-200 dark:border-zinc-700 dark:bg-zinc-900 shadow-sm focus:border-[var(--primary)] focus:ring-[var(--primary)] p-3 border outline-none transition-all text-sm" placeholder="如: AVAILABLE FOR NEW OPPORTUNITIES" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">技能矩阵模块标题</label>
                    <input type="text" name="skillsMatrixTitle" value={settings.skillsMatrixTitle || ''} onChange={handleChange} className="block w-full rounded-2xl border-zinc-200 dark:border-zinc-700 dark:bg-zinc-900 shadow-sm focus:border-[var(--primary)] focus:ring-[var(--primary)] p-3 border outline-none transition-all text-sm" placeholder="例如: 技能矩阵 / Skill Matrix" />
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-6 flex items-center">
                  <span className="w-1.5 h-5 bg-indigo-500 rounded-full mr-3 opacity-80"></span>
                  视觉氛围
                </h3>
                <div className="bg-zinc-50/50 dark:bg-zinc-800/20 p-6 md:p-8 rounded-3xl border border-zinc-100 dark:border-zinc-800/50">
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-4">Hero 背景壁纸 (图片、GIF 或 MP4)</label>
                  <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
                    {settings.heroBgUrl ? (
                      settings.heroBgUrl.match(/\.(mp4|webm)$/i) ? (
                        <video src={resolveMediaUrl(settings.heroBgUrl)} autoPlay loop muted playsInline className="h-24 w-40 rounded-2xl object-cover shadow-md border border-zinc-200 dark:border-zinc-700" />
                      ) : (
                        <img src={resolveMediaUrl(settings.heroBgUrl)} alt="Hero BG" className="h-24 w-40 rounded-2xl object-cover shadow-md border border-zinc-200 dark:border-zinc-700" />
                      )
                    ) : (
                      <div className="h-24 w-40 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 text-sm border border-dashed border-zinc-300 dark:border-zinc-700">无背景</div>
                    )}
                    <div className="flex-1 max-w-md">
                      <input type="file" accept="image/*,video/mp4,video/webm" onChange={e => handleUpload(e, 'heroBgUrl')} className="block w-full text-sm text-zinc-500 file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-zinc-100 dark:file:bg-zinc-800 file:text-zinc-700 dark:file:text-zinc-300 hover:file:bg-zinc-200 dark:hover:file:bg-zinc-700 transition-colors cursor-pointer" />
                      {uploadProgress['heroBgUrl'] !== undefined && (
                        <div className="mt-3 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                          <div className="bg-blue-500 h-full rounded-full transition-all duration-300" style={{ width: `${uploadProgress['heroBgUrl']}%` }}></div>
                        </div>
                      )}
                    </div>
                  </div>
                  {settings.heroBgUrl && (
                    <div className="mt-8 pt-6 border-t border-zinc-200/50 dark:border-zinc-700/50">
                      <div className="flex justify-between mb-2">
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">背景透明度 / 不透明度</label>
                        <span className="text-sm font-mono text-[var(--primary)]">{settings.heroBgOpacity ?? 1}</span>
                      </div>
                      <input type="range" name="heroBgOpacity" min="0" max="1" step="0.05" value={settings.heroBgOpacity ?? 1} onChange={handleChange} className="w-full accent-[var(--primary)]" />
                    </div>
                  )}
                </div>
              </section>
            </div>
          )}

          {tab === 'portfolio-page' && (
            <div className="space-y-8">
              <section>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-6 flex items-center">
                  <span className="w-1.5 h-5 bg-emerald-500 rounded-full mr-3 opacity-80"></span>
                  副标题配置
                </h3>
                <div className="bg-zinc-50/50 dark:bg-zinc-800/20 p-6 md:p-8 rounded-3xl border border-zinc-100 dark:border-zinc-800/50">
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
                    打字机特效文案 <span className="text-zinc-400 font-normal ml-1">(多段文字请用英文逗号 , 分隔)</span>
                  </label>
                  <textarea
                    name="projectsSubtitle"
                    rows={4}
                    value={settings.projectsSubtitle || ''}
                    onChange={handleChange}
                    className="block w-full rounded-2xl border-zinc-200 dark:border-zinc-700 dark:bg-zinc-900 shadow-sm focus:border-[var(--primary)] focus:ring-[var(--primary)] p-4 border outline-none transition-all text-sm leading-relaxed resize-none"
                    placeholder="例如: 这里展示了我近期参与开发或主导的核心项目, 涵盖前端交互、全栈开发与用户体验设计"
                  />
                  <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400 flex items-center">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-600 mr-2"></span>
                    前台将以像素风 (Pixel Font) 逐字打印展示，增加复古极客氛围。
                  </p>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-6 flex items-center">
                  <span className="w-1.5 h-5 bg-teal-500 rounded-full mr-3 opacity-80"></span>
                  视觉氛围
                </h3>
                <div className="bg-zinc-50/50 dark:bg-zinc-800/20 p-6 md:p-8 rounded-3xl border border-zinc-100 dark:border-zinc-800/50">
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-4">作品集背景壁纸 (图片、GIF 或 MP4)</label>
                  <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
                    {settings.projectsBgUrl ? (
                      settings.projectsBgUrl.match(/\.(mp4|webm)$/i) ? (
                        <video src={resolveMediaUrl(settings.projectsBgUrl)} autoPlay loop muted playsInline className="h-24 w-40 rounded-2xl object-cover shadow-md border border-zinc-200 dark:border-zinc-700" />
                      ) : (
                        <img src={resolveMediaUrl(settings.projectsBgUrl)} alt="Projects BG" className="h-24 w-40 rounded-2xl object-cover shadow-md border border-zinc-200 dark:border-zinc-700" />
                      )
                    ) : (
                      <div className="h-24 w-40 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 text-sm border border-dashed border-zinc-300 dark:border-zinc-700">无背景</div>
                    )}
                    <div className="flex-1 max-w-md">
                      <input type="file" accept="image/*,video/mp4,video/webm" onChange={e => handleUpload(e, 'projectsBgUrl')} className="block w-full text-sm text-zinc-500 file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-zinc-100 dark:file:bg-zinc-800 file:text-zinc-700 dark:file:text-zinc-300 hover:file:bg-zinc-200 dark:hover:file:bg-zinc-700 transition-colors cursor-pointer" />
                      {uploadProgress['projectsBgUrl'] !== undefined && (
                        <div className="mt-3 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                          <div className="bg-emerald-500 h-full rounded-full transition-all duration-300" style={{ width: `${uploadProgress['projectsBgUrl']}%` }}></div>
                        </div>
                      )}
                    </div>
                  </div>
                  {settings.projectsBgUrl && (
                    <div className="mt-8 pt-6 border-t border-zinc-200/50 dark:border-zinc-700/50">
                      <div className="flex justify-between mb-2">
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">背景透明度 / 不透明度</label>
                        <span className="text-sm font-mono text-[var(--primary)]">{settings.projectsBgOpacity ?? 1}</span>
                      </div>
                      <input type="range" name="projectsBgOpacity" min="0" max="1" step="0.05" value={settings.projectsBgOpacity ?? 1} onChange={handleChange} className="w-full accent-[var(--primary)]" />
                    </div>
                  )}
                </div>
              </section>
            </div>
          )}

          {tab === 'blog-page' && (
            <div className="space-y-8">
              <section>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-6 flex items-center">
                  <span className="w-1.5 h-5 bg-orange-500 rounded-full mr-3 opacity-80"></span>
                  副标题配置
                </h3>
                <div className="bg-zinc-50/50 dark:bg-zinc-800/20 p-6 md:p-8 rounded-3xl border border-zinc-100 dark:border-zinc-800/50">
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
                    打字机特效文案 <span className="text-zinc-400 font-normal ml-1">(多段文字请用英文逗号 , 分隔)</span>
                  </label>
                  <textarea
                    name="blogSubtitle"
                    rows={4}
                    value={settings.blogSubtitle || ''}
                    onChange={handleChange}
                    className="block w-full rounded-2xl border-zinc-200 dark:border-zinc-700 dark:bg-zinc-900 shadow-sm focus:border-[var(--primary)] focus:ring-[var(--primary)] p-4 border outline-none transition-all text-sm leading-relaxed resize-none"
                    placeholder="例如: AIGC 实践心得、开发经验、技术探索笔记"
                  />
                  <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400 flex items-center">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-600 mr-2"></span>
                    前台将以像素风 (Pixel Font) 逐字打印展示，增加复古极客氛围。
                  </p>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-6 flex items-center">
                  <span className="w-1.5 h-5 bg-amber-500 rounded-full mr-3 opacity-80"></span>
                  视觉氛围
                </h3>
                <div className="bg-zinc-50/50 dark:bg-zinc-800/20 p-6 md:p-8 rounded-3xl border border-zinc-100 dark:border-zinc-800/50">
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-4">博客背景壁纸 (图片、GIF 或 MP4)</label>
                  <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
                    {settings.blogBgUrl ? (
                      settings.blogBgUrl.match(/\.(mp4|webm)$/i) ? (
                        <video src={resolveMediaUrl(settings.blogBgUrl)} autoPlay loop muted playsInline className="h-24 w-40 rounded-2xl object-cover shadow-md border border-zinc-200 dark:border-zinc-700" />
                      ) : (
                        <img src={resolveMediaUrl(settings.blogBgUrl)} alt="Blog BG" className="h-24 w-40 rounded-2xl object-cover shadow-md border border-zinc-200 dark:border-zinc-700" />
                      )
                    ) : (
                      <div className="h-24 w-40 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 text-sm border border-dashed border-zinc-300 dark:border-zinc-700">无背景</div>
                    )}
                    <div className="flex-1 max-w-md">
                      <input type="file" accept="image/*,video/mp4,video/webm" onChange={e => handleUpload(e, 'blogBgUrl')} className="block w-full text-sm text-zinc-500 file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-zinc-100 dark:file:bg-zinc-800 file:text-zinc-700 dark:file:text-zinc-300 hover:file:bg-zinc-200 dark:hover:file:bg-zinc-700 transition-colors cursor-pointer" />
                      {uploadProgress['blogBgUrl'] !== undefined && (
                        <div className="mt-3 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                          <div className="bg-orange-500 h-full rounded-full transition-all duration-300" style={{ width: `${uploadProgress['blogBgUrl']}%` }}></div>
                        </div>
                      )}
                    </div>
                  </div>
                  {settings.blogBgUrl && (
                    <div className="mt-8 pt-6 border-t border-zinc-200/50 dark:border-zinc-700/50">
                      <div className="flex justify-between mb-2">
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">背景透明度 / 不透明度</label>
                        <span className="text-sm font-mono text-[var(--primary)]">{settings.blogBgOpacity ?? 1}</span>
                      </div>
                      <input type="range" name="blogBgOpacity" min="0" max="1" step="0.05" value={settings.blogBgOpacity ?? 1} onChange={handleChange} className="w-full accent-[var(--primary)]" />
                    </div>
                  )}
                </div>
              </section>
            </div>
          )}
        </div>

        <div className="pt-8 mt-10 border-t border-zinc-100 dark:border-zinc-800/60 flex justify-end">
          <button type="submit" disabled={loading} className="px-8 py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-semibold rounded-2xl hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:shadow-none transform hover:-translate-y-0.5 disabled:translate-y-0 active:scale-95">
            {loading ? '正在保存...' : '保存更改'}
          </button>
        </div>
      </form>
    </div>
  )
}
