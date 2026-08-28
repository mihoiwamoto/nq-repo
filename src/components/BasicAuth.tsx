import { useState, ReactNode } from 'react'

interface BasicAuthProps {
  children: ReactNode
}

const DEFAULT_USERNAME = 'nq-repo'
const DEFAULT_PASSWORD = 'nq_8888@'

export function BasicAuth({ children }: BasicAuthProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('auth') === 'true'
  })
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  if (isAuthenticated) {
    return children
  }

  const handleLogin = () => {
    if (username === DEFAULT_USERNAME && password === DEFAULT_PASSWORD) {
      sessionStorage.setItem('auth', 'true')
      setIsAuthenticated(true)
      setError('')
    } else {
      setError('ユーザー名またはパスワードが間違っています')
      setPassword('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg w-96 overflow-hidden">
        <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
          <p className="text-sm font-medium text-gray-700">ログイン</p>
          <p className="text-xs text-gray-500 mt-1">{window.location.href}</p>
        </div>

        <div className="px-6 py-4">
          <div className="mb-4">
            <label className="block text-sm text-gray-700 mb-2">ユーザー名</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyPress={handleKeyPress}
              autoFocus
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm text-gray-700 mb-2">パスワード</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          {error && (
            <div className="mb-4 text-sm text-red-600">
              {error}
            </div>
          )}
        </div>

        <div className="bg-gray-50 border-t border-gray-200 px-6 py-3 flex justify-end gap-3">
          <button
            onClick={() => {
              setUsername('')
              setPassword('')
              setError('')
            }}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded transition"
          >
            キャンセル
          </button>
          <button
            onClick={handleLogin}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded transition"
          >
            ログイン
          </button>
        </div>
      </div>
    </div>
  )
}
