'use client'

import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { LogIn, LogOut, User } from 'lucide-react'

export default function LoginButton() {
  const supabase = createClient()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.refresh()
  }

  if (user) {
    return (
      <div className="flex items-center gap-2 md:gap-4">
        {/* Desktop: Show Email, Mobile: Hidden */}
        <span className="hidden md:inline text-sm font-medium text-gray-600">{user.email}</span>
        
        {/* Desktop: Logout Text button, Mobile: Logout Icon button */}
        <button
          onClick={handleLogout}
          className="flex items-center justify-center w-10 h-10 md:w-auto md:h-auto md:px-4 md:py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all shadow-sm hover:border-red-100 hover:text-red-500 group"
          title="로그아웃"
        >
          <span className="hidden md:inline">로그아웃</span>
          <LogOut className="md:hidden w-5 h-5 group-hover:scale-110 transition-transform" />
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={handleLogin}
      className="flex items-center justify-center w-10 h-10 md:w-auto md:h-auto md:px-6 md:py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-95 transform"
      title="로그인"
    >
      <span className="hidden md:inline">로그인</span>
      <LogIn className="md:hidden w-5 h-5" />
    </button>
  )
}
