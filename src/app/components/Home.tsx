import { useState, useEffect } from 'react';
import { Navigation } from './Navigation';
import { Hero } from './Hero';
import { MethodGrid } from './MethodGrid';
import { Footer } from './Footer';
import { SearchDialog } from './SearchDialog';
import { CreateGuideDialog, NewGuideData } from './CreateGuideDialog';
import { methods as defaultMethods, Method } from '../data/methods';
import { FileText, Image, Video, Code, Sparkles, Users, BookOpen, Mic, PenTool, Loader2 } from 'lucide-react';
import { uploadImageToFirebase, dataURLtoFile } from '../../lib/uploadImage';
import { motion, AnimatePresence } from 'motion/react';
import { getFirebaseGuides, createFirebaseGuide, updateFirebaseGuide } from '../../lib/api';

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

export function Home() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCreateGuideOpen, setIsCreateGuideOpen] = useState(false);
  const [methods, setMethods] = useState<Method[]>(defaultMethods);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');

  // Load user guides from Firebase on mount
  useEffect(() => {
    const fetchGuides = async () => {
      try {
        const firebaseGuides = await getFirebaseGuides();
        const hydratedGuides = firebaseGuides.map(guide => ({
          ...guide,
          icon: iconMap[guide.tag] || Sparkles,
          tagColor: tagColorMap[guide.tag] || 'bg-blue-100 text-blue-700'
        }));
        setMethods([...hydratedGuides, ...defaultMethods]);
      } catch (error) {
        console.error('Failed to load user guides from Firebase:', error);
      }
    };
    fetchGuides();
  }, []);

  const handleCreateGuide = async (guideData: NewGuideData) => {
    try {
      setIsUploading(true);
      setUploadProgress('이미지 업로드 중...');

      // 1. 대표 이미지 업로드 (필수)
      let uploadedImageUrl = '';
      if (guideData.image && guideData.image.startsWith('data:')) {
        try {
          setUploadProgress('대표 이미지 업로드 중...');
          const imageFile = dataURLtoFile(guideData.image, `thumbnail-${Date.now()}.png`);
          uploadedImageUrl = await uploadImageToFirebase(imageFile, 'thumbnails');
        } catch (error) {
          console.error('대표 이미지 업로드 실패:', error);
          throw new Error('대표 이미지 업로드에 실패했습니다. 유효한 이미지인지 확인해주세요.');
        }
      } else if (guideData.image) {
        uploadedImageUrl = guideData.image; // 이미 Storage URL인 경우
      }

      if (!uploadedImageUrl) {
        throw new Error('대표 이미지 업로드 URL을 생성하지 못했습니다.');
      }

      // 2. 대표 동영상 업로드 (선택)
      let uploadedVideoUrl = '';
      if (guideData.video && guideData.video.startsWith('data:')) {
        try {
          setUploadProgress('대표 동영상 업로드 중...');
          const videoFile = dataURLtoFile(guideData.video, `video-${Date.now()}.mp4`);
          uploadedVideoUrl = await uploadImageToFirebase(videoFile, 'videos');
        } catch (error) {
          console.error('대표 동영상 업로드 실패:', error);
          // 동영상은 선택사항이므로 실패해도 가이드는 생성할 수 있게 하거나, 사용자에게 알림
        }
      } else if (guideData.video) {
        uploadedVideoUrl = guideData.video;
      }

      // 3. 파일 첨부 업로드 (선택)
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

      // 4. 단계별 미디어 업로드
      const updatedSteps = await Promise.all(
        guideData.steps.map(async (step, stepIndex) => {
          const updatedStep = { ...step };

          // 단계별 이미지 업로드
          if (step.images && step.images.length > 0) {
            setUploadProgress(`단계 ${stepIndex + 1} 이미지 업로드 중...`);
            const uploadedImages = await Promise.all(
              step.images.map(async (img, imgIndex) => {
                if (img.startsWith('data:')) {
                  try {
                    const imageFile = dataURLtoFile(img, `step-${stepIndex}-${imgIndex}-${Date.now()}.png`);
                    return await uploadImageToFirebase(imageFile, 'guide-steps/images');
                  } catch (error) {
                    console.error(`단계 ${stepIndex + 1} 이미지 ${imgIndex + 1} 업로드 실패:`, error);
                    return img;
                  }
                }
                return img;
              })
            );
            updatedStep.images = uploadedImages;
          }

          // 단계별 동영상 업로드
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

      const newMethod: Method = {
        id: `user-${Date.now()}`,
        title: guideData.title,
        author: guideData.author,
        tag: guideData.tag,
        icon: iconMap[guideData.tag] || Sparkles,
        tagColor: tagColorMap[guideData.tag] || 'bg-blue-100 text-blue-700',
        description: guideData.description,
        steps: updatedSteps,
        tips: guideData.tips,
        tools: guideData.tools,
        references: guideData.references,
        image: uploadedImageUrl,
        video: uploadedVideoUrl || undefined,
        attachments: filteredAttachments,
        password: guideData.password,
      };

      // Save to Firebase
      // Firestore에 React 컴포넌트인 icon, tagColor 등을 넘길 수 없으므로 제외합니다.
      const { id: _, icon: __, tagColor: ___, ...guideDataToSave } = newMethod as any;
      const newId = await createFirebaseGuide(guideDataToSave);
      const newFirebaseMethod = { ...newMethod, id: newId };
      
      const updatedMethods = [newFirebaseMethod, ...methods];
      setMethods(updatedMethods);

      setIsUploading(false);
      setUploadProgress('');
      
      // Show success message
      alert('가이드가 성공적으로 공유되었습니다! 🎉');
    } catch (error) {
      console.error('가이드 생성 실패:', error);
      setIsUploading(false);
      setUploadProgress('');
      alert('가이드 생성 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  const handleUpdateMethod = async (updatedMethod: Method) => {
    const updatedMethods = methods.map(m => 
      m.id === updatedMethod.id ? updatedMethod : m
    );
    setMethods(updatedMethods);

    // Save to Firebase (기본 제공 가이드가 아닌 경우만)
    if (!defaultMethods.find(m => m.id === updatedMethod.id)) {
      try {
        const { id, icon, tagColor, ...updateData } = updatedMethod as any;
        await updateFirebaseGuide(updatedMethod.id, updateData);
      } catch (error) {
        console.error('Failed to update guide to Firebase:', error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation 
        onCreateGuideClick={() => setIsCreateGuideOpen(true)}
        onSearchClick={() => setIsSearchOpen(true)}
      />
      <Hero onSearchClick={() => setIsSearchOpen(true)} />
      <MethodGrid methods={methods} onUpdateMethod={handleUpdateMethod} />
      <Footer />
      <SearchDialog 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
        methods={methods}
      />
      <CreateGuideDialog
        isOpen={isCreateGuideOpen}
        onClose={() => setIsCreateGuideOpen(false)}
        onSubmit={handleCreateGuide}
        isUploading={isUploading}
        uploadProgress={uploadProgress}
      />
    </div>
  );
}