import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../../store'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const setToken = useStore(state => state.setToken)
  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })
      const data = await res.json()
      if (res.ok) {
        setToken(data.token)
        navigate('/admin')
      } else {
        setError(data.error)
      }
    } catch (err) {
      setError('登录失败')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-zinc-900 p-10 rounded-2xl shadow-xl border border-zinc-100 dark:border-zinc-800">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-zinc-900 dark:text-white">
            登录控制台
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          {error && <div className="text-red-500 text-sm text-center bg-red-50 py-2 rounded-lg">{error}</div>}
          <div className="rounded-2xl shadow-sm space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">用户名</label>
              <input
                type="text"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 placeholder-zinc-500 text-zinc-900 dark:text-white rounded-2xl focus:outline-none focus:ring-zinc-500 focus:border-zinc-500 focus:z-10 sm:text-sm"
                value={username}
                onChange={e => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">密码</label>
              <input
                type="password"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 placeholder-zinc-500 text-zinc-900 dark:text-white rounded-2xl focus:outline-none focus:ring-zinc-500 focus:border-zinc-500 focus:z-10 sm:text-sm"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-2xl text-white bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-900 transition-colors"
            >
              登录
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
