'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Lock, User, ShieldCheck } from 'lucide-react'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Simulating Admin Login Logic
    // In a real scenario, this would check against a secure backend or specific Supabase role
    if (email === 'admin@hkmag.com' && password === 'admin1234!') {
      // Set a session cookie or local storage to simulate authentication
      localStorage.setItem('isAdminAuthenticated', 'true')
      localStorage.setItem('adminLoginTime', Date.now().toString())
      router.replace('/admin')
    } else {
      setError('이메일 또는 비밀번호가 관리자 정보와 일치하지 않습니다.')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        {/* Logo/Icon Section */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-blue-600 rounded-[2rem] flex items-center justify-center text-white mx-auto mb-6 shadow-xl shadow-blue-600/20">
            <ShieldCheck className="w-10 h-10" />
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">관리자 대시보드 로그인</h1>
          <p className="text-gray-400 font-bold text-sm mt-2">AI 가이드 플랫폼 운영을 위한 관리 계정 전용</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-[2.5rem] p-10 shadow-xl shadow-blue-900/5 border border-gray-100">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3 ml-2">계정 이메일</label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@hkmag.com"
                  className="w-full h-14 pl-12 pr-6 bg-gray-50 border-2 border-gray-50 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:bg-white transition-all font-bold text-gray-900"
                  required
                />
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3 ml-2">비밀번호</label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-14 pl-12 pr-6 bg-gray-50 border-2 border-gray-50 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:bg-white transition-all font-bold text-gray-900"
                  required
                />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
            </div>

            {error && (
              <p className="text-red-500 text-xs font-bold text-center animate-shake">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-14 bg-blue-600 text-white font-black rounded-2xl shadow-lg shadow-blue-600/20 hover:bg-blue-700 active:scale-95 transition-all text-lg flex items-center justify-center gap-3"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>로그인하기</>
              )}
            </button>
          </form>
        </div>

        {/* Footer/Back Section */}
        <div className="text-center mt-10">
          <button 
            onClick={() => router.push('/')}
            className="text-gray-400 hover:text-gray-900 font-bold text-sm transition-colors"
          >
            ← 메인 서비스로 돌아가기
          </button>
        </div>
      </div>
    </div>
  )
}
