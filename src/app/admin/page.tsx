'use client'

import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  BarChart3, 
  MessageSquare, 
  ThumbsUp, 
  Trash2, 
  ChevronRight, 
  Search, 
  Filter,
  LogOut,
  LayoutDashboard,
  ExternalLink,
  ShieldAlert,
  ArrowUpDown
} from 'lucide-react'
import Link from 'next/link'

const CATEGORIES = ['전체', '문서작성', '디자인', '멀티미디어', '개발', '마케팅', '데이터분석', '고객관리', '기타']

export default function AdminDashboardPage() {
  const router = useRouter()
  const supabase = createClient()
  
  // Auth & UI States
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [loading, setLoading] = useState(true)
  const [posts, setPosts] = useState<any[]>([])
  const [activeCategory, setActiveCategory] = useState('전체')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'latest' | 'helpful' | 'comments'>('latest')

  // Stats States
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalVotes: 0,
    totalComments: 0
  })

  useEffect(() => {
    // 1. Auth Check
    const authStatus = localStorage.getItem('isAdminAuthenticated')
    if (authStatus !== 'true') {
      router.replace('/admin/login')
      return
    }
    setIsAuthorized(true)
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      // 1. Fetch All Posts with Category Filter
      let postsQuery = supabase.from('posts').select('*').order('created_at', { ascending: false })
      if (activeCategory !== '전체') {
        postsQuery = postsQuery.eq('category', activeCategory)
      }
      const { data: postsData } = await postsQuery
      
      if (!postsData) return

      // 2. Fetch Engagement Data for Each Post
      const enrichedPosts = await Promise.all(postsData.map(async (post) => {
        const { count: voteCount } = await supabase.from('helpful_votes').select('*', { count: 'exact', head: true }).eq('post_id', post.id)
        const { count: commentCount } = await supabase.from('comments').select('*', { count: 'exact', head: true }).eq('post_id', post.id)
        return { ...post, voteCount: voteCount || 0, commentCount: commentCount || 0 }
      }))

      // 3. Global Stats Calculation
      const { count: totalVotes } = await supabase.from('helpful_votes').select('*', { count: 'exact', head: true })
      const { count: totalComments } = await supabase.from('comments').select('*', { count: 'exact', head: true })
      
      setStats({
        totalPosts: postsData.length,
        totalVotes: totalVotes || 0,
        totalComments: totalComments || 0
      })

      // 4. Sorting logic
      let sortedPosts = enrichedPosts
      if (sortBy === 'helpful') sortedPosts = enrichedPosts.sort((a, b) => b.voteCount - a.voteCount)
      if (sortBy === 'comments') sortedPosts = enrichedPosts.sort((a, b) => b.commentCount - a.commentCount)

      setPosts(sortedPosts)
    } catch (err) {
      console.error('Fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isAuthorized) fetchData()
  }, [activeCategory, sortBy])

  const handleDeletePost = async (postId: string) => {
    if (!confirm('정말로 이 게시물을 삭제하시겠습니까? 모든 관련 데이터가 영구적으로 삭제됩니다.')) return
    try {
      const { error } = await supabase.from('posts').delete().eq('id', postId)
      if (error) throw error
      setPosts(posts.filter(p => p.id !== postId))
      setStats(prev => ({ ...prev, totalPosts: prev.totalPosts - 1 }))
    } catch (err: any) { alert(err.message) }
  }

  const handleLogout = () => {
    localStorage.removeItem('isAdminAuthenticated')
    router.replace('/admin/login')
  }

  if (!isAuthorized) return null

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 h-20 flex items-center justify-between px-10 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg">
            <LayoutDashboard className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-black text-gray-900 tracking-tight uppercase">Admin Console</h1>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/" className="text-sm font-bold text-gray-400 hover:text-blue-600 flex items-center gap-2 transition-colors">
            서비스로 돌아가기 <ExternalLink className="w-4 h-4" />
          </Link>
          <button onClick={handleLogout} className="flex items-center gap-2 px-5 py-2.5 bg-gray-50 text-gray-600 font-bold rounded-xl hover:bg-red-50 hover:text-red-600 transition-all text-sm">
            로그아웃 <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      <main className="flex-1 p-10 max-w-[1600px] mx-auto w-full space-y-10">
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { label: '전체 가이드', val: stats.totalPosts, icon: LayoutDashboard, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: '누적 추천 수', val: stats.totalVotes, icon: ThumbsUp, color: 'text-orange-500', bg: 'bg-orange-50' },
            { label: '누적 댓글 수', val: stats.totalComments, icon: MessageSquare, color: 'text-purple-600', bg: 'bg-purple-50' }
          ].map((item, i) => (
            <div key={i} className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-blue-900/5 border border-gray-100 flex items-center justify-between group hover:border-blue-200 transition-all">
              <div>
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">{item.label}</p>
                <p className="text-4xl font-black text-gray-900">{item.val.toLocaleString()}</p>
              </div>
              <div className={`w-16 h-16 ${item.bg} ${item.color} rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform`}>
                <item.icon className="w-8 h-8" />
              </div>
            </div>
          ))}
        </div>

        {/* Management Controls */}
        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-blue-900/5 border border-gray-100 overflow-hidden">
          <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex flex-wrap items-center gap-3">
              {CATEGORIES.map(cat => (
                <button 
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all ${activeCategory === cat ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-900'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <SortButton active={sortBy === 'latest'} onClick={() => setSortBy('latest')}>최신순</SortButton>
                <SortButton active={sortBy === 'helpful'} onClick={() => setSortBy('helpful')}>추천순</SortButton>
                <SortButton active={sortBy === 'comments'} onClick={() => setSortBy('comments')}>댓글순</SortButton>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="p-6 text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">가이드 제목</th>
                  <th className="p-6 text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">작성자</th>
                  <th className="p-6 text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">분류</th>
                  <th className="p-6 text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-50 text-center">반응 (👍/💬)</th>
                  <th className="p-6 text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-50 text-center">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  Array(5).fill(0).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={5} className="p-6 h-20 bg-gray-50/50" />
                    </tr>
                  ))
                ) : posts.length > 0 ? (
                  posts.map((post) => (
                    <tr key={post.id} className="hover:bg-blue-50/10 transition-colors group">
                      <td className="p-6">
                        <div className="flex flex-col">
                          <span className="font-black text-gray-900 text-sm mb-1 group-hover:text-blue-600 transition-colors line-clamp-1">{post.title}</span>
                          <span className="text-[10px] text-gray-400 font-bold">{new Date(post.created_at).toLocaleDateString()}</span>
                        </div>
                      </td>
                      <td className="p-6">
                         <span className="px-3 py-1 bg-gray-100 rounded-lg text-[10px] font-black text-gray-600">{post.author_name || 'Member'}</span>
                      </td>
                      <td className="p-6">
                         <span className="text-xs font-bold text-gray-500">{post.category || '기타'}</span>
                      </td>
                      <td className="p-6 text-center">
                        <div className="flex items-center justify-center gap-4">
                          <span className="flex items-center gap-1.5 text-xs font-black text-orange-500 bg-orange-50 px-3 py-1.5 rounded-xl border border-orange-100">
                             <ThumbsUp className="w-3.5 h-3.5 fill-orange-500" /> {post.voteCount}
                          </span>
                          <span className="flex items-center gap-1.5 text-xs font-black text-purple-600 bg-purple-50 px-3 py-1.5 rounded-xl border border-purple-100">
                             <MessageSquare className="w-3.5 h-3.5 fill-purple-600" /> {post.commentCount}
                          </span>
                        </div>
                      </td>
                      <td className="p-6 text-center">
                        <div className="flex items-center justify-center gap-2">
                           <Link href={`/posts/${post.id}`} target="_blank" className="p-3 text-gray-300 hover:text-blue-600 hover:bg-white rounded-xl transition-all shadow-sm border border-transparent hover:border-blue-100">
                              <ExternalLink className="w-5 h-5" />
                           </Link>
                           <button onClick={() => handleDeletePost(post.id)} className="p-3 text-gray-300 hover:text-red-500 hover:bg-white rounded-xl transition-all shadow-sm border border-transparent hover:border-red-100">
                              <Trash2 className="w-5 h-5" />
                           </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-20 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <ShieldAlert className="w-12 h-12 text-gray-200" />
                        <p className="text-gray-400 font-bold">해당 조건에 맞는 가이드가 없습니다.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Admin Disclaimer Footer */}
      <footer className="p-10 text-center">
         <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">© 2026 HK Magazine AI Management Console. Restricted Access.</p>
      </footer>
    </div>
  )
}

function SortButton({ active, onClick, children }: { active: boolean, onClick: () => void, children: React.ReactNode }) {
  return (
    <button 
      onClick={onClick}
      className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${active ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
    >
      {children}
    </button>
  )
}
