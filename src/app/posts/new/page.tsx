'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { uploadImage, uploadFile } from '@/lib/storage-utils'
import { 
  Plus, 
  Trash2, 
  Image as ImageIcon, 
  Clock, 
  DollarSign, 
  User, 
  Tag,
  ArrowLeft,
  Loader2,
  ChevronRight,
  Camera,
  Upload,
  CheckCircle2,
  X,
  Film,
  Paperclip,
  FileText
} from 'lucide-react'

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_FILE_SIZE = 20 * 1024 * 1024;  // 20MB

const CATEGORIES = ['전체', '문서작성', '디자인', '멀티미디어', '개발', '마케팅', '데이터분석', '고객관리', '기타']

const AI_TOOLS_LIST = [
  { name: 'ChatGPT', keywords: ['G', '챗', '지피티', 'GPT', 'chatgpt'] },
  { name: 'Claude', keywords: ['C', '클로드', '쿨', 'claude'] },
  { name: 'Gemini', keywords: ['G', '제미나이', '구글', 'gemini'] },
  { name: 'Midjourney', keywords: ['M', '미드저니', '그림', 'midjourney'] },
  { name: 'Stable Diffusion', keywords: ['S', '스테이블', '스태이블', 'stable'] },
  { name: 'DALL-E', keywords: ['D', '달리', 'dalle'] },
  { name: 'Perplexity', keywords: ['P', '퍼플렉시티', 'perplexity'] },
  { name: 'Notion AI', keywords: ['N', '노션', 'notion'] },
  { name: 'Sora', keywords: ['소라', 'sora'] },
  { name: 'Firefly', keywords: ['파이어플라이', 'fly'] },
  { name: 'Canva', keywords: ['캔바', 'canva'] }
]

interface Step {
  title: string;
  content: string;
  image_urls: string[];
  image_files?: File[];
  preview_urls?: string[];
  video_url?: string;
  video_file?: File;
  video_preview?: string;
  attachments?: { name: string; url: string }[];
  attachment_files?: File[];
}

export default function NewPostPage() {
  const router = useRouter()
  const supabase = createClient()
  
  // Metadata States
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('기타')
  const [description, setDescription] = useState('')
  const [authorName, setAuthorName] = useState('')
  const [cost, setCost] = useState('')
  const [workingTime, setWorkingTime] = useState('')
  const [costSaving, setCostSaving] = useState('')
  
  // Image States
  const [featuredImage, setFeaturedImage] = useState<File | null>(null)
  const [featuredPreview, setFeaturedPreview] = useState<string>('')
  
  // Structured Content States
  const [steps, setSteps] = useState<Step[]>([{ title: '', content: '', image_urls: [] }])
  const [tips, setTips] = useState<string[]>([''])
  const [tools, setTools] = useState<string[]>([''])
  const [links, setLinks] = useState<string[]>([''])

  // Suggestion States
  const [activeToolSuggestIdx, setActiveToolSuggestIdx] = useState<number | null>(null)
  const [filteredTools, setFilteredTools] = useState<string[]>([])
  
  const [isLoading, setIsLoading] = useState(false)
  const [readingTime, setReadingTime] = useState(0)

  // Auth Check
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.replace('/')
      }
    }
    checkUser()
  }, [router, supabase])

  // Reading Time Logic
  useEffect(() => {
    const totalChars = title.length + 
                       description.length + 
                       workingTime.length +
                       costSaving.length +
                       steps.reduce((acc, step) => acc + step.title.length + step.content.length, 0)
    setReadingTime(Math.max(1, Math.ceil(totalChars / 200)))
  }, [title, description, steps])

  // Handlers for dynamic arrays
  const addStep = () => setSteps([...steps, { title: '', content: '', image_urls: [] }])
  const removeStep = (index: number) => {
    if (steps.length > 1) {
      const newSteps = steps.filter((_, i) => i !== index)
      setSteps(newSteps)
    }
  }
  const updateStep = (index: number, field: keyof Step, value: any) => {
    const newSteps = [...steps]
    const step = { ...newSteps[index] }

    if (field === 'image_files') {
      const files = Array.from(value as FileList)
      const validFiles = files.filter(f => {
        if (f.size > MAX_IMAGE_SIZE) {
          alert(`'${f.name}' 이미지가 10MB를 초과하여 제외되었습니다.`);
          return false;
        }
        return true;
      });
      if (validFiles.length > 0) {
        const newPreviews = validFiles.map(f => URL.createObjectURL(f))
        step.image_files = [...(step.image_files || []), ...validFiles]
        step.preview_urls = [...(step.preview_urls || []), ...newPreviews]
      }
    } else if (field === 'video_file') {
      const file = value as File;
      if (file.size > MAX_VIDEO_SIZE) {
        alert('동영상 파일 크기는 50MB를 초과할 수 없습니다.');
        return;
      }
      step.video_file = file;
      step.video_preview = URL.createObjectURL(file);
    } else if (field === 'attachment_files') {
      const files = Array.from(value as FileList)
      const validFiles = files.filter(f => {
        if (f.size > MAX_FILE_SIZE) {
          alert(`'${f.name}' 파일이 20MB를 초과하여 제외되었습니다.`);
          return false;
        }
        return true;
      });
      step.attachment_files = [...(step.attachment_files || []), ...validFiles];
    } else if (field === 'title' || field === 'content') {
      step[field] = value as string
    }
    
    newSteps[index] = step
    setSteps(newSteps)
  }

  const removeStepImage = (stepIdx: number, imgIdx: number) => {
    const newSteps = [...steps]
    const step = { ...newSteps[stepIdx] }
    step.image_files = step.image_files?.filter((_, i) => i !== imgIdx)
    step.preview_urls = step.preview_urls?.filter((_, i) => i !== imgIdx)
    newSteps[stepIdx] = step
    setSteps(newSteps)
  }

  const handleFeaturedImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > MAX_IMAGE_SIZE) {
        alert('대표 이미지는 10MB를 초과할 수 없습니다.');
        return;
      }
      setFeaturedImage(file)
      setFeaturedPreview(URL.createObjectURL(file))
    }
  }

  const removeStepVideo = (stepIdx: number) => {
    const newSteps = [...steps];
    newSteps[stepIdx].video_file = undefined;
    newSteps[stepIdx].video_preview = undefined;
    setSteps(newSteps);
  }

  const removeStepAttachment = (stepIdx: number, fileIdx: number) => {
    const newSteps = [...steps];
    newSteps[stepIdx].attachment_files = newSteps[stepIdx].attachment_files?.filter((_, i) => i !== fileIdx);
    setSteps(newSteps);
  }

  const addTip = () => setTips([...tips, ''])
  const removeTip = (index: number) => setTips(tips.filter((_, i) => i !== index))
  const updateTip = (index: number, value: string) => {
    const newTips = [...tips]
    newTips[index] = value
    setTips(newTips)
  }

  const addTool = () => setTools([...tools, ''])
  const removeTool = (index: number) => setTools(tools.filter((_, i) => i !== index))
  const updateTool = (index: number, value: string) => {
    const newTools = [...tools]
    newTools[index] = value
    setTools(newTools)

    // AI 도구 추천 필터링
    if (value.trim()) {
      const suggestions = AI_TOOLS_LIST.filter(tool => 
        tool.name.toLowerCase().includes(value.toLowerCase()) ||
        tool.keywords.some(kw => kw.toLowerCase().includes(value.toLowerCase()))
      ).map(t => t.name)
      setFilteredTools(suggestions)
      setActiveToolSuggestIdx(index)
    } else {
      setFilteredTools([])
      setActiveToolSuggestIdx(null)
    }
  }

  const selectToolSuggestion = (index: number, toolName: string) => {
    const newTools = [...tools]
    newTools[index] = toolName
    setTools(newTools)
    setFilteredTools([])
    setActiveToolSuggestIdx(null)
  }

  const addLink = () => setLinks([...links, ''])
  const removeLink = (index: number) => setLinks(links.filter((_, i) => i !== index))
  const updateLink = (index: number, value: string) => {
    const newLinks = [...links]
    newLinks[index] = value
    setLinks(newLinks)
  }

  const handleSubmit = async (e: React.FormEvent, status: 'published' | 'draft' = 'published') => {
    e.preventDefault()
    if (!title.trim()) { alert('제목을 입력해주세요.'); return; }
    
    // Only validate full requirements if publishing
    if (status === 'published') {
      if (!description.trim()) { alert('설명을 입력해주세요.'); return; }
      if (!category) { alert('카테고리를 선택해주세요.'); return; }
    }

    setIsLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { alert('로그인이 필요합니다.'); return; }

      // 1. Featured Image Upload
      let featured_image_url = ''
      if (featuredImage) {
        featured_image_url = await uploadImage(featuredImage)
      }

      // 2. Step Media Upload
      const finalSteps = await Promise.all(steps.map(async (step, idx) => {
        // Upload Images
        const uploadedImageUrls = []
        if (step.image_files && step.image_files.length > 0) {
          for (const file of step.image_files) {
            const url = await uploadImage(file)
            uploadedImageUrls.push(url)
          }
        }

        // Upload Video
        let video_url = ''
        if (step.video_file) {
          const result = await uploadFile(step.video_file, 'post-videos')
          video_url = result.url
        }

        // Upload Attachments
        const attachments = []
        if (step.attachment_files && step.attachment_files.length > 0) {
          for (const file of step.attachment_files) {
            const result = await uploadFile(file, 'post-attachments')
            attachments.push({ name: result.name, url: result.url })
          }
        }

        return {
          title: step.title,
          content: step.content,
          image_urls: uploadedImageUrls,
          image_url: uploadedImageUrls[0] || '',
          video_url,
          attachments
        }
      }))

      // 3. Database Insert
      const { error } = await supabase.from('posts').insert({
        title,
        category,
        description,
        author_name: authorName,
        reading_time: readingTime,
        cost,
        working_time: workingTime,
        cost_saving: costSaving,
        image_url: featured_image_url,
        steps: finalSteps,
        tips: tips.filter(t => t.trim()),
        tools: tools.filter(t => t.trim()),
        links: links.filter(l => l.trim()),
        user_id: user.id,
        content: description, // fallback
        status // 'published' or 'draft'
      })

      if (error) throw error

      alert(status === 'draft' ? '임시 저장되었습니다.' : '나만의 가이드가 등록되었습니다!')
      router.push('/')
      router.refresh()
    } catch (error: any) {
      console.error('Registration error:', error)
      
      let errorMessage = error.message
      if (errorMessage === 'Failed to fetch') {
        errorMessage = '서버에 연결할 수 없습니다. 인터넷 연결이나 Vercel 환경 변수(Supabase URL) 설정을 확인해 주세요.'
      }
      
      alert(`등록 실패: ${errorMessage}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24">
      {/* Header Bar */}
      <div className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-20 flex items-center justify-between">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors font-bold text-sm"
          >
            <ArrowLeft className="w-5 h-5" /> 나가기
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 pt-12 space-y-12">
        {/* Cover Image Section */}
        <section className="bg-white rounded-[3rem] p-10 shadow-xl shadow-blue-900/5 relative overflow-hidden group border border-gray-100">
           <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-black flex items-center gap-3">
                <div className="w-2 h-6 bg-blue-600 rounded-full" />
                커버 이미지 설정
              </h2>
           </div>
           
           <label className="relative block w-full rounded-[2.5rem] bg-gray-50 border-2 border-dashed border-gray-200 hover:border-blue-400 hover:bg-blue-50/30 transition-all cursor-pointer overflow-hidden group min-h-[200px]">
              <input type="file" accept="image/*" onChange={handleFeaturedImageChange} className="hidden" />
              {featuredPreview ? (
                <div className="relative w-full">
                  <img src={featuredPreview} alt="Cover Preview" className="w-full h-auto max-h-[500px] object-contain mx-auto transition-transform group-hover:scale-105" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="flex items-center gap-2 text-white font-bold">
                       <Camera className="w-6 h-6" /> 커버 변경하기
                    </div>
                  </div>
                </div>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                   <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4 text-blue-600">
                     <ImageIcon className="w-8 h-8" />
                   </div>
                   <p className="font-bold text-lg mb-1">가이드 대표 사진을 등록하세요</p>
                   <p className="text-sm font-medium text-gray-400">가이드 목록에 표시될 썸네일로 사용됩니다.</p>
                </div>
              )}
           </label>
        </section>

        {/* Basic Info Section */}
        <section className="bg-white rounded-[3rem] p-12 shadow-xl shadow-blue-900/5 border border-gray-100">
          <h2 className="text-xl font-black mb-10 flex items-center gap-3">
            <div className="w-2 h-6 bg-blue-600 rounded-full" />
            기본 정보 작성
          </h2>
          <div className="space-y-10">
            <div>
              <label className="block text-sm font-black text-gray-400 uppercase tracking-widest mb-3">가이드 제목</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="어떤 AI 가이드를 공유하고 싶으신가요?"
                className="w-full h-16 px-8 bg-gray-50 border-none rounded-3xl text-2xl font-black focus:ring-4 focus:ring-blue-100 transition-all shadow-inner"
              />
            </div>

            <div>
              <label className="block text-sm font-black text-gray-400 uppercase tracking-widest mb-3">설명 (짧은 한마디)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="이 가이드를 따라하면 무엇을 얻을 수 있나요?"
                className="w-full p-8 bg-gray-50 border-none rounded-[2rem] text-lg font-medium focus:ring-4 focus:ring-blue-100 transition-all shadow-inner resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <label className="block text-sm font-black text-gray-400 uppercase tracking-widest mb-3">카테고리</label>
                <div className="relative">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full h-14 px-6 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-blue-100 font-bold appearance-none shadow-sm"
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <ChevronRight className="w-5 h-5 rotate-90" />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-black text-gray-400 uppercase tracking-widest mb-3">작성자 명칭</label>
                <input
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="예: 마케터 제이"
                  className="w-full h-14 px-6 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-blue-100 font-bold shadow-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-black text-gray-400 uppercase tracking-widest mb-3">소요 비용</label>
                <input
                  type="text"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  placeholder="예: 월 3만원"
                  className="w-full h-14 px-6 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-blue-100 font-bold shadow-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-black text-gray-400 uppercase tracking-widest mb-3">작업 시간</label>
                <input
                  type="text"
                  value={workingTime}
                  onChange={(e) => setWorkingTime(e.target.value)}
                  placeholder="예: 약 1시간"
                  className="w-full h-14 px-6 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-blue-100 font-bold shadow-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-black text-gray-400 uppercase tracking-widest mb-3">비용 절감</label>
                <input
                  type="text"
                  value={costSaving}
                  onChange={(e) => setCostSaving(e.target.value)}
                  placeholder="예: 연간 500만원 절감"
                  className="w-full h-14 px-6 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-blue-100 font-bold shadow-sm"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Step-by-Step Guide */}
        <section className="space-y-10">
           <div className="flex items-center justify-between">
             <h2 className="text-2xl font-black flex items-center gap-4">
               <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
                 <ChevronRight className="w-6 h-6" />
               </div>
               단계별 상세 가이드
             </h2>
           </div>

           <div className="space-y-8">
             {steps.map((step, index) => (
               <div key={index} className="bg-white rounded-[3rem] p-10 shadow-xl shadow-blue-900/5 border border-gray-100 relative group animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="absolute -left-4 -top-4 w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 font-black text-xl shadow-sm border-4 border-white z-10">
                    {index + 1}
                  </div>
                  
                  <button onClick={() => removeStep(index)} className="absolute right-8 top-8 p-2 text-gray-200 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all">
                    <X className="w-6 h-6" />
                  </button>

                  <div className="space-y-8">
                    {/* Text Inputs */}
                    <div className="space-y-6">
                      <input 
                        value={step.title}
                        onChange={(e) => updateStep(index, 'title', e.target.value)}
                        className="w-full text-2xl font-black placeholder:text-gray-200 border-none focus:ring-0 p-0"
                        placeholder="이 단계에서 수행할 핵심 내용을 작성해 주세요"
                      />
                      <textarea 
                        value={step.content}
                        onChange={(e) => updateStep(index, 'content', e.target.value)}
                        className="w-full text-lg font-medium text-gray-500 placeholder:text-gray-200 border-none focus:ring-0 p-0 min-h-[120px] resize-none"
                        placeholder="상세한 조작 방법이나 노하우를 공유해 주세요. (예: 어떤 버튼을 클릭해야 하는지, 입력할 프롬프트는 무엇인지 등)"
                      />
                    </div>

                    {/* Multi Image Upload UI */}
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {step.preview_urls?.map((url, imgIdx) => (
                          <div key={imgIdx} className="relative w-full rounded-2xl overflow-hidden border-2 border-gray-50 group/img bg-gray-50">
                            <img src={url} alt="Step preview" className="w-full h-auto max-h-[400px] object-contain mx-auto" />
                            <button 
                              onClick={() => removeStepImage(index, imgIdx)}
                              className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-lg opacity-0 group-hover/img:opacity-100 transition-opacity"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        
                        <label className="flex flex-col items-center justify-center aspect-video rounded-2xl border-2 border-dashed border-gray-100 bg-gray-50/50 hover:bg-gray-50 hover:border-blue-200 transition-all cursor-pointer group/upload">
                          <input 
                            type="file" 
                            multiple
                            className="hidden" 
                            accept="image/*"
                            onChange={(e) => updateStep(index, 'image_files', e.target.files)}
                          />
                          <Upload className="w-6 h-6 text-gray-300 group-hover/upload:text-blue-400 mb-2 transition-colors" />
                          <span className="text-xs font-bold text-gray-400 group-hover/upload:text-blue-500">사진 추가</span>
                        </label>
                      </div>
                    </div>

                    {/* Step Media Upload Buttons (Video & File) */}
                    <div className="flex flex-wrap gap-4 pt-4 border-t border-gray-50">
                      <div>
                        <label className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-600 rounded-xl cursor-pointer hover:bg-purple-100 transition-colors text-sm font-bold">
                          <input 
                            type="file" 
                            className="hidden" 
                            accept="video/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) updateStep(index, 'video_file', file);
                            }}
                          />
                          <Film className="w-4 h-4" />
                          동영상 추가
                        </label>
                      </div>

                      <div>
                        <label className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-xl cursor-pointer hover:bg-green-100 transition-colors text-sm font-bold">
                          <input 
                            type="file" 
                            multiple
                            className="hidden" 
                            onChange={(e) => updateStep(index, 'attachment_files', e.target.files)}
                          />
                          <Paperclip className="w-4 h-4" />
                          파일 첨부
                        </label>
                      </div>
                    </div>

                    {/* Step Video Preview */}
                    {step.video_preview && (
                      <div className="relative rounded-2xl overflow-hidden bg-black border border-gray-100 aspect-video">
                        <video src={step.video_preview} controls className="w-full h-full object-contain" />
                        <button 
                          onClick={() => removeStepVideo(index)}
                          className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-xl hover:bg-black/70 transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    )}

                    {/* Step Attachments List */}
                    {step.attachment_files && step.attachment_files.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">첨부 파일 목록</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {step.attachment_files.map((file, fIdx) => (
                            <div key={fIdx} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 group/file">
                              <div className="flex items-center gap-2 min-w-0">
                                <FileText className="w-4 h-4 text-green-600 flex-shrink-0" />
                                <span className="text-xs font-bold text-gray-600 truncate">{file.name}</span>
                              </div>
                              <button 
                                onClick={() => removeStepAttachment(index, fIdx)}
                                className="text-gray-300 hover:text-red-500 transition-colors"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
             ))}

             {/* Add Step Button Moved to Bottom */}
             <button 
               onClick={addStep} 
               className="w-full py-6 bg-white rounded-[2rem] border-2 border-dashed border-gray-100 text-gray-400 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50/30 transition-all flex items-center justify-center gap-3 group"
             >
               <Plus className="w-6 h-6 group-hover:scale-110 transition-transform" />
               <span className="font-black text-lg">새로운 단계 추가하기</span>
             </button>
           </div>
        </section>

        {/* Section 4: Tips & Tools */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pb-20">
           <section className="bg-white rounded-[3rem] p-12 shadow-xl shadow-blue-900/5 border border-gray-100">
              <div className="flex items-center justify-between mb-10">
                <h2 className="text-xl font-black flex items-center gap-3">
                  <div className="w-2 h-6 bg-orange-400 rounded-full" />
                  핵심 팁 리스트
                </h2>
                <button onClick={addTip} className="p-3 bg-orange-50 text-orange-600 rounded-xl hover:bg-orange-100 transition-all"><Plus className="w-5 h-5"/></button>
              </div>
              <div className="space-y-4">
                {tips.map((tip, i) => (
                  <div key={i} className="flex gap-3 group">
                     <input 
                      value={tip}
                      onChange={(e) => updateTip(i, e.target.value)}
                      className="flex-1 h-12 px-5 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-4 focus:ring-orange-100 transition-all"
                      placeholder="단 한줄의 꿀팁!"
                     />
                     <button onClick={() => removeTip(i)} className="text-gray-200 hover:text-red-400 transition-colors"><X className="w-5 h-5"/></button>
                  </div>
                ))}
              </div>
           </section>

           <section className="bg-white rounded-[3rem] p-12 shadow-xl shadow-blue-900/5 border border-gray-100">
              <div className="flex items-center justify-between mb-10">
                <h2 className="text-xl font-black flex items-center gap-3">
                  <div className="w-2 h-6 bg-purple-500 rounded-full" />
                  사용된 AI 도구
                </h2>
                <button onClick={addTool} className="p-3 bg-purple-50 text-purple-600 rounded-xl hover:bg-purple-100 transition-all"><Plus className="w-5 h-5"/></button>
              </div>
              <div className="space-y-4">
                {tools.map((tool, i) => (
                  <div key={i} className="flex gap-3 group relative">
                     <div className="flex-1 relative">
                        <input 
                          value={tool}
                          onChange={(e) => updateTool(i, e.target.value)}
                          onFocus={() => {
                            if (tool.trim()) updateTool(i, tool)
                          }}
                          className="w-full h-12 px-5 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-4 focus:ring-purple-100 transition-all"
                          placeholder="도구 이름(예: Chat GPT)"
                        />
                        
                        {/* Suggestion Dropdown */}
                        {activeToolSuggestIdx === i && filteredTools.length > 0 && (
                          <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 z-[60] overflow-hidden py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                             {filteredTools.map((suggestion) => (
                               <button
                                 key={suggestion}
                                 onClick={() => selectToolSuggestion(i, suggestion)}
                                 className="w-full px-5 py-3 text-left text-sm font-bold text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors flex items-center justify-between group/item"
                               >
                                 {suggestion}
                                 <Plus className="w-4 h-4 opacity-0 group-hover/item:opacity-100 transition-opacity" />
                               </button>
                             ))}
                          </div>
                        )}
                     </div>
                     <button onClick={() => removeTool(i)} className="text-gray-200 hover:text-red-400 transition-colors"><X className="w-5 h-5"/></button>
                  </div>
                ))}
              </div>
           </section>
        </div>

        {/* Section 5: Reference Links */}
        <section className="bg-white rounded-[3rem] p-12 shadow-xl shadow-blue-900/5 border border-gray-100">
           <div className="flex items-center justify-between mb-10">
             <h2 className="text-xl font-black flex items-center gap-3">
               <div className="w-2 h-6 bg-green-500 rounded-full" />
               참고 링크 (도움되는 URL)
             </h2>
             <button onClick={addLink} className="p-3 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 transition-all">
               <Plus className="w-5 h-5" />
             </button>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {links.map((link, i) => (
               <div key={i} className="flex gap-3 group">
                  <div className="flex-1 relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                       <Tag className="w-4 h-4" />
                    </div>
                    <input 
                      value={link}
                      onChange={(e) => updateLink(i, e.target.value)}
                      className="w-full h-12 pl-11 pr-5 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-4 focus:ring-green-100 transition-all"
                      placeholder="https://example.com"
                    />
                  </div>
                  <button onClick={() => removeLink(i)} className="text-gray-200 hover:text-red-400 transition-colors">
                    <X className="w-5 h-5" />
                  </button>
               </div>
             ))}
           </div>
           {links.length === 0 && (
             <p className="text-center text-gray-400 py-4 text-sm font-medium">참고할만한 웹사이트나 문서 링크를 추가해 보세요.</p>
           )}
        </section>

        {/* Bottom Action Footer */}
        <div className="max-w-2xl mx-auto pt-10 pb-20 text-center space-y-8 animate-in fade-in slide-in-from-bottom-8">
           <div className="inline-flex flex-col items-center px-8 py-4 bg-white rounded-3xl shadow-sm border border-gray-50">
             <span className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mb-1">가이드 예상 소요 시간</span>
             <div className="flex items-center gap-2 text-blue-600">
                <Clock className="w-5 h-5" />
                <span className="text-xl font-black">약 {readingTime}분 분량</span>
             </div>
           </div>

           <div className="space-y-4">
             <div className="flex flex-col sm:flex-row gap-4">
               <button
                 type="button"
                 onClick={(e) => handleSubmit(e, 'draft')}
                 disabled={isLoading}
                 className="flex-1 py-6 bg-white border-2 border-blue-100 text-blue-600 text-xl font-black rounded-[2rem] transition-all hover:bg-blue-50 active:scale-95 transform flex items-center justify-center gap-4"
               >
                 {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Clock className="w-6 h-6" />}
                 임시 저장하기
               </button>
               <button
                 onClick={(e) => handleSubmit(e, 'published')}
                 disabled={isLoading}
                 className="flex-[2] py-6 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-xl font-black rounded-[2rem] transition-all shadow-2xl shadow-blue-500/30 flex items-center justify-center gap-4 active:scale-95 transform"
               >
                 {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <CheckCircle2 className="w-6 h-6" />}
                 {isLoading ? '나만의 가이드 저장 중...' : '가이드 공유하기'}
               </button>
             </div>
             <p className="text-gray-400 font-medium text-sm">
               공유된 가이드는 즉시 플랫폼에 노출되어 동료들에게 큰 도움이 됩니다.
             </p>
           </div>
        </div>
      </div>
    </div>
  )
}
