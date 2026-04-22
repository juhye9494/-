'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { 
  X, 
  Plus, 
  Upload, 
  ImageIcon, 
  ChevronRight, 
  Loader2, 
  CheckCircle2,
  Tag,
  Clock,
  Wrench,
  Trash2,
  Film,
  Paperclip,
  FileText
} from 'lucide-react'
import { uploadImage, uploadFile } from '@/lib/storage-utils'

const CATEGORIES = ['전체', '문서작성', '디자인', '멀티미디어', '개발', '마케팅', '데이터분석', '고객관리', '기타']

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_FILE_SIZE = 20 * 1024 * 1024;  // 20MB

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

interface EditGuideDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (updatedData: any) => Promise<void>;
  guide: any;
}

export function EditGuideDialog({ isOpen, onClose, onSubmit, guide }: EditGuideDialogProps) {
  const [title, setTitle] = useState(guide.title || '')
  const [category, setCategory] = useState(guide.category || '기타')
  const [description, setDescription] = useState(guide.description || '')
  const [authorName, setAuthorName] = useState(guide.author_name || '')
  const [cost, setCost] = useState(guide.cost || '')
  const [workingTime, setWorkingTime] = useState(guide.working_time || '')
  const [costSaving, setCostSaving] = useState(guide.cost_saving || '')
  
  const [featuredPreview, setFeaturedPreview] = useState(guide.image_url || '')
  const [featuredImageFile, setFeaturedImageFile] = useState<File | null>(null)
  
  const [steps, setSteps] = useState<Step[]>(
    guide.steps?.map((s: any) => ({
      title: s.title || '',
      content: s.content || '',
      image_urls: s.image_urls || [s.image_url].filter(Boolean) || [],
      preview_urls: s.image_urls || [s.image_url].filter(Boolean) || [],
      video_url: s.video_url || '',
      video_preview: s.video_url || '',
      attachments: s.attachments || []
    })) || [{ title: '', content: '', image_urls: [] }]
  )
  const [tips, setTips] = useState<string[]>(guide.tips || [''])
  const [tools, setTools] = useState<string[]>(guide.tools || [''])
  const [links, setLinks] = useState<string[]>(guide.links || [''])

  const [activeToolSuggestIdx, setActiveToolSuggestIdx] = useState<number | null>(null)
  const [filteredTools, setFilteredTools] = useState<string[]>([])
  
  const [status, setStatus] = useState(guide.status || 'published')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Sync when guide changes
  useEffect(() => {
    if (guide) {
      setTitle(guide.title || '')
      setCategory(guide.category || '기타')
      setDescription(guide.description || '')
      setAuthorName(guide.author_name || '')
      setCost(guide.cost || '')
      setWorkingTime(guide.working_time || '')
      setCostSaving(guide.cost_saving || '')
      setFeaturedPreview(guide.image_url || '')
      setSteps(guide.steps?.map((s: any) => ({
        title: s.title || '',
        content: s.content || '',
        image_urls: s.image_urls || [s.image_url].filter(Boolean) || [],
        preview_urls: s.image_urls || [s.image_url].filter(Boolean) || [],
        video_url: s.video_url || '',
        video_preview: s.video_url || '',
        attachments: s.attachments || []
      })) || [{ title: '', content: '', image_urls: [] }])
      setTips(guide.tips || [''])
      setTools(guide.tools || [''])
      setLinks(guide.links || [''])
      setStatus(guide.status || 'published')
    }
  }, [guide])

  const handleFeaturedImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFeaturedImageFile(file)
      setFeaturedPreview(URL.createObjectURL(file))
    }
  }

  const addStep = () => setSteps([...steps, { title: '', content: '', image_urls: [] }])
  const removeStep = (index: number) => {
    if (steps.length > 1) setSteps(steps.filter((_, i) => i !== index))
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
        alert('동영상은 50MB를 초과할 수 없습니다.');
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
    } else {
      (step as any)[field] = value
    }
    newSteps[index] = step
    setSteps(newSteps)
  }

  const removeStepVideo = (stepIdx: number) => {
    const newSteps = [...steps];
    newSteps[stepIdx].video_file = undefined;
    newSteps[stepIdx].video_preview = undefined;
    newSteps[stepIdx].video_url = undefined;
    setSteps(newSteps);
  }

  const removeStepAttachment = (stepIdx: number, fIdx: number, isExisting: boolean = false) => {
    const newSteps = [...steps];
    if (isExisting) {
      newSteps[stepIdx].attachments = newSteps[stepIdx].attachments?.filter((_, i) => i !== fIdx);
    } else {
      newSteps[stepIdx].attachment_files = newSteps[stepIdx].attachment_files?.filter((_, i) => i !== fIdx);
    }
    setSteps(newSteps);
  }

  const removeStepImage = (stepIdx: number, imgIdx: number) => {
    const newSteps = [...steps]
    const step = { ...newSteps[stepIdx] }
    // If it's a file being added now
    const fileCount = step.image_files?.length || 0
    const urlCount = step.image_urls?.length || 0
    
    // Simple approach: clear all based on preview index
    step.preview_urls = step.preview_urls?.filter((_, i) => i !== imgIdx)
    // Map preview index back to files/urls
    // This is a bit complex, let's simplify for the edit mode:
    step.image_urls = step.image_urls.filter((_, i) => i !== imgIdx)
    step.image_files = step.image_files?.filter((_, i) => i !== (imgIdx - urlCount))
    
    newSteps[stepIdx] = step
    setSteps(newSteps)
  }

  const updateTool = (index: number, value: string) => {
    const newTools = [...tools]
    newTools[index] = value
    setTools(newTools)
    if (value.trim()) {
      const suggestions = AI_TOOLS_LIST.filter(t => 
        t.name.toLowerCase().includes(value.toLowerCase()) ||
        t.keywords.some(kw => kw.toLowerCase().includes(value.toLowerCase()))
      ).map(t => t.name)
      setFilteredTools(suggestions)
      setActiveToolSuggestIdx(index)
    } else {
      setFilteredTools([])
      setActiveToolSuggestIdx(null)
    }
  }

  const handleSave = async (newStatus?: 'published' | 'draft') => {
    const finalStatus = newStatus || status
    
    if (!title.trim()) { alert('제목을 입력해주세요.'); return; }
    
    // Validation for publishing
    if (finalStatus === 'published') {
      if (!description.trim()) { alert('설명을 입력해주세요.'); return; }
    }

    setIsSubmitting(true)
    try {
      // 1. Upload Featured Image if changed
      let final_featured_url = featuredPreview
      if (featuredImageFile) {
        final_featured_url = await uploadImage(featuredImageFile)
      }

      // 2. Upload Step Media
      const finalSteps = await Promise.all(steps.map(async (step) => {
        // Upload Images
        const uploadedUrls = [...step.image_urls]
        if (step.image_files && step.image_files.length > 0) {
          for (const file of step.image_files) {
            const url = await uploadImage(file)
            uploadedUrls.push(url)
          }
        }

        // Upload Video
        let video_url = step.video_url
        if (step.video_file) {
          const result = await uploadFile(step.video_file, 'post-videos')
          video_url = result.url
        }

        // Upload Attachments
        const finalAttachments = [...(step.attachments || [])]
        if (step.attachment_files && step.attachment_files.length > 0) {
          for (const file of step.attachment_files) {
            const result = await uploadFile(file, 'post-attachments')
            finalAttachments.push({ name: result.name, url: result.url })
          }
        }

        return {
          title: step.title,
          content: step.content,
          image_urls: uploadedUrls,
          image_url: uploadedUrls[0] || '',
          video_url,
          attachments: finalAttachments
        }
      }))

      const updatedPost = {
        title,
        category,
        description,
        author_name: authorName,
        cost,
        working_time: workingTime,
        cost_saving: costSaving,
        image_url: final_featured_url,
        steps: finalSteps,
        tips: tips.filter(t => t.trim()),
        tools: tools.filter(t => t.trim()),
        links: links.filter(l => l.trim()),
        status: finalStatus
      }

      await onSubmit(updatedPost)
      onClose()
    } catch (error) {
      console.error(error)
      alert('수정 중 오류가 발생했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
            onClick={onClose}
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-5xl max-h-[90vh] bg-[#F8FAFC] rounded-[3rem] shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="px-10 py-8 bg-white border-b flex items-center justify-between shrink-0">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                    <Wrench className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-gray-900">가이드 수정하기</h2>
                    <p className="text-sm font-medium text-gray-400">내용을 자유롭게 다듬고 고도화해보세요.</p>
                  </div>
               </div>
               <button onClick={onClose} className="p-3 hover:bg-gray-100 rounded-2xl transition-colors">
                 <X className="w-6 h-6 text-gray-400" />
               </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-10 space-y-12 bg-[#F8FAFC]">
               {/* Cover Image */}
               <section className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
                  <h3 className="text-lg font-black mb-6 flex items-center gap-2">
                    <div className="w-1.5 h-5 bg-blue-600 rounded-full" />
                    커버 이미지
                  </h3>
                  <label className="relative block w-full rounded-[2.5rem] bg-gray-50 border-2 border-dashed border-gray-200 overflow-hidden cursor-pointer group min-h-[150px]">
                    <input type="file" className="hidden" accept="image/*" onChange={handleFeaturedImageChange} />
                    {featuredPreview ? (
                      <img src={featuredPreview} alt="Cover" className="w-full h-auto max-h-[400px] object-contain mx-auto" />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                        <Upload className="w-8 h-8 mb-2" />
                        <span className="font-bold">커버 사진 업로드</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold">변경하기</div>
                  </label>
               </section>

               {/* Basic Info */}
               <section className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="col-span-full">
                      <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">가이드 제목</label>
                      <input value={title} onChange={e => setTitle(e.target.value)} className="w-full h-14 px-6 bg-gray-50 border-none rounded-2xl font-black text-xl focus:ring-2 focus:ring-blue-100" />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">카테고리</label>
                      <select value={category} onChange={e => setCategory(e.target.value)} className="w-full h-14 px-6 bg-gray-50 border-none rounded-2xl font-bold">
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">공개된 작성자 명칭</label>
                      <input value={authorName} onChange={e => setAuthorName(e.target.value)} className="w-full h-14 px-6 bg-gray-50 border-none rounded-2xl font-bold" />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">소요 비용</label>
                      <input value={cost} onChange={e => setCost(e.target.value)} className="w-full h-14 px-6 bg-gray-50 border-none rounded-2xl font-bold" placeholder="예: 월 3만원" />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">작업 시간</label>
                      <input value={workingTime} onChange={e => setWorkingTime(e.target.value)} className="w-full h-14 px-6 bg-gray-50 border-none rounded-2xl font-bold" placeholder="예: 약 1시간" />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">비용 절감</label>
                      <input value={costSaving} onChange={e => setCostSaving(e.target.value)} className="w-full h-14 px-6 bg-gray-50 border-none rounded-2xl font-bold" placeholder="예: 연간 500만원 절감" />
                    </div>
                  </div>
               </section>

               {/* Steps */}
               <section className="space-y-8">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-black text-gray-900 border-l-4 border-blue-600 pl-4">단계별 상세 가이드</h3>
                  </div>
                  <div className="space-y-6">
                    {steps.map((step, idx) => (
                      <div key={idx} className="bg-white rounded-[2.5rem] p-8 border border-gray-100 relative group">
                        <button onClick={() => removeStep(idx)} className="absolute right-6 top-6 p-2 text-gray-200 hover:text-red-400 transition-colors"><X className="w-5 h-5"/></button>
                        <div className="space-y-6">
                          <input value={step.title} onChange={e => updateStep(idx, 'title', e.target.value)} placeholder="단계 제목" className="w-full text-xl font-black border-none p-0 focus:ring-0 placeholder:text-gray-200" />
                          <textarea value={step.content} onChange={e => updateStep(idx, 'content', e.target.value)} placeholder="상세 설명" className="w-full text-gray-500 font-medium border-none p-0 focus:ring-0 min-h-[100px] resize-none" />
                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {step.preview_urls?.map((url, imgIdx) => (
                              <div key={imgIdx} className="relative w-full rounded-xl overflow-hidden group/img bg-gray-50">
                                <img src={url} alt="step" className="w-full h-auto max-h-[200px] object-contain mx-auto" />
                                <button onClick={() => removeStepImage(idx, imgIdx)} className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-md opacity-0 group-hover/img:opacity-100 transition-opacity"><X className="w-3 h-3"/></button>
                              </div>
                            ))}
                            <label className="flex flex-col items-center justify-center bg-gray-50 border-2 border-dashed border-gray-100 rounded-xl cursor-pointer hover:bg-blue-50 transition-colors min-h-[100px]">
                              <input type="file" multiple className="hidden" accept="image/*" onChange={e => updateStep(idx, 'image_files', e.target.files)} />
                              <Plus className="w-4 h-4 text-gray-300" />
                              <span className="text-[10px] font-black text-gray-400 mt-1">사진 추가</span>
                            </label>
                          </div>

                          {/* Step Media Controls */}
                          <div className="flex flex-wrap gap-4 pt-4 border-t border-gray-50">
                            <div>
                              <label className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-600 rounded-xl cursor-pointer hover:bg-purple-100 transition-colors text-xs font-bold">
                                <input type="file" className="hidden" accept="video/*" onChange={e => { const f = e.target.files?.[0]; if (f) updateStep(idx, 'video_file', f); }} />
                                <Film className="w-4 h-4" />
                                동영상 {step.video_preview ? '교체' : '추가'}
                              </label>
                            </div>
                            <div>
                              <label className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-xl cursor-pointer hover:bg-green-100 transition-colors text-xs font-bold">
                                <input type="file" multiple className="hidden" onChange={e => updateStep(idx, 'attachment_files', e.target.files)} />
                                <Paperclip className="w-4 h-4" />
                                파일 첨부
                              </label>
                            </div>
                          </div>

                          {/* Step Video Preview */}
                          {step.video_preview && (
                            <div className="relative rounded-[2rem] overflow-hidden bg-black border border-gray-100 aspect-video">
                              <video src={step.video_preview} controls className="w-full h-full object-contain" />
                              <button onClick={() => removeStepVideo(idx)} className="absolute top-3 right-3 p-1.5 bg-black/50 text-white rounded-lg hover:bg-black/70 transition-colors"><X className="w-4 h-4" /></button>
                            </div>
                          )}

                          {/* Step Attachments List */}
                          {((step.attachments && step.attachments.length > 0) || (step.attachment_files && step.attachment_files.length > 0)) && (
                            <div className="space-y-3">
                              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">단계별 첨부 파일</p>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {step.attachments?.map((file, fIdx) => (
                                  <div key={`exist-${fIdx}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl border border-gray-100">
                                    <div className="flex items-center gap-2 min-w-0">
                                      <FileText className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                      <span className="text-xs font-bold text-gray-600 truncate">{file.name}</span>
                                    </div>
                                    <button onClick={() => removeStepAttachment(idx, fIdx, true)} className="text-gray-300 hover:text-red-500 transition-colors"><X className="w-4 h-4" /></button>
                                  </div>
                                ))}
                                {step.attachment_files?.map((file, fIdx) => (
                                  <div key={`new-${fIdx}`} className="flex items-center justify-between p-3 bg-blue-50/50 rounded-2xl border border-blue-100">
                                    <div className="flex items-center gap-2 min-w-0">
                                      <FileText className="w-4 h-4 text-green-600 flex-shrink-0" />
                                      <span className="text-xs font-bold text-gray-600 truncate">{file.name}</span>
                                      <span className="text-[8px] px-1 bg-green-100 text-green-600 rounded">NEW</span>
                                    </div>
                                    <button onClick={() => removeStepAttachment(idx, fIdx, false)} className="text-gray-300 hover:text-red-500 transition-colors"><X className="w-4 h-4" /></button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    <button onClick={addStep} className="w-full py-4 bg-white rounded-2xl border-2 border-dashed border-gray-100 text-gray-400 font-bold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                       <Plus className="w-4 h-4" /> 단계 추가하기
                    </button>
                  </div>
               </section>

               {/* Tips & Tools & Links */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-10">
                  <div className="space-y-4">
                    <h4 className="text-sm font-black text-orange-500 uppercase">핵심 팁</h4>
                    {tips.map((t, i) => (
                      <div key={i} className="flex gap-2"><input value={t} onChange={e => { const n = [...tips]; n[i] = e.target.value; setTips(n); }} className="flex-1 h-12 px-5 bg-white border border-gray-100 rounded-2xl text-sm font-bold" /><button onClick={() => setTips(tips.filter((_, idx) => idx !== i))} className="text-gray-300 hover:text-red-400"><X className="w-4 h-4"/></button></div>
                    ))}
                    <button onClick={() => setTips([...tips, ''])} className="w-full py-3 bg-orange-50 text-orange-600 rounded-xl text-xs font-bold transition-all"><Plus className="w-4 h-4 mx-auto"/></button>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="text-sm font-black text-purple-500 uppercase">AI 도구</h4>
                    {tools.map((t, i) => (
                      <div key={i} className="flex gap-2 relative">
                        <input value={t} onChange={e => updateTool(i, e.target.value)} className="flex-1 h-12 px-5 bg-white border border-gray-100 rounded-2xl text-sm font-bold" />
                        <button onClick={() => setTools(tools.filter((_, idx) => idx !== i))} className="text-gray-300 hover:text-red-400"><X className="w-4 h-4"/></button>
                        {activeToolSuggestIdx === i && filteredTools.length > 0 && (
                          <div className="absolute top-full left-0 right-10 bg-white border rounded-xl shadow-xl z-20 mt-1 overflow-hidden">
                            {filteredTools.map(s => <button key={s} onClick={() => { const n = [...tools]; n[i] = s; setTools(n); setFilteredTools([]); setActiveToolSuggestIdx(null); }} className="w-full px-4 py-2 text-left text-xs font-bold hover:bg-purple-50 transition-colors">{s}</button>)}
                          </div>
                        )}
                      </div>
                    ))}
                    <button onClick={() => setTools([...tools, ''])} className="w-full py-3 bg-purple-50 text-purple-600 rounded-xl text-xs font-bold transition-all"><Plus className="w-4 h-4 mx-auto"/></button>
                  </div>
               </div>

                {/* Reference Links Section Added */}
                <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100">
                  <h4 className="text-sm font-black text-green-600 uppercase mb-6 flex items-center gap-2">
                    <Tag className="w-4 h-4" /> 참고 링크 수정
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {links.map((link, i) => (
                      <div key={i} className="flex gap-2">
                        <input 
                          value={link} 
                          onChange={e => {
                            const newLinks = [...links];
                            newLinks[i] = e.target.value;
                            setLinks(newLinks);
                          }} 
                          className="flex-1 h-12 px-5 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-bold" 
                          placeholder="https://..."
                        />
                        <button onClick={() => setLinks(links.filter((_, idx) => idx !== i))} className="text-gray-300 hover:text-red-400">
                          <X className="w-4 h-4"/>
                        </button>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => setLinks([...links, ''])} className="w-full mt-4 py-3 bg-green-50 text-green-600 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2">
                    <Plus className="w-4 h-4" /> 링크 추가
                  </button>
                </div>
             </div>

            {/* Sticky Actions */}
            <div className="px-10 py-8 bg-white border-t flex gap-4 shrink-0">
               <button onClick={onClose} className="px-8 rounded-[1.5rem] font-black text-gray-500 hover:bg-gray-50 transition-all border border-gray-100">닫기</button>
               
               {status === 'draft' ? (
                 <>
                   <button 
                     onClick={() => handleSave('draft')} 
                     disabled={isSubmitting}
                     className="flex-1 h-16 bg-white border-2 border-orange-500 rounded-[1.5rem] font-black text-orange-500 hover:bg-orange-50 transition-all flex items-center justify-center gap-3"
                   >
                     {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <Clock className="w-6 h-6" />}
                     임시 저장 유지
                   </button>
                   <button 
                     onClick={() => handleSave('published')} 
                     disabled={isSubmitting}
                     className="flex-[2] h-16 bg-blue-600 rounded-[1.5rem] font-black text-white hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center gap-3"
                   >
                     {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <CheckCircle2 className="w-6 h-6" />}
                     지금 바로 공개하기
                   </button>
                 </>
               ) : (
                 <button 
                   onClick={() => handleSave('published')} 
                   disabled={isSubmitting}
                   className="flex-[3] h-16 bg-blue-600 rounded-[1.5rem] font-black text-white hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center gap-3"
                 >
                   {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <CheckCircle2 className="w-6 h-6" />}
                   수정 내용 저장 및 공개
                 </button>
               )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}