'use client'

import * as React from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { Search, X, ChevronRight, Video, FileText, Code, Palette, MessageSquare, Sparkles } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { expandSearchTerm } from '@/utils/search-utils'
import Link from 'next/link'

const getCategoryIcon = (category: string) => {
  switch (category) {
    case '개발': return <Code className="w-5 h-5 text-blue-600" />;
    case '디자인': return <Palette className="w-5 h-5 text-purple-600" />;
    case '멀티미디어': return <Video className="w-5 h-5 text-pink-500" />;
    case '문서작성': return <FileText className="w-5 h-5 text-blue-500" />;
    case '고객관리': return <MessageSquare className="w-5 h-5 text-green-500" />;
    default: return <Sparkles className="w-5 h-5 text-gray-400" />;
  }
}

export function SearchModal({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const supabase = createClient()
  const [query, setQuery] = React.useState('')
  const [allPosts, setAllPosts] = React.useState<any[]>([])
  const [results, setResults] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(false)

  // 1. Initial Data Load
  React.useEffect(() => {
    if (open) {
      const loadAllPosts = async () => {
        setLoading(true)
        const { data } = await supabase.from('posts').select('*').order('created_at', { ascending: false })
        setAllPosts(data || [])
        setLoading(false)
      }
      loadAllPosts()
    } else {
      setQuery('')
      setResults([])
    }
  }, [open, supabase])

  // 2. Client-side Search Logic
  React.useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }

    const keywords = expandSearchTerm(query).map(k => k.toLowerCase())
    
    const filtered = allPosts.filter(post => {
      const title = (post.title || '').toLowerCase()
      const desc = (post.description || '').toLowerCase()
      const content = (post.content || '').toLowerCase()
      const author = (post.author_name || '').toLowerCase()
      const tools = Array.isArray(post.tools) ? post.tools.map((t: string) => t.toLowerCase()) : []
      
      return keywords.some(k => 
        title.includes(k) || 
        desc.includes(k) || 
        content.includes(k) || 
        author.includes(k) ||
        tools.some((t: string) => t.includes(k))
      )
    })

    setResults(filtered.slice(0, 10)) // Show top 10 matches
  }, [query, allPosts])

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] animate-in fade-in duration-200" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-2xl bg-white rounded-[2.5rem] shadow-2xl z-[101] overflow-hidden animate-in zoom-in-95 duration-200 outline-none">
          
          {/* Search Header */}
          <div className="p-8 border-b border-gray-50 bg-white">
            <div className="relative flex items-center group">
              <Search className="absolute left-6 w-7 h-7 text-gray-300 group-focus-within:text-blue-500 transition-colors" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="제목, 툴 이름, 내용을 검색하세요"
                className="w-full h-16 pl-16 pr-14 bg-gray-50 border-none rounded-3xl outline-none text-xl font-black transition-all focus:bg-white focus:ring-4 focus:ring-blue-100"
              />
              <Dialog.Close asChild>
                <button className="absolute right-6 p-2 hover:bg-gray-100 rounded-xl transition-all">
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </Dialog.Close>
            </div>
          </div>

          {/* Results Area */}
          <div className="max-h-[60vh] overflow-y-auto min-h-[300px]">
            {loading && allPosts.length === 0 ? (
              <div className="p-20 text-center flex flex-col items-center gap-4">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <p className="font-bold text-gray-400">데이터를 불러오는 중...</p>
              </div>
            ) : !query.trim() ? (
              <div className="p-20 text-center text-gray-400 flex flex-col items-center gap-6">
                <div className="w-20 h-20 bg-gray-50 rounded-[2rem] flex items-center justify-center text-3xl">🔍</div>
                <div>
                   <p className="text-xl font-black text-gray-900 mb-1">무엇을 도와드릴까요?</p>
                   <p className="text-sm font-medium">제목이나 사용된 툴 이름(GPT, 미드저니 등)을 입력해 보세요.</p>
                </div>
              </div>
            ) : results.length > 0 ? (
              <div className="py-6">
                <div className="px-10 py-4 mb-2">
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest">검색 결과 {results.length}건</p>
                </div>
                <div className="space-y-3 px-6">
                  {results.map((post) => (
                    <Link
                      key={post.id}
                      href={`/posts/${post.id}`}
                      onClick={() => onOpenChange(false)}
                      className="group flex items-center gap-6 p-6 hover:bg-blue-50 rounded-[2rem] transition-all border border-transparent hover:border-blue-100"
                    >
                      <div className="w-16 h-16 bg-white shadow-sm flex items-center justify-center rounded-2xl group-hover:shadow-md transition-all border border-gray-50 shrink-0">
                        {getCategoryIcon(post.category)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-black text-gray-900 truncate group-hover:text-blue-600 transition-colors mb-1">{post.title}</h3>
                        <p className="text-sm text-gray-400 font-medium truncate">
                           {(post.description || post.content || '').substring(0, 100)}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 mt-3">
                           <span className="px-2.5 py-1 bg-white border border-gray-100 text-gray-500 text-[10px] font-black rounded-lg uppercase tracking-wider">{post.category || '기타'}</span>
                           {Array.isArray(post.tools) && post.tools.slice(0, 3).map((tool: string, i: number) => (
                             <span key={i} className="px-2.5 py-1 bg-blue-50 text-blue-600 text-[10px] font-black rounded-lg">{tool}</span>
                           ))}
                        </div>
                      </div>
                      <ChevronRight className="w-6 h-6 text-gray-200 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-20 text-center text-gray-400 flex flex-col items-center gap-6">
                <div className="w-20 h-20 bg-red-50 rounded-[2rem] flex items-center justify-center text-3xl opacity-50">📂</div>
                <div>
                  <p className="text-xl font-black text-gray-900 mb-1">검색 결과가 없습니다</p>
                  <p className="text-sm font-medium">다른 키워드로 검색하거나 오타를 확인해 보세요.</p>
                </div>
              </div>
            )}
          </div>

          <div className="p-6 bg-gray-50/50 border-t border-gray-100/50 flex justify-center items-center">
            <span className="text-xs font-black text-gray-400 flex items-center gap-2 tracking-tight">
              <span className="px-2 py-0.5 border border-gray-200 bg-white rounded-md text-[10px]">ESC</span>
              키를 눌러서 닫기
            </span>
          </div>

        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
