import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CategoryManager } from './CategoryManager';
import { getFirebaseCategories } from '../../lib/api';
import { X, Plus, Minus, Upload, FileText, Image as ImageIcon, Video, Code, Loader2, File, Film } from 'lucide-react';
import { uploadImageToFirebase } from '../../lib/uploadImage';
import { Method } from '../data/methods';

interface CreateGuideDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (guide: NewGuideData) => void;
  isUploading?: boolean;
  uploadProgress?: string;
  initialData?: Method;
}

export interface NewGuideData {
  title: string;
  author: string;
  tag: string;
  description: string;
  steps: { title: string; content: string; images?: string[]; video?: string }[];
  tips: string[];
  tools: string[];
  references?: { title: string; url: string }[];
  image?: string;
  video?: string;
  attachments?: { name: string; url: string }[];
  password?: string;
}

const defaultCategories = [
  { id: 'document', label: '문서작성', icon: FileText, color: 'bg-blue-100 text-blue-700' },
  { id: 'design', label: '디자인', icon: ImageIcon, color: 'bg-pink-100 text-pink-700' },
  { id: 'multimedia', label: '멀티미디어', icon: Video, color: 'bg-purple-100 text-purple-700' },
  { id: 'development', label: '개발', icon: Code, color: 'bg-green-100 text-green-700' },
];

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_FILE_SIZE = 20 * 1024 * 1024;  // 20MB

export function CreateGuideDialog({ isOpen, onClose, onSubmit, isUploading, uploadProgress, initialData }: CreateGuideDialogProps) {
  const [categories, setCategories] = useState(defaultCategories);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [description, setDescription] = useState('');
  const [steps, setSteps] = useState<{ title: string; content: string; images?: string[]; video?: string }[]>([{ title: '', content: '', images: [], video: undefined }]);
  const [tips, setTips] = useState(['']);
  const [tools, setTools] = useState(['']);
  const [references, setReferences] = useState<{ title: string; url: string }[]>([]);
  const [image, setImage] = useState<string | undefined>();
  const [video, setVideo] = useState<string | undefined>();
  const [attachments, setAttachments] = useState<{ name: string; url: string }[]>([]);
  const [password, setPassword] = useState('');
  const [isUploadingLocal, setIsUploadingLocal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const attachmentInputRef = useRef<HTMLInputElement>(null);
  const stepImageInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});
  const stepVideoInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setTitle(initialData.title);
        setAuthor(initialData.author);
        setSelectedCategory(initialData.tag);
        setDescription(initialData.description);
        setSteps(initialData.steps && initialData.steps.length > 0 ? [...initialData.steps] : [{ title: '', content: '', images: [], video: undefined }]);
        setTips(initialData.tips && initialData.tips.length > 0 ? [...initialData.tips] : ['']);
        setTools(initialData.tools && initialData.tools.length > 0 ? [...initialData.tools] : ['']);
        setReferences(initialData.references && initialData.references.length > 0 ? [...initialData.references] : []);
        setImage(initialData.image);
        setVideo(initialData.video);
        setAttachments(initialData.attachments || []);
        setPassword(initialData.password || '');
      } else {
        // Reset form completely if not editing
        setTitle('');
        setAuthor('');
        setSelectedCategory('');
        setDescription('');
        setSteps([{ title: '', content: '', images: [], video: undefined }]);
        setTips(['']);
        setTools(['']);
        setReferences([]);
        setImage(undefined);
        setVideo(undefined);
        setAttachments([]);
        setPassword('');
      }

      const fetchCategories = async () => {
        try {
          const savedCategories = await getFirebaseCategories();
          if (savedCategories && savedCategories.length > 0) {
            const iconMap: Record<string, any> = {
              'FileText': FileText,
              'Image': ImageIcon,
              'Video': Video,
              'Code': Code,
            };
            
            const mappedCategories = savedCategories.map((cat: any) => ({
              ...cat,
              icon: iconMap[cat.icon] || FileText,
            }));
            
            setCategories(mappedCategories);
          }
        } catch (error) {
          console.error('Failed to load categories:', error);
        }
      };
      fetchCategories();
    }
  }, [isOpen, initialData]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > MAX_IMAGE_SIZE) {
        alert('이미지 파일 크기는 10MB를 초과할 수 없습니다.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > MAX_VIDEO_SIZE) {
        alert('동영상 파일 크기는 50MB를 초과할 수 없습니다.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setVideo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAttachmentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      Array.from(files).forEach((file) => {
        if (file.size > MAX_FILE_SIZE) {
          alert(`'${file.name}' 파일이 너무 큽니다. 첨부 파일은 20MB를 초과할 수 없습니다.`);
          return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
          setAttachments(prev => [...prev, { name: file.name, url: reader.result as string }]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleStepImageUpload = (stepIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const validFiles = Array.from(files).filter(file => {
        if (file.size > MAX_IMAGE_SIZE) {
          alert(`'${file.name}' 이미지가 10MB를 초과하여 제외되었습니다.`);
          return false;
        }
        return true;
      });

      if (validFiles.length === 0) return;

      const newImages: string[] = [];
      let filesProcessed = 0;

      validFiles.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          newImages.push(reader.result as string);
          filesProcessed++;

          if (filesProcessed === validFiles.length) {
            const newSteps = [...steps];
            newSteps[stepIndex].images = [...(newSteps[stepIndex].images || []), ...newImages];
            setSteps(newSteps);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleStepVideoUpload = (stepIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > MAX_VIDEO_SIZE) {
        alert('동영상 파일 크기는 50MB를 초과할 수 없습니다.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const newSteps = [...steps];
        newSteps[stepIndex].video = reader.result as string;
        setSteps(newSteps);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeStepVideo = (stepIndex: number) => {
    const newSteps = [...steps];
    newSteps[stepIndex].video = undefined;
    setSteps(newSteps);
  };

  const removeStepImage = (stepIndex: number, imageIndex: number) => {
    const newSteps = [...steps];
    newSteps[stepIndex].images = newSteps[stepIndex].images?.filter((_, i) => i !== imageIndex);
    setSteps(newSteps);
  };

  const addStep = () => {
    setSteps([...steps, { title: '', content: '', images: [], video: undefined }]);
  };

  const removeStep = (index: number) => {
    if (steps.length > 1) {
      setSteps(steps.filter((_, i) => i !== index));
    }
  };

  const updateStep = (index: number, field: 'title' | 'content', value: string) => {
    const newSteps = [...steps];
    newSteps[index][field] = value;
    setSteps(newSteps);
  };

  const addTip = () => {
    setTips([...tips, '']);
  };

  const removeTip = (index: number) => {
    if (tips.length > 1) {
      setTips(tips.filter((_, i) => i !== index));
    }
  };

  const updateTip = (index: number, value: string) => {
    const newTips = [...tips];
    newTips[index] = value;
    setTips(newTips);
  };

  const addTool = () => {
    setTools([...tools, '']);
  };

  const removeTool = (index: number) => {
    if (tools.length > 1) {
      setTools(tools.filter((_, i) => i !== index));
    }
  };

  const updateTool = (index: number, value: string) => {
    const newTools = [...tools];
    newTools[index] = value;
    setTools(newTools);
  };

  const addReference = () => {
    setReferences([...references, { title: '', url: '' }]);
  };

  const removeReference = (index: number) => {
    if (references.length > 1) {
      setReferences(references.filter((_, i) => i !== index));
    }
  };

  const updateReference = (index: number, field: 'title' | 'url', value: string) => {
    const newReferences = [...references];
    newReferences[index][field] = value;
    setReferences(newReferences);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !author || !selectedCategory || !description || !image) {
      alert('대표 이미지를 포함한 모든 필수 항목을 입력해주세요.');
      return;
    }

    const guideData: NewGuideData = {
      title,
      author,
      tag: selectedCategory,
      description,
      steps: steps.filter(s => s.title && s.content),
      tips: tips.filter(t => t.trim()),
      tools: tools.filter(t => t.trim()),
      references: references.filter(r => r.title && r.url),
      image,
      video,
      attachments,
      password,
    };

    onSubmit(guideData);
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setTitle('');
    setAuthor('');
    setSelectedCategory('');
    setDescription('');
    setSteps([{ title: '', content: '', images: [], video: undefined }]);
    setTips(['']);
    setTools(['']);
    setReferences([]);
    setImage(undefined);
    setVideo(undefined);
    setAttachments([]);
    setPassword('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          
          {/* Upload Progress Overlay */}
          {isUploading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-md"
            >
              <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-sm w-full mx-4">
                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      이미지 업로드 중...
                    </h3>
                    <p className="text-sm text-gray-600">
                      {uploadProgress || '잠시만 기다려주세요'}
                    </p>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <motion.div
                      className="h-full bg-blue-600"
                      initial={{ width: '0%' }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="min-h-full flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 flex items-center justify-between rounded-t-2xl">
                  <h2 className="text-2xl font-semibold text-gray-900">
                    {initialData ? '가이드 수정하기' : '나만의 가이드 공유하기'}
                  </h2>
                  <button
                    onClick={onClose}
                    className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="px-8 py-6 space-y-8">
                  {/* 기본 정보 */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg text-gray-900">기본 정보</h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        제목 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="예: ChatGPT로 업무 효율 3배 올리기"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        작성자 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="이름을 입력하세요"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        카테고리 <span className="text-red-500">*</span>
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {categories.map((category) => (
                          <button
                            key={category.id}
                            type="button"
                            onClick={() => setSelectedCategory(category.label)}
                            className={`p-4 rounded-lg border-2 transition-all ${
                              selectedCategory === category.label
                                ? `${category.color} border-current`
                                : 'border-gray-200 hover:border-gray-300 bg-white'
                            }`}
                          >
                            <category.icon className="w-6 h-6 mx-auto mb-2" />
                            <div className="text-sm font-medium">{category.label}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        설명 <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        placeholder="이 가이드에 대한 간단한 설명을 작성해주세요"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        대표 이미지 <span className="text-red-500">*</span>
                      </label>
                      <div className="space-y-3">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition-colors flex items-center justify-center gap-2 text-gray-600 hover:text-blue-600"
                        >
                          <ImageIcon className="w-5 h-5" />
                          이미지 업로드
                        </button>
                        {image && (
                          <div className="relative rounded-lg overflow-hidden border border-gray-200">
                            <img src={image} alt="Preview" className="w-full h-48 object-cover" />
                            <button
                              type="button"
                              onClick={() => setImage(undefined)}
                              className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-lg p-2 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        대표 동영상 (선택)
                      </label>
                      <div className="space-y-3">
                        <input
                          ref={videoInputRef}
                          type="file"
                          accept="video/*"
                          onChange={handleVideoUpload}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => videoInputRef.current?.click()}
                          className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 transition-colors flex items-center justify-center gap-2 text-gray-600 hover:text-purple-600"
                        >
                          <Film className="w-5 h-5" />
                          동영상 업로드
                        </button>
                        {video && (
                          <div className="relative rounded-lg overflow-hidden border border-gray-200 bg-black">
                            <video src={video} controls className="w-full h-48 object-contain" />
                            <button
                              type="button"
                              onClick={() => setVideo(undefined)}
                              className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-lg p-2 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        파일 첨부 (선택)
                      </label>
                      <div className="space-y-3">
                        <input
                          ref={attachmentInputRef}
                          type="file"
                          multiple
                          onChange={handleAttachmentUpload}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => attachmentInputRef.current?.click()}
                          className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 transition-colors flex items-center justify-center gap-2 text-gray-600 hover:text-green-600"
                        >
                          <File className="w-5 h-5" />
                          파일 업로드
                        </button>
                        {attachments.length > 0 && (
                          <div className="space-y-2">
                            {attachments.map((file, idx) => (
                              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                                <div className="flex items-center gap-2 min-w-0">
                                  <File className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                  <span className="text-sm text-gray-700 truncate">{file.name}</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeAttachment(idx)}
                                  className="text-gray-400 hover:text-red-500 transition-colors"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        비밀번호 (선택)
                      </label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => {
                          const value = e.target.value;
                          // Only allow digits and max 4 characters
                          if (value === '' || (/^\d+$/.test(value) && value.length <= 4)) {
                            setPassword(value);
                          }
                        }}
                        maxLength={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="4자리 숫자 (예: 1234)"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        비밀번호를 설정하면 나중에 이 가이드를 수정할 수 있습니다.
                      </p>
                    </div>
                  </div>

                  {/* 단계별 가이드 */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-lg text-gray-900">단계별 가이드</h3>
                      <button
                        type="button"
                        onClick={addStep}
                        className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm"
                      >
                        <Plus className="w-4 h-4" />
                        단계 추가
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      {steps.map((step, index) => (
                        <div key={index} className="p-4 bg-gray-50 rounded-lg space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">단계 {index + 1}</span>
                            {steps.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeStep(index)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                          <input
                            type="text"
                            value={step.title}
                            onChange={(e) => updateStep(index, 'title', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            placeholder="단계 제목 (예: 1단계: 주제 리서치)"
                          />
                          <textarea
                            value={step.content}
                            onChange={(e) => updateStep(index, 'content', e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
                            placeholder="단계별 상세 설명을 작성해주세요"
                          />
                          
                          {/* Step Media */}
                          <div className="space-y-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-2">
                                단계별 이미지 (선택, 여러 장 가능)
                              </label>
                              
                              {step.images && step.images.length > 0 && (
                                <div className="grid grid-cols-2 gap-2 mb-2">
                                  {step.images.map((img, imgIndex) => (
                                    <div key={imgIndex} className="relative rounded-lg overflow-hidden border border-gray-200 group">
                                      <img src={img} alt={`Step ${index + 1} Image ${imgIndex + 1}`} className="w-full h-32 object-cover" />
                                      <button
                                        type="button"
                                        onClick={() => removeStepImage(index, imgIndex)}
                                        className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-lg p-1.5 transition-colors opacity-0 group-hover:opacity-100"
                                      >
                                        <X className="w-3 h-3" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}
                              
                              <input
                                ref={(el) => { stepImageInputRefs.current[index] = el; }}
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={(e) => handleStepImageUpload(index, e)}
                                className="hidden"
                              />
                              <button
                                type="button"
                                onClick={() => stepImageInputRefs.current[index]?.click()}
                                className="w-full px-3 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition-colors flex items-center justify-center gap-2 text-gray-600 hover:text-blue-600 text-sm"
                              >
                                <ImageIcon className="w-4 h-4" />
                                {step.images && step.images.length > 0 ? '이미지 더 추가' : '이미지 업로드'}
                              </button>
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-2">
                                단계별 동영상 (선택)
                              </label>
                              
                              {step.video && (
                                <div className="relative rounded-lg overflow-hidden border border-gray-200 bg-black mb-2">
                                  <video src={step.video} controls className="w-full h-32 object-contain" />
                                  <button
                                    type="button"
                                    onClick={() => removeStepVideo(index)}
                                    className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-lg p-1.5 transition-colors"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              )}
                              
                              <input
                                ref={(el) => { stepVideoInputRefs.current[index] = el; }}
                                type="file"
                                accept="video/*"
                                onChange={(e) => handleStepVideoUpload(index, e)}
                                className="hidden"
                              />
                              <button
                                type="button"
                                onClick={() => stepVideoInputRefs.current[index]?.click()}
                                className="w-full px-3 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 transition-colors flex items-center justify-center gap-2 text-gray-600 hover:text-purple-600 text-sm"
                              >
                                <Film className="w-4 h-4" />
                                {step.video ? '동영상 교체' : '동영상 업로드'}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 팁 */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-lg text-gray-900">실전 팁</h3>
                      <button
                        type="button"
                        onClick={addTip}
                        className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm"
                      >
                        <Plus className="w-4 h-4" />
                        팁 추가
                      </button>
                    </div>
                    
                    <div className="space-y-2">
                      {tips.map((tip, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={tip}
                            onChange={(e) => updateTip(index, e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            placeholder="팁을 입력하세요"
                          />
                          {tips.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeTip(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 추천 도구 */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-lg text-gray-900">추천 도구</h3>
                      <button
                        type="button"
                        onClick={addTool}
                        className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm"
                      >
                        <Plus className="w-4 h-4" />
                        도구 추가
                      </button>
                    </div>
                    
                    <div className="space-y-2">
                      {tools.map((tool, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={tool}
                            onChange={(e) => updateTool(index, e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            placeholder="도구 이름 (예: ChatGPT, Notion)"
                          />
                          {tools.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeTool(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 참고 자료 */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-lg text-gray-900">참고 자료</h3>
                      <button
                        type="button"
                        onClick={addReference}
                        className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm"
                      >
                        <Plus className="w-4 h-4" />
                        자료 추가
                      </button>
                    </div>
                    
                    <div className="space-y-2">
                      {references.map((reference, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={reference.title}
                            onChange={(e) => updateReference(index, 'title', e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            placeholder="자료 제목"
                          />
                          <input
                            type="text"
                            value={reference.url}
                            onChange={(e) => updateReference(index, 'url', e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            placeholder="자료 URL"
                          />
                          {references.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeReference(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 제출 버튼 */}
                  <div className="flex gap-3 pt-6 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={onClose}
                      className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                      취소
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                    >
                      {initialData ? '수정 완료' : '가이드 공유하기'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}