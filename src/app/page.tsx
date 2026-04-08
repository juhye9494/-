'use client'

import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Search, 
  FileText, 
  Image as ImageIcon, 
  Video, 
  Code, 
  PenTool, 
  BarChart, 
  UserCircle, 
  ChevronLeft, 
  ChevronRight,
  Sparkles,
  Clock,
  ArrowRight
} from 'lucide-react'

const CATEGORIES = ['전체', '문서작성', '디자인', '멀티미디어', '개발', '마케팅', '데이터분석', '고객관리', '기타']
const ITEMS_PER_PAGE = 12

export default function Home() {
  const router = useRouter()
  const supabase = createClient()
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('전체')
  const [currentPage, setCurrentPage] = useState(1)

  const fetchPosts = async () => {
    setLoading(true)
    try {
      let query = supabase.from('posts').select('*').order('created_at', { ascending: false })

      if (activeCategory !== '전체') {
        query = query.eq('category', activeCategory)
      }

      const { data, error } = await query
      if (error) throw error
      setPosts(data || [])
    } catch (err) {
      console.error('데이터 조회 오류:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPosts()
    setCurrentPage(1) // Reset to page 1 when category changes
  }, [activeCategory])

  const openSearch = () => {
    window.dispatchEvent(new CustomEvent('open-search'))
  }

  const handleCreateGuide = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      router.push('/posts/new')
    } else {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/posts/new`,
        },
      })
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case '문서작성': return <FileText className="w-5 h-5" />
      case '디자인': return <ImageIcon className="w-5 h-5" />
      case '멀티미디어': return <Video className="w-5 h-5" />
      case '개발': return <Code className="w-5 h-5" />
      case '마케팅': return <PenTool className="w-5 h-5" />
      case '데이터분석': return <BarChart className="w-5 h-5" />
      default: return <Sparkles className="w-5 h-5" />
    }
  }

  // Pagination Logic
  const totalPages = Math.ceil(posts.length / ITEMS_PER_PAGE)
  const displayedPosts = posts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 600, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Hero Section */}
      <section className="bg-white pt-32 pb-24 px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-[2.5rem] md:text-[4rem] font-black text-[#111827] leading-[1.1] mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700 tracking-tight">
            한경매거진앤북<br />
            <span className="text-[#0056FF] drop-shadow-sm">AI 업무 활용 TIP</span>
          </h2>
          <p className="text-xl text-gray-400 mb-14 max-w-2xl mx-auto">
            실제로 검증된 실무 효율 극대화 가이드.<br />
            나만의 노하우를 공유하고 팀원들의 팁을 확인하세요.
          </p>
          
          <div className="relative max-w-2xl mx-auto mb-16 group">
            <button 
              onClick={openSearch}
              className="w-full h-20 pl-16 pr-8 bg-gray-50/50 border-2 border-gray-100 shadow-2xl shadow-blue-900/5 rounded-[2rem] text-left text-gray-400 text-xl hover:ring-4 hover:ring-blue-100 hover:bg-white transition-all cursor-text flex items-center font-bold"
            >
              찾으시는 가이드나 툴 이름을 입력하세요
            </button>
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-7 h-7 text-[#0056FF]" />
          </div>

          <div className="flex flex-wrap justify-center gap-8 text-xs font-black text-gray-500 uppercase tracking-widest">
              <span className="flex items-center gap-3"><span className="w-2 h-2 rounded-full bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.8)]"></span> 실무 활용법</span>
              <span className="flex items-center gap-3"><span className="w-2 h-2 rounded-full bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.8)]"></span> 검증된 팁</span>
              <span className="flex items-center gap-3"><span className="w-2 h-2 rounded-full bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.8)]"></span> 상시 업데이트</span>
          </div>
        </div>
      </section>

      {/* Categories & Listing */}
      <section className="max-w-[1400px] mx-auto px-6 py-20 pb-60">
        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-4 mb-24 animate-in fade-in duration-1000">
          {CATEGORIES.map((cat) => (
            <button 
              key={cat} 
              onClick={() => setActiveCategory(cat)}
              className={`px-8 py-3.5 rounded-[1.25rem] text-sm font-black transition-all border-2 ${activeCategory === cat ? 'bg-[#0056FF] border-[#0056FF] text-white shadow-xl shadow-blue-500/40 scale-110 -translate-y-1' : 'bg-white border-transparent text-gray-400 hover:text-gray-900 hover:border-gray-100 shadow-sm'}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[1,2,3,4,5,6,7,8].map(i => (
              <div key={i} className="h-[400px] bg-white rounded-[2.5rem] animate-pulse border border-gray-50" />
            ))}
          </div>
        ) : posts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 animate-in fade-in duration-500">
              {displayedPosts.map((post) => (
                <Link 
                  key={post.id} 
                  href={`/posts/${post.id}`} 
                  className="group bg-white rounded-[2.5rem] overflow-hidden border border-transparent shadow-xl shadow-blue-900/5 hover:shadow-2xl hover:border-blue-100 hover:-translate-y-2 transition-all duration-500 flex flex-col"
                >
                  <div className="aspect-video bg-gray-50 relative overflow-hidden">
                    {post.image_url ? (
                      <img 
                        src={post.image_url} 
                        alt={post.title} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-200 bg-gradient-to-br from-gray-50 to-gray-200">
                        <ImageIcon className="w-12 h-12 opacity-20" />
                      </div>
                    )}
                    <div className="absolute top-5 left-5">
                      <div className="flex items-center gap-2 bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl text-[#0056FF] shadow-lg">
                        {getCategoryIcon(post.category)}
                        <span className="text-xs font-black tracking-tight">{post.category || '기타'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-8 flex-1 flex flex-col">
                    <h3 className="text-xl font-black mb-4 leading-snug group-hover:text-[#0056FF] transition-colors h-[3.5rem] line-clamp-2 tracking-tight">
                      {post.title}
                    </h3>
                    <p className="text-sm text-gray-400 font-bold mb-8 line-clamp-2 leading-relaxed">
                       {post.description || post.content || '설명이 포함되지 않은 가이드입니다.'}
                    </p>
                    
                    <div className="mt-auto flex justify-between items-center pt-6 border-t border-gray-50">
                      <div className="flex items-center gap-2">
                        <UserCircle className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-bold text-gray-500">
                          작성자: <span className="text-gray-900">{post.author_name || 'Member'}</span>
                        </span>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-gray-50 text-gray-300 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white group-hover:rotate-45 transition-all duration-500 shadow-inner">
                         <ArrowRight className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-24 flex justify-center items-center gap-3">
                <button 
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all border-2 ${currentPage === 1 ? 'border-gray-100 text-gray-300 cursor-not-allowed' : 'border-gray-100 text-gray-600 hover:border-blue-600 hover:text-blue-600 active:scale-95 bg-white shadow-sm'}`}
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                
                <div className="flex items-center gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`w-12 h-12 rounded-2xl text-sm font-black transition-all ${currentPage === page ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-white text-gray-400 hover:bg-gray-50 border border-transparent'}`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button 
                  onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all border-2 ${currentPage === totalPages ? 'border-gray-100 text-gray-300 cursor-not-allowed' : 'border-gray-100 text-gray-600 hover:border-blue-600 hover:text-blue-600 active:scale-95 bg-white shadow-sm'}`}
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-32 bg-white rounded-[4rem] border-2 border-dashed border-gray-100 shadow-xl shadow-blue-900/5">
             <div className="w-24 h-24 bg-blue-50 rounded-[2rem] flex items-center justify-center text-5xl mx-auto mb-8 shadow-inner">📂</div>
             <p className="text-gray-900 text-2xl font-black mb-2 tracking-tight">등록된 가이드가 없습니다.</p>
             <p className="text-gray-400 font-bold mb-10">첫 번째 실무 가이드를 직접 작성해 보세요!</p>
             <button 
               onClick={handleCreateGuide}
               className="px-12 py-5 bg-[#0056FF] text-white font-black rounded-3xl shadow-[0_20px_40px_-10px_rgba(0,86,255,0.4)] hover:scale-105 active:scale-95 transition-all text-lg"
             >
               지금 가이드 공유하기
             </button>
          </div>
        )}
      </section>
    </div>
  )
}
