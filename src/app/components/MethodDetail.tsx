import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Clock, User, Tag, CheckCircle, Lightbulb, Wrench, ExternalLink, FileText, Image, Video, Code, Sparkles, File, Film, Download } from 'lucide-react';
import { methods as defaultMethods, Method } from '../data/methods';
import { useState, useEffect } from 'react';
import { getFirebaseGuides, updateFirebaseGuide } from '../../lib/api';
import { CreateGuideDialog, NewGuideData } from './CreateGuideDialog';
import { uploadImageToFirebase, dataURLtoFile } from '../../lib/uploadImage';

const iconMap: Record<string, any> = {
  '문서작성': FileText,
  '디자인': Image,
  '멀티미디어': Video,
  '개발': Code,
};

const tagColorMap: Record<string, string> = {
  '문서작성': 'bg-blue-100 text-blue-700',
  '디자인': 'bg-pink-100 text-pink-700',
  '멀티미디어': 'bg-purple-100 text-purple-700',
  '개발': 'bg-green-100 text-green-700',
};

export function MethodDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [allMethods, setAllMethods] = useState<Method[]>(defaultMethods);
  
  // Edit State
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [isEditGuideOpen, setIsEditGuideOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');

  // Load custom guides from Firebase on mount
  useEffect(() => {
    const fetchGuides = async () => {
      try {
        const firebaseGuides = await getFirebaseGuides();
        const hydratedGuides = firebaseGuides.map(guide => ({
          ...guide,
          icon: iconMap[guide.tag] || Sparkles,
          tagColor: tagColorMap[guide.tag] || 'bg-blue-100 text-blue-700'
        }));
        setAllMethods([...hydratedGuides, ...defaultMethods]);
      } catch (error) {
        console.error('Failed to load custom guides from Firebase:', error);
      }
    };
    fetchGuides();
  }, []);

  const method = allMethods.find((m) => m.id === id);

  const handleEditClick = () => {
    if (!method?.password) {
      alert('비밀번호가 설정되지 않은 가이드는 수정할 수 없습니다.');
      return;
    }
    setIsPasswordModalOpen(true);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === method?.password) {
      setIsPasswordModalOpen(false);
      setPasswordInput('');
      setIsEditGuideOpen(true);
    } else {
      alert('비밀번호가 일치하지 않습니다.');
    }
  };

  const handleUpdateGuide = async (guideData: NewGuideData) => {
    if (!method) return;
    try {
      setIsUploading(true);
      setUploadProgress('이미지 업로드 중...');

      let uploadedImageUrl = '';
      if (guideData.image && guideData.image.startsWith('data:')) {
        try {
          setUploadProgress('대표 이미지 업로드 중...');
          const imageFile = dataURLtoFile(guideData.image, `thumbnail-${Date.now()}.png`);
          uploadedImageUrl = await uploadImageToFirebase(imageFile, 'thumbnails');
        } catch (error) {
          throw new Error('대표 이미지 업로드에 실패했습니다.');
        }
      } else if (guideData.image) {
        uploadedImageUrl = guideData.image; 
      }

      let uploadedVideoUrl = '';
      if (guideData.video && guideData.video.startsWith('data:')) {
        try {
          setUploadProgress('대표 동영상 업로드 중...');
          const videoFile = dataURLtoFile(guideData.video, `video-${Date.now()}.mp4`);
          uploadedVideoUrl = await uploadImageToFirebase(videoFile, 'videos');
        } catch (error) {
          console.error('대표 동영상 업로드 실패:', error);
        }
      } else if (guideData.video) {
        uploadedVideoUrl = guideData.video;
      }

      const uploadedAttachments = await Promise.all(
        (guideData.attachments || []).map(async (file, index) => {
          if (file.url.startsWith('data:')) {
            try {
              setUploadProgress(`첨부 파일 ${index + 1} 업로드 중...`);
              const blobFile = dataURLtoFile(file.url, file.name);
              const url = await uploadImageToFirebase(blobFile, 'attachments');
              return { name: file.name, url };
            } catch (error) {
              console.error(`첨부 파일 ${index + 1} 업로드 실패:`, error);
              return null;
            }
          }
          return file;
        })
      );
      const filteredAttachments = uploadedAttachments.filter((a): a is { name: string; url: string } => a !== null);

      const updatedSteps = await Promise.all(
        guideData.steps.map(async (step, stepIndex) => {
          const updatedStep = { ...step };

          if (step.images && step.images.length > 0) {
            setUploadProgress(`단계 ${stepIndex + 1} 이미지 업로드 중...`);
            const uploadedImages = await Promise.all(
              step.images.map(async (img, imgIndex) => {
                if (img.startsWith('data:')) {
                  const imageFile = dataURLtoFile(img, `step-${stepIndex}-${imgIndex}-${Date.now()}.png`);
                  return await uploadImageToFirebase(imageFile, 'guide-steps/images');
                }
                return img;
              })
            );
            updatedStep.images = uploadedImages;
          }

          if (step.video && step.video.startsWith('data:')) {
            try {
              setUploadProgress(`단계 ${stepIndex + 1} 동영상 업로드 중...`);
              const videoFile = dataURLtoFile(step.video, `step-video-${stepIndex}-${Date.now()}.mp4`);
              updatedStep.video = await uploadImageToFirebase(videoFile, 'guide-steps/videos');
            } catch (error) {
              console.error(`단계 ${stepIndex + 1} 동영상 업로드 실패:`, error);
            }
          }

          return updatedStep;
        })
      );

      setUploadProgress('가이드 저장 중...');
      const updatePayload: Partial<Method> = {
        title: guideData.title,
        author: guideData.author,
        tag: guideData.tag,
        description: guideData.description,
        steps: updatedSteps,
        tips: guideData.tips,
        tools: guideData.tools,
        references: guideData.references,
        image: uploadedImageUrl || undefined,
        video: uploadedVideoUrl || undefined,
        attachments: filteredAttachments,
        password: guideData.password,
      };

      // Remove undefined values
      const cleanPayload = Object.fromEntries(Object.entries(updatePayload).filter(([_, v]) => v !== undefined));

      await updateFirebaseGuide(method.id, cleanPayload);
      
      // Update local state to reflect changes instantly
      const updatedMethod = { ...method, ...cleanPayload, icon: iconMap[guideData.tag] || Sparkles, tagColor: tagColorMap[guideData.tag] || 'bg-blue-100 text-blue-700' } as Method;
      setAllMethods(prev => prev.map(m => m.id === method.id ? updatedMethod : m));
      
      setIsUploading(false);
      setUploadProgress('');
      setIsEditGuideOpen(false);
      alert('성공적으로 수정되었습니다!');

    } catch (error) {
      console.error('업데이트 실패:', error);
      setIsUploading(false);
      setUploadProgress('');
      alert('가이드 수정 중 오류가 발생했습니다.');
    }
  };

  if (!method) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">가이드를 찾을 수 없습니다</h2>
          <button
            onClick={() => navigate('/')}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  const Icon = method.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">돌아가기</span>
          </button>
          
          <button
            onClick={handleEditClick}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            수정하기
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-8 md:p-12 mb-8"
        >
          <div className="flex items-start gap-6 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center flex-shrink-0">
              <Icon className="w-8 h-8 text-blue-600" />
            </div>
            <div className="flex-1">
              <span className={`inline-block px-3 py-1.5 rounded-lg text-sm font-medium mb-3 ${method.tagColor}`}>
                {method.tag}
              </span>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                {method.title}
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed">
                {method.description}
              </p>
            </div>
          </div>

          {/* Main Video Section */}
          {method.video && (
            <div className="mb-8 rounded-xl overflow-hidden shadow-md bg-black bg-opacity-5">
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 border-b border-gray-100">
                <Film className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-gray-700">대표 동영상</span>
              </div>
              <video 
                src={method.video} 
                controls 
                className="w-full h-auto max-h-[500px] object-contain block bg-black"
                poster={method.image}
              />
            </div>
          )}

          {/* Meta Information */}
          <div className="flex flex-wrap gap-6 pt-6 border-t border-gray-100">
            <div className="flex items-center gap-2 text-gray-600">
              <User className="w-5 h-5" />
              <span className="text-sm">
                작성자: <span className="font-medium text-gray-900">{method.author}</span>
              </span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="w-5 h-5" />
              <span className="text-sm">읽는 시간: 약 5분</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Tag className="w-5 h-5" />
              <span className="text-sm">{method.tag}</span>
            </div>
          </div>
        </motion.div>

        {/* Steps Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-lg p-8 md:p-12 mb-8"
        >
          <div className="flex items-center gap-3 mb-8">
            <CheckCircle className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">단계별 가이드</h2>
          </div>

          <div className="space-y-6">
            {method.steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className="bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-xl p-6 border border-gray-100 hover:border-blue-200 transition-colors"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  {step.content}
                </p>
                {step.images && step.images.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    {step.images.map((image, imgIndex) => (
                      <div key={imgIndex} className="rounded-lg overflow-hidden border border-gray-200">
                        <img 
                          src={image} 
                          alt={`${step.title} - 이미지 ${imgIndex + 1}`} 
                          className="w-full h-auto object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
                
                {step.video && (
                  <div className="mt-4 rounded-lg overflow-hidden border border-gray-200 bg-black">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border-b border-gray-100">
                      <Film className="w-3.5 h-3.5 text-purple-600" />
                      <span className="text-xs font-medium text-gray-700">단계 동영상</span>
                    </div>
                    <video 
                      src={step.video} 
                      controls 
                      className="w-full h-auto max-h-[400px] object-contain block bg-black"
                    />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Tips Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-lg p-8 md:p-12 mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <Lightbulb className="w-6 h-6 text-amber-500" />
            <h2 className="text-2xl font-bold text-gray-900">핵심 팁</h2>
          </div>

          <div className="space-y-3">
            {method.tips.map((tip, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="flex gap-3 items-start"
              >
                <div className="w-2 h-2 rounded-full bg-amber-400 mt-2.5 flex-shrink-0" />
                <p className="text-gray-700 leading-relaxed">{tip}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Tools Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-lg p-8 md:p-12 mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <Wrench className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">사용 도구</h2>
          </div>

          <div className="flex flex-wrap gap-3">
            {method.tools.map((tool, index) => (
              <motion.span
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + index * 0.05 }}
                className="px-4 py-2 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 rounded-lg font-medium text-sm border border-blue-200 hover:shadow-md transition-shadow"
              >
                {tool}
              </motion.span>
            ))}
          </div>
        </motion.div>

        {/* References Section */}
        {method.references && method.references.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="bg-white rounded-2xl shadow-lg p-8 md:p-12 mb-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <ExternalLink className="w-6 h-6 text-purple-600" />
              <h2 className="text-2xl font-bold text-gray-900">참고 자료</h2>
            </div>

            <div className="space-y-3">
              {method.references.map((reference, index) => (
                <motion.a
                  key={index}
                  href={reference.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl border border-purple-200 hover:shadow-md hover:border-purple-300 transition-all group"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <ExternalLink className="w-5 h-5 text-purple-600 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 group-hover:text-purple-700 transition-colors truncate">
                        {reference.title}
                      </p>
                      <p className="text-xs text-gray-500 truncate mt-0.5">
                        {reference.url}
                      </p>
                    </div>
                  </div>
                  <div className="ml-2 text-purple-600 group-hover:translate-x-1 transition-transform flex-shrink-0">
                    →
                  </div>
                </motion.a>
              ))}
            </div>
          </motion.div>
        )}

        {/* Attachments Section */}
        {method.attachments && method.attachments.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.48 }}
            className="bg-white rounded-2xl shadow-lg p-8 md:p-12 mb-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <File className="w-6 h-6 text-green-600" />
              <h2 className="text-2xl font-bold text-gray-900">첨부 파일</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {method.attachments.map((file, index) => (
                <motion.a
                  key={index}
                  href={file.url}
                  download={file.name}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-green-200 hover:bg-green-50/30 transition-all group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <File className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="font-medium text-gray-700 truncate group-hover:text-green-700">
                      {file.name}
                    </span>
                  </div>
                  <Download className="w-4 h-4 text-gray-400 group-hover:text-green-600 transition-colors" />
                </motion.a>
              ))}
            </div>
          </motion.div>
        )}

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl shadow-lg p-8 text-center text-white"
        >
          <h3 className="text-xl font-bold mb-2">이 가이드가 도움이 되셨나요?</h3>
          <p className="text-blue-100 mb-6">
            여러분의 노하우도 공유해주세요. 함께 성장하는 팀이 됩시다!
          </p>
          <button
            onClick={() => navigate('/')}
            className="bg-white text-blue-600 px-6 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-colors"
          >
            다른 가이드 보러가기
          </button>
        </motion.div>
      </div>

      {/* Password Prompt Modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 shadow-xl max-w-sm w-full"
          >
            <h3 className="text-xl font-bold mb-4">비밀번호 입력</h3>
            <p className="text-sm text-gray-600 mb-4">
              가이드를 수정하려면 등록 시 설정한 비밀번호를 입력해주세요.
            </p>
            <form onSubmit={handlePasswordSubmit}>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                autoFocus
                className="w-full px-4 py-3 mb-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="비밀번호"
                required
              />
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                >
                  확인
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Edit Component */}
      <CreateGuideDialog
        isOpen={isEditGuideOpen}
        onClose={() => setIsEditGuideOpen(false)}
        onSubmit={handleUpdateGuide}
        isUploading={isUploading}
        uploadProgress={uploadProgress}
        initialData={method}
      />
    </div>
  );
}