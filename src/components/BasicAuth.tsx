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
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* ヘッダー */}
        <div className="bg-green-600 px-8 py-6">
          <h1 className="text-2xl font-bold text-white">Basic Security</h1>
        </div>

        {/* コンテンツ */}
        <div className="px-8 py-8">
          <div className="mb-6">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyPress={handleKeyPress}
              autoFocus
              placeholder="User Name"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-sm focus:outline-none focus:border-green-600 focus:bg-green-50 transition"
            />
          </div>

          <div className="mb-8">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="••••••••"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-sm focus:outline-none focus:border-green-600 focus:bg-green-50 transition"
            />
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-100 border-l-4 border-red-600 text-red-700 text-sm rounded">
              {error}
            </div>
          )}

          <button
            onClick={handleLogin}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition duration-200 text-base"
          >
            Login
          </button>
        </div>
      </div>
    </div>
  )
}
