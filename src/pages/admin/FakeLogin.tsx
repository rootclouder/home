import { useState, useEffect } from 'react'
import { resolveMediaUrl } from '../../lib/utils'

export default function FakeLogin() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const [settings, setSettings] = useState<any>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) setSettings(data)
      })
      .catch(() => {})
      .finally(() => setIsLoaded(true))
  }, [])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setTimeout(() => {
      setError('账号或密码错误')
      setLoading(false)
    }, 450)
  }

  if (!isLoaded) return <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950" />

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 pixel-font">
      {settings?.heroBgUrl && (
        settings.heroBgUrl.match(/\.(mp4|webm)$/i) ? (
          <video
            src={resolveMediaUrl(settings.heroBgUrl)}
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover z-0"
            style={{ opacity: settings.heroBgOpacity ?? 1 }}
          />
        ) : (
          <div
            className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url(${resolveMediaUrl(settings.heroBgUrl)})`,
              opacity: settings.heroBgOpacity ?? 1
            }}
          />
        )
      )}

      <div className="relative z-10 w-full max-w-md p-6">
        <div className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border border-zinc-200/50 dark:border-zinc-800/50 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-2xl p-8 sm:p-10">
          <div className="mb-8 text-center">
            <h2 className="text-3xl text-zinc-900 dark:text-white tracking-wider">
              后台管理
            </h2>
            <p className="mt-2 text-zinc-500 dark:text-zinc-400 text-sm">请输入管理员凭证</p>
          </div>

          <form className="space-y-6" onSubmit={handleLogin}>
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm rounded-xl text-center">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-zinc-700 dark:text-zinc-300 mb-2 tracking-wide">
                  账号
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 bg-zinc-50/50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white focus:border-transparent transition-all"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm text-zinc-700 dark:text-zinc-300 mb-2 tracking-wide">
                  密码
                </label>
                <input
                  type="password"
                  required
                  className="w-full px-4 py-3 bg-zinc-50/50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white focus:border-transparent transition-all"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 py-3.5 rounded-xl hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed tracking-widest text-lg shadow-md"
              >
                {loading ? '登录中...' : '登录'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
